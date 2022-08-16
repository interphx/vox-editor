import { Vector3 } from 'three';
import { Structure, StructureId } from '../structure';

interface SetBlockAction {
    readonly type: 'SetBlock';
    readonly structureId: StructureId;
    readonly position: Vector3;
    readonly blockId: number;
}

interface AddStructureAction {
    readonly type: 'AddStructure';
    readonly structure: Structure;
}

interface RemoveStructureAction {
    readonly type: 'RemoveStructure';
    readonly structureId: StructureId;
}

interface SetStructureVisibilityAction {
    readonly type: 'SetStructureVisibility';
    readonly structureId: StructureId;
    readonly visible: boolean;
}

interface BatchAction {
    readonly type: 'Batch';
    readonly actions: readonly Action[];
}

export type Action =
    | SetBlockAction
    | AddStructureAction
    | RemoveStructureAction
    | SetStructureVisibilityAction
    | BatchAction;
