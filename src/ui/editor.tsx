import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { UiColor } from '../design';
import { useInteraction } from '../hooks/use-interaction';
import { useRootStore } from '../hooks/use-root-store';
import { ToolId, tools } from '../tools';
import { ActionBar } from './action-bar';
import { BlockTypePicker } from './color-picker';
import { Cursor3d } from './cursor-3d';
import { DebugView } from './debug-view';
import { PointerInteractionEvent } from './pointer-interaction-event';
import { ProjectActions } from './project-actions';
import { SceneView } from './scene-view';
import { StructureTreeView } from './structure-tree-view';
import { ToolButton } from './tool-button';

export const Editor = observer(function WorkingArea() {
    const rootStore = useRootStore();
    const projectHistory = rootStore.getHistory();
    const [toolId, setToolId] = useState<ToolId>('extruder');
    const { startInteraction, updateInteraction, interactionActive, interactionGizmos } = useInteraction(
        toolId,
        rootStore
    );
    const project = projectHistory.getCurrent();

    useEffect(() => {
        const undoListener = (event: KeyboardEvent) => {
            const actions = {
                KeyZ: () => {
                    if (projectHistory.canUndo()) {
                        projectHistory.undo();
                    }
                },
                KeyY: () => {
                    if (projectHistory.canRedo()) {
                        projectHistory.redo();
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

    const updateDebugData = useCallback(
        (event: PointerInteractionEvent) => {
            rootStore.updateDebugData({
                face: event.face,
                threeObject: event.object,
                worldPoint: event.worldPoint,
                viewportPoint: event.viewportPoint
            });
        },
        [rootStore]
    );

    const handleDown = useCallback(
        (event: PointerInteractionEvent) => {
            updateDebugData(event);
            startInteraction(event);
        },
        [startInteraction, updateDebugData]
    );

    const handleMove = useCallback(
        (event: PointerInteractionEvent) => {
            updateDebugData(event);
            updateInteraction(event);
        },
        [updateDebugData, updateInteraction]
    );

    const meshes = (
        <>
            {project.meshes}
            {!interactionActive && <Cursor3d />}
        </>
    );

    return (
        <Container>
            <SceneView
                onDown={handleDown}
                onMove={handleMove}
                meshes={meshes}
                onToolSelect={setToolId}
                selectedToolId={toolId}
                gizmos={interactionGizmos}
                enableControls={!interactionActive}
                actions={
                    <ActionBar>
                        {tools.map(({ id, icon }) => (
                            <ToolButton key={id} title={id} active={id === toolId} onClick={() => setToolId(id)}>
                                <FontAwesomeIcon icon={icon} />
                            </ToolButton>
                        ))}
                        <BlockTypePicker />
                    </ActionBar>
                }
            />
            <Sidebar>
                <StructureTreeView />
                <DebugView />
                <ProjectActions />
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
    width: 250px;
    flex: 0 0 250px;
    max-height: 100vh;
    box-sizing: border-box;
    background: ${UiColor.sidebar};
`;
