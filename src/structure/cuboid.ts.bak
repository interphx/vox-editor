import { MutableStructure, Structure } from './structure';

export class CuboidStructure implements Structure {
    private readonly minX: number = 0;
    private readonly minY: number = 0;
    private readonly minZ: number = 0;
    private readonly maxX: number = 0;
    private readonly maxY: number = 0;
    private readonly maxZ: number = 0;

    get(x: number, y: number, z: number): boolean {
        const { minX, minY, minZ, maxX, maxY, maxZ } = this;
        return x >= minX && y >= minY && z >= minZ && x <= maxX && y <= maxY && z <= maxZ;
    }

    isMutable(): this is MutableStructure {
        return false;
    }
}
