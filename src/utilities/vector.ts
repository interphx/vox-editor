import { Camera, Vector2, Vector3 } from 'three';

export function vecToString(vector: { readonly x: number; readonly y: number; readonly z?: number }) {
    if ('z' in vector) {
        return `${vector.x.toFixed(2)}, ${vector.y.toFixed(2)}, ${vector.z!.toFixed(2)}`;
    } else {
        return `${vector.x.toFixed(2)}, ${vector.y.toFixed(2)}`;
    }
}

export const worldToVoxel = (worldPos: Vector3, faceNormal: Vector3): Vector3 =>
    worldPos.clone().sub(faceNormal.clone().multiplyScalar(0.5)).round().floor();

export const projectToViewport = (vector: Vector3, camera: Camera): Vector2 => {
    const projected = vector.clone().project(camera);
    return new Vector2(projected.x, projected.y);
};
