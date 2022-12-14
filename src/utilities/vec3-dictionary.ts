import { Dictionary } from './dictionary';
import { Vec3Like } from './geometry';
export class Vec3Dictionary<T> extends Dictionary<Vec3Like, T> {
    constructor() {
        super(hashVec3, vec3Equal);
    }
}

const hashVec3 = (vec3: Vec3Like) => `${vec3.x.toFixed(2)};${vec3.y.toFixed(2)};${vec3.z.toFixed(2)}`;
const vec3Equal = (a: Vec3Like, b: Vec3Like) => a.x === b.x && a.y === b.y && a.z === b.z;
