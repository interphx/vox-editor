import { Action } from '../rendering/action';
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
                    new GroupStructure(':root:', true, [SimpleStructure.fromSingleBlock('structure0', 0, 0, 0, 1)])
                ),
                applyAction,
                project => project.clone(),
                (_project, snapshot) => snapshot.clone(),
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
