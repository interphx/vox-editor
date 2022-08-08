import { action, autorun, makeObservable, observable, runInAction } from 'mobx';
import { GroupStructure, SimpleStructure, StructureId } from '../structure';
import { BlockId, Structure } from '../structure/structure';
import { ActionHistory, SimpleActionHistory } from '../utilities/action-history';
import { Action } from './action';
import { Palette } from './palette';
import { ProjectStore } from './project-store';

export class RootStore {
    constructor(
        private selectedStructureId: StructureId,
        private selectedBlockId: BlockId,
        private history: ActionHistory<ProjectStore, Action>
    ) {
        makeObservable<RootStore, 'selectedStructureId' | 'selectedBlockId' | 'history' | 'ensureValidity'>(this, {
            selectedStructureId: observable.ref,
            selectedBlockId: observable.ref,
            history: observable.ref,
            selectStructure: action,
            selectBlockType: action,
            ensureValidity: action
        });

        autorun(() => {
            this.ensureValidity();
        });
    }

    getSelectedStructureId(): StructureId {
        return this.selectedStructureId;
    }

    selectStructure(structureId: StructureId) {
        const project = this.getHistory().getCurrent();
        if (!project.getRoot().isOrContains(structureId)) {
            throw new Error(`Structure ${structureId} is not a part of the hierarchy.`);
        }
        this.selectedStructureId = structureId;
    }

    getSelectedBlockId(): BlockId {
        return this.selectedBlockId;
    }

    selectBlockType(blockId: BlockId) {
        const project = this.getHistory().getCurrent();
        if (project.getPalette().getById(blockId) === null) {
            throw new Error(`Block type ${blockId} is not a part of the palette.`);
        }
        this.selectedBlockId = blockId;
    }

    getHistory() {
        return this.history;
    }

    private ensureValidity() {
        const project = this.getHistory().getCurrent();
        const root = project.getRoot();
        const palette = project.getPalette();
        if (!root.isOrContains(this.selectedStructureId)) {
            this.selectedStructureId = getDefaultSelectedStructureId(root);
        }
        if (palette.getById(this.selectedBlockId) === null) {
            this.selectedBlockId = getDefaultSelectedBlockId(palette);
        }
    }
}

export function createDefaultRootStore() {
    const firstStructure = SimpleStructure.fromSingleBlock('structure0', 0, 0, 0, 1);
    const rootStructure = new GroupStructure(':root:', true, [firstStructure]);
    const defaultPalette = Palette.fromColorList(['orange', 'cyan', 'green', 'pink']);
    const initialProjectState = new ProjectStore(rootStructure, defaultPalette);
    const history = new SimpleActionHistory(
        initialProjectState,
        applyAction,
        project => project.clone(),
        (_project, snapshot) => snapshot.clone(),
        5
    );
    return new RootStore('structure0', 1, history);
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
            runInAction(() => {
                for (const subaction of action.actions) {
                    applyAction(project, subaction);
                }
            });
            break;
        }
    }
    return project;
}

function getDefaultSelectedStructureId(root: Structure) {
    if (root.canHaveChildren()) {
        const children = root.getChildren();
        if (children.length > 0) return children[0].id;
    }
    return root.id;
}

function getDefaultSelectedBlockId(palette: Palette) {
    const items = palette.getAll();
    if (items.length === 0) {
        throw new Error(`Expected palette to have at least 1 block type.`);
    }
    return items[0].id;
}