import { useEffect } from 'react';
import { NaiveMeshBuilder } from '../rendering/naive-mesh-builder';
import { SimpleStructure } from '../structure';
import { GroupStructure } from '../structure/group';
import { useForceRender } from './use-force-render';
import { useMemoized } from './use-memoized';

export function useMeshBuilder() {
    const mb = useMemoized(
        () =>
            new NaiveMeshBuilder(
                new GroupStructure(':root:', [SimpleStructure.fromSingleBlock('structure0', 0, 0, 0, 1)])
            )
    );
    const forceRender = useForceRender();
    useEffect(() => {
        mb.subscribe(forceRender);
        return () => mb.unsubscribe(forceRender);
    }, [forceRender, mb]);
    return mb;
}
