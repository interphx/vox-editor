import { useMemo } from 'react';
import { Vector3 } from 'three';
import { Vec3Like } from '../utilities/geometry';

export function useMemoizedVector(vec3: Vec3Like | null | undefined): Vector3 | null {
    return useMemo(() => {
        const x = vec3?.x;
        const y = vec3?.y;
        const z = vec3?.z;
        if (x == null || y == null || z == null) return null;
        return new Vector3(x, y, z);
    }, [vec3?.x, vec3?.y, vec3?.z]);
}
