import { Canvas, ThreeEvent } from '@react-three/fiber';
import { useCallback, useMemo, useRef } from 'react';
import { Color, Face, Object3D, OrthographicCamera, PerspectiveCamera, Vector2, Vector3 } from 'three';
import { UiColor, UiSize } from '../design';
import { Gizmo, isGizmo2d, isGizmo3d } from '../rendering/gizmo';
import { ToolId, tools } from '../tools';
import { vecToString } from '../utilities/vector';
import { PointerInteractionEvent } from './pointer-interaction-event';
import { ToolButton } from './tool-button';

const sceneGlobals = [
    <color key="bgcolor" attach="background" args={[new Color(UiColor.background)]} />,
    <ambientLight key="ambientLight" intensity={0.2} />,
    <directionalLight key="directionalLight" intensity={1} position={[-1, 2, 4]} />
];

export function View3d(props: {
    readonly selectedToolId: ToolId;
    readonly meshes: readonly JSX.Element[];
    readonly onDown: (event: PointerInteractionEvent) => void;
    readonly onMove: (event: PointerInteractionEvent) => void;
    readonly onToolSelect: (tool: ToolId) => void;
    readonly debugLines: readonly string[];
    readonly gizmos: readonly Gizmo[];
}) {
    const { onDown, onMove, onToolSelect, meshes, debugLines, selectedToolId, gizmos } = props;

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const cameraRef = useRef<PerspectiveCamera | OrthographicCamera | null>(null);
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

    const createEventData = (data: Pick<PointerInteractionEvent, 'viewportPoint'>): PointerInteractionEvent => {
        if (!cameraRef.current) throw new Error(`Camera not initialized`);
        return {
            object: latestHoveredObjectData.current.object,
            face: latestHoveredObjectData.current.face,
            worldPoint: latestHoveredObjectData.current.worldPoint,
            camera: cameraRef.current,
            ...data
        };
    };

    const handleDomMove = useCallback(
        (event: React.MouseEvent) => {
            if (!cameraRef.current) return;
            if (event.target !== canvasRef.current) return;
            const rect = (event.target as HTMLElement).getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
            onMove(createEventData({ viewportPoint: new Vector2(x, -y) }));
        },
        [onMove]
    );

    const handleThreeMove = useCallback(
        (event: ThreeEvent<MouseEvent>) => {
            latestHoveredObjectData.current.object = event.object;
            latestHoveredObjectData.current.face = event.face ?? null;
            latestHoveredObjectData.current.worldPoint = event.point;
            onMove(createEventData({ viewportPoint: event.pointer }));
        },
        [onMove]
    );

    const handleThreeDown = useCallback(
        (event: ThreeEvent<MouseEvent>) => {
            latestHoveredObjectData.current.object = event.object;
            latestHoveredObjectData.current.face = event.face ?? null;
            latestHoveredObjectData.current.worldPoint = event.point;
            onDown(createEventData({ viewportPoint: event.pointer }));
        },
        [onDown]
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
        [onDown]
    );

    const handleThreeLeave = useCallback((event: ThreeEvent<MouseEvent>) => {
        latestHoveredObjectData.current.object = null;
        latestHoveredObjectData.current.face = null;
        latestHoveredObjectData.current.worldPoint = null;
    }, []);

    return (
        <div style={{ height: '100vh' }} onMouseMove={handleDomMove}>
            <Canvas
                camera={{ position: [3, 3, 4] }}
                ref={canvasRef}
                onCreated={event => {
                    cameraRef.current = event.camera;
                }}
            >
                {sceneGlobals}
                <group
                    onPointerDown={event => {
                        handleThreeDown(event);
                        console.log(event.point.clone().project(cameraRef.current!));
                    }}
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
            {Object.entries(tools).map(([toolId, tool], index) => (
                <ToolButton
                    key={toolId}
                    style={{
                        position: 'absolute',
                        bottom: `calc(${UiSize.M} + (${UiSize.L} + ${UiSize.XS}) * ${index})`,
                        left: UiSize.M
                    }}
                    active={selectedToolId === toolId}
                    onClick={() => onToolSelect(toolId as ToolId)}
                >
                    {toolId.toUpperCase().charAt(0)}
                </ToolButton>
            ))}
        </div>
    );
}
