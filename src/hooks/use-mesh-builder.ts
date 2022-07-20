import { useEffect } from 'react';
import { NaiveMeshBuilder } from '../rendering/naive-mesh-builder';
import { useForceRender } from './use-force-render';
import { useMemoized } from './use-memoized';

export function useMeshBuilder() {
    const mb = useMemoized(() => new NaiveMeshBuilder(null));
    const forceRender = useForceRender();
    useEffect(() => {
        mb.subscribe(forceRender);
        return () => mb.unsubscribe(forceRender);
    }, [forceRender, mb]);
    return mb;
}
