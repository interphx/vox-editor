import { Canvas, ThreeEvent } from '@react-three/fiber';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Color, Face, Object3D, OrthographicCamera, PerspectiveCamera, Vector2, Vector3 } from 'three';
import { OrbitControls } from '../controls/orbit-gizmo-controls';
import { UiColor } from '../design';
import { Gizmo, isGizmo2d, isGizmo3d } from '../rendering/gizmo';
import { ToolId } from '../tools';
import { vecToString } from '../utilities/vector';
import { PointerInteractionEvent } from './pointer-interaction-event';

const sceneGlobals = [
    <color key="bgcolor" attach="background" args={[new Color(UiColor.background)]} />,
    <ambientLight key="ambientLight" intensity={0.2} />,
    <directionalLight key="directionalLight" intensity={1} position={[-1, 2, 4]} />
];

export function View3d(props: {
    className?: string;
    style?: React.HTMLAttributes<HTMLDivElement>['style'];
    actions: JSX.Element;
    selectedToolId: ToolId;
    meshes: readonly JSX.Element[];
    onDown: (event: PointerInteractionEvent) => void;
    onMove: (event: PointerInteractionEvent) => void;
    onToolSelect: (tool: ToolId) => void;
    debugLines: readonly string[];
    gizmos: readonly Gizmo[];
    enableControls: boolean;
}) {
    const { onDown, onMove, meshes, debugLines, enableControls, gizmos, actions, style, className } = props;

    // These are intentionally states and not refs, so that their changes
    // trigger re-rendering.
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
    const [camera, setCamera] = useState<PerspectiveCamera | OrthographicCamera>(() => {
        const camera = new PerspectiveCamera();
        camera.position.set(3, 3, 4);
        return camera;
    });
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
            latestHoveredObjectData.current.object = event.object;
            latestHoveredObjectData.current.face = event.face ?? null;
            latestHoveredObjectData.current.worldPoint = event.point;
            onDown(createEventData({ viewportPoint: event.pointer }));
        },
        [createEventData, onDown]
    );

    const handleThreeMissed = useCallback(
        (event: MouseEvent) => {
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

    const orbitControlsRef = useRef<OrbitControls | null>(null);
    useEffect(() => {
        if (!canvas) return () => {};
        const controls = new OrbitControls(camera, canvas);
        console.log('Created new controls');
        orbitControlsRef.current = controls;
        return () => orbitControlsRef.current?.dispose();
    }, [camera, canvas]);

    useEffect(() => {
        if (!orbitControlsRef.current) return;
        orbitControlsRef.current.enabled = enableControls;
        console.log(`Set enabled to ${orbitControlsRef.current.enabled}`);
    }, [enableControls]);

    return (
        <div style={{ height: '100vh', ...style }} className={className} onMouseMove={handleDomMove}>
            <Canvas camera={camera} ref={element => setCanvas(element)} onCreated={event => setCamera(event.camera)}>
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
            {gizmos2d.map((item, index) => (
                <div
                    key={index + '' + vecToString(item.pos)}
                    style={{
                        width: '16px',
                        height: '16px',
                        position: 'absolute',
                        top: `${((1 - item.pos.y) / 2) * 100}%`,
                        left: `${((item.pos.x + 1) / 2) * 100}%`,
                        transform: 'translate(-50%, -50%)',
                        color: item.color,
                        backgroundColor: item.type === '2d-dot' ? item.color : undefined,
                        borderRadius: item.type === '2d-dot' ? '50%' : undefined
                    }}
                >
                    {item.type === '2d-text' ? item.text : ''}
                </div>
            ))}
            <div
                style={{
                    position: 'absolute',
                    top: '15px',
                    left: '15px',
                    color: 'white',
                    userSelect: 'none'
                }}
            >
                {debugLines.map(line => (
                    <div key={line}>{line}</div>
                ))}
            </div>
            {actions}
        </div>
    );
}
