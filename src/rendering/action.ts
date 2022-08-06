import { Vector3 } from 'three';
import { StructureId } from '../structure';

interface SetBlockAction {
    readonly type: 'SetBlock';
    readonly structureId: StructureId;
    readonly position: Vector3;
    readonly blockId: number;
}

interface BatchAction {
    readonly type: 'Batch';
    readonly actions: readonly Action[];
}

export type Action = SetBlockAction | BatchAction;
