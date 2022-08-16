import { useEffect, useRef } from 'react';
import { ArrowHelper, Vector3 } from 'three';

export function Arrow3d(props: { startPosition: Vector3; direction: Vector3; length: number; color: string }) {
    const { startPosition, direction, length, color } = props;
    const ref = useRef<ArrowHelper | null>(null);
    useEffect(() => {
        if (!ref.current) return;
        ref.current.setDirection(direction);
        ref.current.setLength(length);
        ref.current.setColor(color);
    }, [color, direction, length]);
    return <arrowHelper ref={ref} position={startPosition} />;
}
