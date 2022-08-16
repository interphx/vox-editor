import { Camera, Vector2, Vector3 } from 'three';
import { Vec3Like } from './geometry';

type Axis = 'x' | 'y' | 'z';

export function vecToString(vector: { readonly x: number; readonly y: number; readonly z?: number }) {
    if ('z' in vector) {
        return `${vector.x.toFixed(2)}, ${vector.y.toFixed(2)}, ${vector.z!.toFixed(2)}`;
    } else {
        return `${vector.x.toFixed(2)}, ${vector.y.toFixed(2)}`;
    }
}

export function getNonZeroAxis({ x, y, z }: Vec3Like): Axis | null {
    if (Math.abs(x) !== 0) return 'x';
    if (Math.abs(y) !== 0) return 'y';
    if (Math.abs(z) !== 0) return 'z';
    return null;
}

export function getCoplanarAxes(axis: Axis): [Axis, Axis] {
    if (axis === 'x') return ['y', 'z'];
    if (axis === 'y') return ['z', 'x'];
    return ['x', 'y'];
}

export function worldToVoxel(worldPos: Vec3Like, faceNormal: Vec3Like): Vector3 {
    return new Vector3(
        Math.round(worldPos.x - faceNormal.x * 0.5),
        Math.round(worldPos.y - faceNormal.y * 0.5),
        Math.round(worldPos.z - faceNormal.z * 0.5)
    );
}

export function projectToViewport(vector: Vector3, camera: Camera): Vector2 {
    const projected = vector.clone().project(camera);
    return new Vector2(projected.x, projected.y);
}
