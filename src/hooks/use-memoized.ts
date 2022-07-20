import { useRef } from 'react';

export function useMemoized<T>(initialize: () => T): T {
    const ref = useRef<T | undefined>(undefined);
    if (ref.current === undefined) {
        ref.current = initialize();
    }
    return ref.current;
}
