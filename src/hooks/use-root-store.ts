import { useContext } from 'react';
import { RootStore } from '../model/root-store';
import { RootContext } from './root-context';

export function useRootStore(): RootStore {
    const store = useContext(RootContext);
    if (!store) {
        throw new Error(`Expected root context to be supplied via <Provider>.`);
    }
    return store;
}
