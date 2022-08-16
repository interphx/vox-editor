import { Mesh, Quaternion } from 'three';

export type Vec3Like = { readonly x: number; readonly y: number; readonly z: number };

export function getDirectionQuaternion(origin: Vec3Like, direction: Vec3Like): Quaternion {
    const mesh = new Mesh();
    mesh.position.set(origin.x, origin.y, origin.z);
    mesh.lookAt(origin.x + direction.x, origin.y + direction.y, origin.z + direction.z);
    return mesh.quaternion;
}
