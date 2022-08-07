import { useEffect, useMemo } from 'react';
import { Action } from '../rendering/action';
import { MutableWorld } from '../rendering/world';
import { SimpleActionHistory } from '../utilities/action-history';
import { useForceRender } from './use-force-render';

export function applyAction(world: MutableWorld, action: Action) {
    switch (action.type) {
        case 'SetBlock': {
            const { x, y, z } = action.position;
            world.setBlock(action.structureId, x, y, z, action.blockId);
            break;
        }
        case 'AddStructure': {
            world.addStructure(action.structure);
            break;
        }
        case 'RemoveStructure': {
            world.removeStructure(action.structureId);
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
        world => world.clone(),
        (_world, snapshot) => snapshot.clone(),
        5
    );
}

export function useWorldHistory(world: MutableWorld) {
    const forceRender = useForceRender();
    const history = useMemo(() => createWorldHistory(world), [world]);
    useEffect(() => {
        const subscription = history.onChange.subscribe(forceRender);
        return () => subscription.unsubscribe();
    });

    return history;
}
