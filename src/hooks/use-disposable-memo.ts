import { useRef } from 'react';

export function useDisposableMemo<T>(
    initialize: () => T,
    dispose: (value: T) => void,
    dependencies: readonly unknown[]
): T {
    const stored = useRef<T | undefined>(undefined);
    const oldDependencies = useRef<readonly unknown[]>([]);
    if (stored.current === undefined) {
        stored.current = initialize();
        oldDependencies.current = dependencies;
    } else if (!arraysEqual(dependencies, oldDependencies.current)) {
        dispose(stored.current);
        stored.current = initialize();
        oldDependencies.current = dependencies;
    }
    return stored.current;
}

function arraysEqual(a: readonly unknown[], b: readonly unknown[]): boolean {
    if (a === b) return true;
    return a.length !== b.length || a.some((item, index) => item !== b[index]);
}
