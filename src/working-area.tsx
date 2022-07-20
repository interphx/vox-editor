import { useCallback, useEffect, useState } from 'react';
import { Vector3 } from 'three';
import { useInteraction } from './hooks/use-interaction';
import { useMeshBuilder } from './hooks/use-mesh-builder';
import { useWorldHistory } from './hooks/use-world-history';
import { World } from './rendering/world';
import { ToolId } from './tools';
import { PointerInteractionEvent } from './ui/pointer-interaction-event';
import { View3d } from './ui/view-3d';
import { vecToString } from './utilities/vector';

export function WorkingArea() {
    const worldHistory = useWorldHistory(useMeshBuilder());
    (window as any).worldHistory = worldHistory;
    const [latestEvent, setLatestEvent] = useState<PointerInteractionEvent | null>(null);
    const [toolId, setToolId] = useState<ToolId>('extruder');
    const { startInteraction, updateInteraction, interactionActive, interactionGizmos } = useInteraction(
        toolId,
        worldHistory
    );

    useEffect(() => {
        const world: World = worldHistory.getCurrent();
        if (world.isEmpty()) {
            worldHistory.apply({ type: 'SetBlock', position: new Vector3(2, 0, 0), blockId: 1 });
        }

        const undoListener = (event: KeyboardEvent) => {
            console.log(event.key, event.code);
            const actions = {
                KeyZ: () => {
                    if (worldHistory.canUndo()) {
                        console.log(`Undo`);
                        worldHistory.undo();
                    } else {
                        console.log(`No actions to undo`);
                    }
                },
                KeyY: () => {
                    if (worldHistory.canRedo()) {
                        console.log(`Redo`);
                        worldHistory.redo();
                    } else {
                        console.log(`No actions to redo`);
                    }
                }
            };

            if (event.ctrlKey && event.code in actions) {
                event.preventDefault();
                event.stopPropagation();
                actions[event.code as keyof typeof actions]();
            }
        };

        window.addEventListener('keydown', undoListener, { capture: true });
        return () => window.removeEventListener('keydown', undoListener, { capture: true });
    }, [worldHistory]);

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
        <View3d
            onDown={handleDown}
            onMove={handleMove}
            debugLines={debugLines}
            meshes={worldHistory.getCurrent().getMeshes()}
            onToolSelect={setToolId}
            selectedToolId={toolId}
            gizmos={interactionGizmos}
        />
    );
}
