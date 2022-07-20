import { Canvas, ThreeEvent } from '@react-three/fiber';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowHelper, Camera, Face, Object3D, OrthographicCamera, PerspectiveCamera, Vector2, Vector3 } from 'three';
import { useForceRender } from './hooks/use-force-render';
import { useMemoized } from './hooks/use-memoized';
import { minBy } from './utilities/array';
import { Dictionary } from './utilities/dictionary';

function createCubeNode(x: number, y: number, z: number): JSX.Element {
    return (
        <mesh key={`${x};${y};${z}`} position={[x, y, z]}>
            {boxGeo}
            {testMaterial}
        </mesh>
    );
}

const boxGeo = <boxGeometry args={[1, 1, 1]} />;
const testMaterial = <meshPhongMaterial color={'orange'} />;

class NaiveMeshBuilder {
    private readonly data: Dictionary<[number, number, number], boolean> = new Dictionary(
        String,
        (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
    );
    private readonly callbacks: (() => void)[] = [];
    private readonly transactions: {
        readonly tempData: Dictionary<[number, number, number], boolean>;
    }[] = [];
    private readonly customObjects: JSX.Element[] = [];
    private readonly debugItems2d: Debug2d[] = [];

    createTransaction() {
        const tempData = this.data.clone();
        tempData.clear();
        //console.log(tempData);

        const transaction = {
            tempData,
            valid: true,
            set: (x: number, y: number, z: number, value: boolean) => {
                tempData.set([x, y, z], value);
                this.invalidate();
            },
            clear: () => {
                tempData.clear();
                this.invalidate();
            },
            commit: () => {
                this.data.extend(tempData);
                this.invalidate();
                const index = this.transactions.indexOf(transaction);
                if (index >= 0) this.transactions.splice(index, 1);
                transaction.tempData = null as any;
                transaction.valid = false;
                transaction.set = () => {
                    throw new Error(`Transaction is already committed`);
                };
                transaction.commit = () => {
                    throw new Error(`Transaction is already committed`);
                };
            }
        };

        this.transactions.push(transaction);

        return transaction;
    }

    invalidate() {
        for (const callback of this.callbacks) {
            callback();
        }
    }

    get(x: number, y: number, z: number): boolean {
        if (this.data.has([x, y, z])) return this.data.get([x, y, z]);
        return false;
    }

    set(x: number, y: number, z: number, value: boolean) {
        this.data.set([x, y, z], value);
        this.invalidate();
    }

    addCustomObject(obj: JSX.Element) {
        this.customObjects.push(obj);
        this.invalidate();
    }

    removeCustomObject(obj: JSX.Element) {
        const index = this.customObjects.indexOf(obj);
        if (index >= 0) this.customObjects.splice(index, 1);
        this.invalidate();
    }

    addDebugItem(item: Debug2d) {
        this.debugItems2d.push(item);
        this.invalidate();
    }

    removeDebugItem(item: Debug2d) {
        const index = this.debugItems2d.indexOf(item);
        if (index >= 0) this.debugItems2d.splice(index, 1);
        this.invalidate();
    }

    getDebugItems2d() {
        return this.debugItems2d;
    }

    isEmpty() {
        return this.data.size() === 0;
    }

    getMeshes() {
        const meshes: JSX.Element[] = [];
        const allEntries = [
            ...Array.from(this.data.entries()),
            ...this.transactions.flatMap(transaction => Array.from(transaction.tempData.entries()))
        ];
        //console.log(allEntries);
        for (const [[x, y, z], value] of allEntries) {
            if (!value) continue;
            meshes.push(createCubeNode(x, y, z));
        }
        meshes.push(...this.customObjects);
        return meshes;
    }

    subscribe(callback: () => void) {
        this.callbacks.push(callback);
    }

    unsubscribe(callback: () => void) {
        const index = this.callbacks.indexOf(callback);
        if (index >= 0) {
            this.callbacks.splice(index, 1);
        }
    }
}

function useMeshBuilder() {
    const mb = useMemoized(() => new NaiveMeshBuilder());
    const forceRender = useForceRender();
    useEffect(() => {
        mb.subscribe(forceRender);
        return () => mb.unsubscribe(forceRender);
    }, [forceRender, mb]);
    return mb;
}

const sceneGlobals = [
    <color key="bgcolor" attach="background" args={['darkblue']} />,
    <ambientLight key="ambientLight" intensity={0.2} />,
    <directionalLight key="directionalLight" intensity={1} position={[-1, 2, 4]} />
];

interface Interaction {
    move(event: PointerInteractionEvent): void;
    finish(): void;
}

type InteractionFactory = (event: PointerInteractionEvent, meshBuilder: NaiveMeshBuilder) => Interaction | null;

type Debug2d =
    | { readonly type: 'dot'; readonly color: string; readonly pos: Vector2 }
    | { readonly type: 'text'; readonly color: string; readonly pos: Vector2; readonly text: string };

const worldToVoxel = (worldPos: Vector3, faceNormal: Vector3): Vector3 =>
    worldPos.clone().sub(faceNormal.clone().multiplyScalar(0.5)).round().floor();

const projectToViewport = (vector: Vector3, camera: Camera): Vector2 => {
    const projected = vector.clone().project(camera);
    return new Vector2(projected.x, projected.y);
};

const pencil: InteractionFactory = (event, meshBuilder) => {
    if (!event.face || !event.worldPoint) return null;

    const transaction = meshBuilder.createTransaction();

    const placeVoxelOnFace = (worldPos: Vector3, faceNormal: Vector3) => {
        const voxelPos = worldToVoxel(worldPos, faceNormal);
        if (!meshBuilder.get(voxelPos.x, voxelPos.y, voxelPos.z)) return;
        const newVoxelPos = voxelPos.clone().add(faceNormal).floor();
        if (meshBuilder.get(newVoxelPos.x, newVoxelPos.y, newVoxelPos.z)) return;
        transaction.set(newVoxelPos.x, newVoxelPos.y, newVoxelPos.z, true);
    };

    placeVoxelOnFace(event.worldPoint, event.face.normal);

    return {
        move(event: PointerInteractionEvent) {
            if (!event.face || !event.worldPoint) return;

            const worldPos = event.worldPoint;
            const faceNormal = event.face.normal;

            placeVoxelOnFace(worldPos, faceNormal);
        },

        finish() {
            transaction.commit();
        }
    };
};

const extruder: InteractionFactory = (event, meshBuilder) => {
    if (!event.face || !event.worldPoint) return null;
    const worldStartVoxelPos = worldToVoxel(event.worldPoint, event.face.normal);
    const viewportStartVoxelPos = projectToViewport(worldStartVoxelPos, event.camera);
    const dirs = [
        new Vector3(-1, 0, 0),
        new Vector3(+1, 0, 0),
        new Vector3(0, -1, 0),
        new Vector3(0, +1, 0),
        new Vector3(0, 0, -1),
        new Vector3(0, 0, +1)
    ].map(worldVector => ({
        worldVector,
        viewportVectorRaw: projectToViewport(worldVector, event.camera),
        viewportVector: projectToViewport(worldVector, event.camera).normalize() //projectToViewport(worldStartVoxelPos.clone().add(worldVector), event.camera).normalize()
    }));

    const debugItems: Debug2d[] = [];

    const removeDebugItems = () => {
        for (let i = debugItems.length - 1; i >= 0; --i) meshBuilder.removeDebugItem(debugItems.pop()!);
    };

    const createDebugItems = (mouseVector: Vector2 | null) => {
        removeDebugItems();
        debugItems.push({
            type: 'dot',
            color: 'cyan',
            pos: viewportStartVoxelPos
        });
        if (mouseVector) {
            for (const dir of dirs) {
                const dot = Math.abs(1 - dir.viewportVector.dot(mouseVector));
                debugItems.push({
                    type: 'text',
                    color: 'white',
                    pos: viewportStartVoxelPos.clone().add(dir.viewportVectorRaw),
                    text: `${dot.toFixed(2)}`
                });
            }
        }
        for (const item of debugItems) meshBuilder.addDebugItem(item);
    };

    const transaction = meshBuilder.createTransaction();

    const helpers: JSX.Element[] = [];
    const createHelpers = (center: Vector3, active: typeof dirs[number] | null) => {
        removeHelpers();
        helpers.push(
            ...dirs.map(dir => (
                <Arrow3d
                    key={vecToString(dir.worldVector)}
                    startPosition={worldStartVoxelPos}
                    direction={dir.worldVector}
                    length={2}
                    color={dir === active ? 'lime' : '#DDDDDD'}
                />
            ))
        );
        for (const helper of helpers) meshBuilder.addCustomObject(helper);
    };

    const removeHelpers = () => {
        for (const helper of helpers) meshBuilder.removeCustomObject(helper);
        helpers.length = 0;
    };

    createHelpers(worldStartVoxelPos, null);
    createDebugItems(null);

    return {
        move(event) {
            const vector = event.viewportPoint.clone().sub(viewportStartVoxelPos).normalize();
            const direction = minBy(dirs, dir => Math.abs(1 - dir.viewportVector.dot(vector)));

            transaction.clear();

            const maxCubesToSpawn = 100;
            let spawned = 0;
            let pt = worldStartVoxelPos.clone();
            while (true) {
                if (spawned >= maxCubesToSpawn) break;
                spawned += 1;
                pt.add(direction.worldVector).round();
                const distanceFromNewVoxelToOriginalVoxelInViewport = projectToViewport(pt, event.camera).distanceTo(
                    viewportStartVoxelPos
                );
                const distanceFromPointerToOriginalVoxelInViewport =
                    event.viewportPoint.distanceTo(viewportStartVoxelPos);
                if (distanceFromNewVoxelToOriginalVoxelInViewport > distanceFromPointerToOriginalVoxelInViewport) break;
                transaction.set(pt.x, pt.y, pt.z, true);
            }
            pt.sub(direction.worldVector).round();

            createHelpers(pt, direction);
            createDebugItems(vector);
        },
        finish() {
            removeHelpers();
            removeDebugItems();
            transaction.commit();
        }
    };
};

const tools = {
    pencil,
    extruder
};

type ToolId = keyof typeof tools;

interface PointerInteractionEvent {
    object: Object3D | null;
    face: Face | null;
    worldPoint: Vector3 | null;
    viewportPoint: Vector2;
    camera: PerspectiveCamera | OrthographicCamera;
}

function Arrow3d(props: { startPosition: Vector3; direction: Vector3; length: number; color: string }) {
    const { startPosition, direction, length, color } = props;
    const ref = useRef<ArrowHelper | null>(null);
    useEffect(() => {
        if (!ref.current) return;
        ref.current.setDirection(direction);
        ref.current.setLength(length);
        ref.current.setColor(color);
    }, [color, direction, length]);
    return <arrowHelper ref={ref} position={startPosition} renderOrder={-1} />;
}

function View3d2(props: {
    readonly meshes: readonly JSX.Element[];
    readonly onDown: (event: PointerInteractionEvent) => void;
    readonly onMove: (event: PointerInteractionEvent) => void;
    //readonly onUp: (event: PointerInteractionEvent) => void,
    readonly debugLines: readonly string[];
    readonly debugItems2d: readonly Debug2d[];
}) {
    const { onDown, onMove, meshes, debugLines, debugItems2d } = props;

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
                </group>
            </Canvas>
            {debugItems2d.map((item, index) => (
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
                        backgroundColor: item.type === 'dot' ? item.color : undefined,
                        borderRadius: item.type === 'dot' ? '50%' : undefined
                    }}
                >
                    {item.type === 'text' ? item.text : ''}
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
        </div>
    );
}

function vecToString(vector: Vector2 | Vector3) {
    return vector
        .toArray()
        .map(n => n.toFixed(2))
        .join(', ');
}

function useInteraction(toolId: ToolId, meshBuilder: NaiveMeshBuilder) {
    const [interactionActive, setInteractionActive] = useState(false);
    const interactionRef = useRef<Interaction | null>(null);

    const startInteraction = useCallback(
        (event: PointerInteractionEvent) => {
            if (interactionRef.current) return;
            const interaction = tools[toolId](event, meshBuilder);
            if (!interaction) return;

            interactionRef.current = interaction;
            setInteractionActive(true);

            const finish = () => {
                console.log('Finish called');
                interaction.finish();
                setInteractionActive(false);
                interactionRef.current = null;
                window.removeEventListener('pointerup', finish);
                window.removeEventListener('blur', finish);
            };

            window.addEventListener('pointerup', finish);
            window.addEventListener('blur', finish);
        },
        [interactionRef, toolId, meshBuilder]
    );

    const updateInteraction = useCallback(
        (event: PointerInteractionEvent) => {
            if (!interactionRef.current) return;
            interactionRef.current.move(event);
        },
        [interactionRef]
    );

    return { startInteraction, updateInteraction, interactionActive };
}

export function View3d() {
    const meshBuilder = useMeshBuilder();
    (window as any).meshBuilder = meshBuilder;
    const [latestEvent, setLatestEvent] = useState<PointerInteractionEvent | null>(null);
    const [toolId, setToolId] = useState<ToolId>('extruder');
    const { startInteraction, updateInteraction, interactionActive } = useInteraction(toolId, meshBuilder);

    useEffect(() => {
        if (meshBuilder.isEmpty()) {
            meshBuilder.set(2, 0, 0, true);
        }
    }, [meshBuilder]);

    const handleDown = useCallback(
        (event: PointerInteractionEvent) => {
            setLatestEvent(event);
            startInteraction(event);
        },
        [startInteraction]
    );

    const handleMove = useCallback(
        (event: PointerInteractionEvent) => {
            setLatestEvent(event);
            updateInteraction(event);
        },
        [updateInteraction]
    );

    const debugLines = [
        latestEvent?.face ? `Face: ${vecToString(latestEvent.face.normal)}` : `Face:   -`,
        latestEvent?.object ? `Object: ${latestEvent.object.id}` : `Object:   -`,
        latestEvent?.worldPoint ? `Point: ${vecToString(latestEvent.worldPoint)}` : `Point:   -`,
        latestEvent?.viewportPoint ? `Pointer: ${vecToString(latestEvent.viewportPoint)}` : `Pointer:   -`,
        interactionActive ? `Tool: ${toolId} (active)` : `Tool ${toolId}`
    ];

    return (
        <View3d2
            onDown={handleDown}
            onMove={handleMove}
            debugLines={debugLines}
            meshes={meshBuilder.getMeshes()}
            debugItems2d={meshBuilder.getDebugItems2d()}
        />
    );
}
