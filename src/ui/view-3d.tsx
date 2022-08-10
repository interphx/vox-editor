import { Canvas, ThreeEvent } from '@react-three/fiber';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { Color, Face, Object3D, OrthographicCamera, PerspectiveCamera, Vector2, Vector3 } from 'three';
import { UiColor } from '../design';
import { useOrbitControls } from '../hooks/use-orbit-comtrols';
import { Gizmo, isGizmo2d, isGizmo3d } from '../model/gizmo';
import { ToolId } from '../tools';
import { Gizmo2dView } from './gizmo-2d-view';
import { PointerInteractionEvent } from './pointer-interaction-event';

export function View3d(props: {
    className?: string;
    style?: React.HTMLAttributes<HTMLDivElement>['style'];
    actions: JSX.Element;
    selectedToolId: ToolId;
    meshes: readonly JSX.Element[];
    onDown: (event: PointerInteractionEvent) => void;
    onMove: (event: PointerInteractionEvent) => void;
    onToolSelect: (tool: ToolId) => void;
    gizmos: readonly Gizmo[];
    enableControls: boolean;
}) {
    const { onDown, onMove, meshes, enableControls, gizmos, actions, style, className } = props;

    // These are intentionally states and not refs, so that their changes
    // trigger re-rendering.
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
    const [camera, setCamera] = useState<PerspectiveCamera | OrthographicCamera>(() => {
        const camera = new PerspectiveCamera();
        camera.position.set(8, 8, 10);
        camera.lookAt(0, 0, 0);
        return camera;
    });
    useOrbitControls(canvas, camera, enableControls);

    const latestHoveredObjectData = useRef<{
        object: Object3D | null;
        face: Face | null;
        worldPoint: Vector3 | null;
    }>({
        object: null,
        face: null,
        worldPoint: null
    });
    const gizmos3d = useMemo(() => gizmos.filter(isGizmo3d).map(gizmo => gizmo.threeElement), [gizmos]);
    const gizmos2d = useMemo(() => gizmos.filter(isGizmo2d), [gizmos]);

    const createEventData = useCallback(
        (data: Pick<PointerInteractionEvent, 'viewportPoint'>): PointerInteractionEvent => {
            if (!camera) throw new Error(`Camera is not initialized`);
            return {
                object: latestHoveredObjectData.current.object,
                face: latestHoveredObjectData.current.face,
                worldPoint: latestHoveredObjectData.current.worldPoint,
                camera,
                ...data
            };
        },
        [camera]
    );

    const handleDomMove = useCallback(
        (event: React.MouseEvent) => {
            if (!camera) return;
            if (event.target !== canvas) return;
            const rect = (event.target as HTMLElement).getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
            onMove(createEventData({ viewportPoint: new Vector2(x, -y) }));
        },
        [camera, canvas, createEventData, onMove]
    );

    const handleThreeMove = useCallback(
        (event: ThreeEvent<MouseEvent>) => {
            latestHoveredObjectData.current.object = event.object;
            latestHoveredObjectData.current.face = event.face ?? null;
            latestHoveredObjectData.current.worldPoint = event.point;
            onMove(createEventData({ viewportPoint: event.pointer }));
        },
        [createEventData, onMove]
    );

    const handleThreeDown = useCallback(
        (event: ThreeEvent<MouseEvent>) => {
            if (event.nativeEvent.button !== 0) return;
            latestHoveredObjectData.current.object = event.object;
            latestHoveredObjectData.current.face = event.face ?? null;
            latestHoveredObjectData.current.worldPoint = event.point;
            onDown(createEventData({ viewportPoint: event.pointer }));
        },
        [createEventData, onDown]
    );

    const handleThreeMissed = useCallback(
        (event: MouseEvent) => {
            if (event.button !== 0) return;
            latestHoveredObjectData.current.object = null;
            latestHoveredObjectData.current.face = null;
            latestHoveredObjectData.current.worldPoint = null;
            const rect = (event.target as HTMLElement).getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
            onDown(createEventData({ viewportPoint: new Vector2(x, -y) }));
        },
        [createEventData, onDown]
    );

    const handleThreeLeave = useCallback((event: ThreeEvent<MouseEvent>) => {
        latestHoveredObjectData.current.object = null;
        latestHoveredObjectData.current.face = null;
        latestHoveredObjectData.current.worldPoint = null;
    }, []);

    return (
        <Container
            style={style}
            className={className}
            onMouseMoveCapture={handleDomMove}
            onContextMenuCapture={event => event.preventDefault()}
        >
            <Canvas
                frameloop="always"
                camera={camera}
                ref={element => setCanvas(element)}
                onCreated={event => setCamera(event.camera)}
            >
                {sceneGlobals}
                <group
                    onPointerDown={handleThreeDown}
                    onPointerMove={handleThreeMove}
                    onPointerLeave={handleThreeLeave}
                    onPointerMissed={handleThreeMissed}
                >
                    {meshes}
                    {gizmos3d}
                </group>
            </Canvas>
            {gizmos2d.map((gizmo, index) => (
                <Gizmo2dView key={index} gizmo={gizmo} />
            ))}
            {actions}
        </Container>
    );
}

const Container = styled.div`
    height: 100vh;
    flex: 1 1 1px;
    position: relative;
    overflow: hidden;
    min-width: 0;
    min-height: 0;
`;

const sceneGlobals = [
    <color key="bgcolor" attach="background" args={[new Color(UiColor.background)]} />,
    <ambientLight key="ambientLight" intensity={0.2} />,
    <directionalLight key="directionalLight" intensity={1} position={[-1, 2, 4]} />
];
