import { Camera, Vector2, Vector3 } from 'three';
import { Vec3Like } from './geometry';

export function vecToString(vector: { readonly x: number; readonly y: number; readonly z?: number }) {
    if ('z' in vector) {
        return `${vector.x.toFixed(2)}, ${vector.y.toFixed(2)}, ${vector.z!.toFixed(2)}`;
    } else {
        return `${vector.x.toFixed(2)}, ${vector.y.toFixed(2)}`;
    }
}

export const worldToVoxel = (worldPos: Vec3Like, faceNormal: Vec3Like): Vector3 =>
    new Vector3(
        Math.round(worldPos.x - faceNormal.x * 0.5),
        Math.round(worldPos.y - faceNormal.y * 0.5),
        Math.round(worldPos.z - faceNormal.z * 0.5)
    );

export const projectToViewport = (vector: Vector3, camera: Camera): Vector2 => {
    const projected = vector.clone().project(camera);
    return new Vector2(projected.x, projected.y);
};
