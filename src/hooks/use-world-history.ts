import { useMemo } from 'react';
import { Action } from '../rendering/action';
import { MutableWorld } from '../rendering/world';
import { SimpleActionHistory } from '../utilities/action-history';

export function applyAction(world: MutableWorld, action: Action) {
    switch (action.type) {
        case 'SetBlock': {
            const { x, y, z } = action.position;
            world.setBlock('xxx', x, y, z, action.blockId);
            break;
        }
        case 'Batch': {
            for (const subaction of action.actions) {
                applyAction(world, subaction);
            }
            break;
        }
    }
    return world;
}

export function createWorldHistory(initialState: MutableWorld) {
    return new SimpleActionHistory(
        initialState,
        applyAction,
        world => world.snapshot(),
        (world, snapshot) => {
            world.restoreSnapshot(snapshot);
            return world;
        },
        5
    );
}

export function useWorldHistory(world: MutableWorld) {
    const history = useMemo(() => createWorldHistory(world), [world]);

    return history;
}
