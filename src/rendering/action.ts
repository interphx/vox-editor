import { Vector3 } from 'three';

interface SetBlockAction {
    readonly type: 'SetBlock';
    readonly position: Vector3;
    readonly blockId: number;
}

interface BatchAction {
    readonly type: 'Batch';
    readonly actions: readonly Action[];
}

export type Action = SetBlockAction | BatchAction;
