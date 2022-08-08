import { Action } from '../rendering/action';
import { Palette } from '../rendering/palette';
import { ProjectStore } from '../rendering/project-store';
import { GroupStructure, SimpleStructure } from '../structure';
import { SimpleActionHistory } from '../utilities/action-history';
import { useMemoized } from './use-memoized';

export function useProjectHistory() {
    return useMemoized(
        () =>
            new SimpleActionHistory(
                new ProjectStore(
                    'structure0',
                    new GroupStructure(':root:', true, [SimpleStructure.fromSingleBlock('structure0', 0, 0, 0, 1)]),
                    Palette.fromColorList(['orange', 'cyan', 'green', 'pink']),
                    1
                ),
                applyAction,
                project => project.clone(),
                (project, snapshot) => {
                    const result = snapshot.clone();

                    if (result.getRoot().isOrContains(project.activeStructureId)) {
                        result.selectStructure(project.activeStructureId);
                        result.activeStructureId = project.activeStructureId;
                    }

                    return result;
                },
                5
            )
    );
}

function applyAction(project: ProjectStore, action: Action): ProjectStore {
    switch (action.type) {
        case 'SetBlock': {
            const { x, y, z } = action.position;
            project.setBlock(action.structureId, x, y, z, action.blockId);
            break;
        }
        case 'AddStructure': {
            project.addStructure(action.structure);
            break;
        }
        case 'RemoveStructure': {
            project.removeStructure(action.structureId);
            break;
        }
        case 'Batch': {
            for (const subaction of action.actions) {
                applyAction(project, subaction);
            }
            break;
        }
    }
    return project;
}
