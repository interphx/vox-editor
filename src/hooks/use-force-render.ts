import { useRef, useState } from 'react';

export function useForceRender() {
    const [, setCount] = useState(0);
    const run = useRef<undefined | (() => void)>(undefined);
    if (run.current === undefined) {
        run.current = setCount.bind(null, increase);
    }
    return run.current;
}

function increase(count: number) {
    return count + 1;
}
