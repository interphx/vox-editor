import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useInteraction } from './hooks/use-interaction';
import { useMeshBuilder } from './hooks/use-mesh-builder';
import { useWorldHistory } from './hooks/use-world-history';
import { ToolId } from './tools';
import { PointerInteractionEvent } from './ui/pointer-interaction-event';
import { StructureTreeView } from './ui/structure-tree-view';
import { View3d } from './ui/view-3d';
import { vecToString } from './utilities/vector';

export function WorkingArea() {
    const worldHistory = useWorldHistory(useMeshBuilder());
    (window as any).worldHistory = worldHistory;
    const [latestEvent, setLatestEvent] = useState<PointerInteractionEvent | null>(null);
    const [toolId, setToolId] = useState<ToolId>('extruder');
    const [activeStructureId, setActiveStructureId] = useState(worldHistory.getCurrent().getDefaultStructureId());
    const { startInteraction, updateInteraction, interactionActive, interactionGizmos } = useInteraction(
        toolId,
        activeStructureId,
        worldHistory
    );

    useEffect(() => {
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
        <Container>
            <View3d
                style={{ flex: '1 1 1px' }}
                onDown={handleDown}
                onMove={handleMove}
                debugLines={debugLines}
                meshes={worldHistory.getCurrent().getMeshes()}
                onToolSelect={setToolId}
                selectedToolId={toolId}
                gizmos={interactionGizmos}
            />
            <Sidebar style={{ width: '200px', flex: '0 0 200px' }}>
                <StructureTreeView
                    activeStructureId={activeStructureId}
                    onItemSelect={structure => setActiveStructureId(structure.id)}
                    history={worldHistory}
                    world={worldHistory.getCurrent()}
                    root={worldHistory.getCurrent().getRoot()}
                />
            </Sidebar>
        </Container>
    );
}

const Container = styled.div`
    display: flex;
    flex-direction: row;
`;

const Sidebar = styled.div`
    display: flex;
    flex-direction: column;
`;
