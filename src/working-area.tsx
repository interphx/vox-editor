import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useInteraction } from './hooks/use-interaction';
import { useRootStore } from './hooks/use-root-store';
import { ToolId, tools } from './tools';
import { ActionBar } from './ui/action-bar';
import { BlockTypePicker } from './ui/color-picker';
import { PointerInteractionEvent } from './ui/pointer-interaction-event';
import { StructureTreeView } from './ui/structure-tree-view';
import { ToolButton } from './ui/tool-button';
import { View3d } from './ui/view-3d';
import { vecToString } from './utilities/vector';

export const WorkingArea = observer(function WorkingArea() {
    const rootStore = useRootStore();
    const projectHistory = rootStore.getHistory();
    const [latestEvent, setLatestEvent] = useState<PointerInteractionEvent | null>(null);
    const [toolId, setToolId] = useState<ToolId>('extruder');
    const { startInteraction, updateInteraction, interactionActive, interactionGizmos } = useInteraction(
        toolId,
        rootStore
    );
    const project = projectHistory.getCurrent();

    useEffect(() => {
        const undoListener = (event: KeyboardEvent) => {
            console.log(event.key, event.code);
            const actions = {
                KeyZ: () => {
                    if (projectHistory.canUndo()) {
                        console.log(`Undo`);
                        projectHistory.undo();
                    } else {
                        console.log(`No actions to undo`);
                    }
                },
                KeyY: () => {
                    if (projectHistory.canRedo()) {
                        console.log(`Redo`);
                        projectHistory.redo();
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
    }, [projectHistory]);

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
                meshes={project.getMeshes()}
                onToolSelect={setToolId}
                selectedToolId={toolId}
                gizmos={interactionGizmos}
                enableControls={!interactionActive}
                actions={
                    <ActionBar>
                        {Object.entries(tools).map(([itemId, tool], index) => (
                            <ToolButton
                                key={itemId}
                                active={itemId === toolId}
                                onClick={() => setToolId(itemId as ToolId)}
                            >
                                {itemId.toUpperCase().charAt(0)}
                            </ToolButton>
                        ))}
                        <BlockTypePicker />
                    </ActionBar>
                }
            />
            <Sidebar style={{ width: '200px', flex: '0 0 200px' }}>
                <StructureTreeView />
            </Sidebar>
        </Container>
    );
});

const Container = styled.div`
    display: flex;
    flex-direction: row;
`;

const Sidebar = styled.div`
    display: flex;
    flex-direction: column;
`;
