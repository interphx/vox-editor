import { Vec3Dictionary } from '../utilities/vec3-dictionary';
import { MutableStructure, Structure } from './structure';

export class SimpleStructure implements Structure, MutableStructure {
    private readonly data: Vec3Dictionary<boolean> = new Vec3Dictionary();

    get(x: number, y: number, z: number): boolean {
        const key = { x, y, z };
        return this.data.has(key) ? this.data.get(key) : false;
    }

    isMutable(): this is MutableStructure {
        return true;
    }

    set(x: number, y: number, z: number, value: boolean): void {
        this.data.set({ x, y, z }, value);
    }
}
