import { makeObservable, observable } from 'mobx';
import { Vec3Dictionary, Vec3Like } from '../utilities/vec3-dictionary';
import {
    BlockId,
    MutableStructure,
    Structure,
    StructureId,
    StructureSnapshot,
    StructureWithChildren
} from './structure';

export class SimpleStructure implements Structure, MutableStructure {
    constructor(
        public readonly id: StructureId,
        public visible: boolean,
        private readonly data: Vec3Dictionary<BlockId>
    ) {
        makeObservable(this, { visible: observable.ref });
    }

    get(x: number, y: number, z: number): number {
        const key = { x, y, z };
        return this.data.has(key) ? this.data.get(key) : 0;
    }

    isMutable(): this is MutableStructure {
        return true;
    }

    canHaveChildren(): this is StructureWithChildren {
        return false;
    }

    clone(): this {
        return new SimpleStructure(this.id, this.visible, this.data.clone()) as this;
    }

    blocks(): Iterable<readonly [Vec3Like, number]> {
        if (!this.visible) return [];
        return Array.from(this.data.entries());
    }

    isEmpty(): boolean {
        return this.data.size() === 0;
    }

    snapshot(): StructureSnapshot {
        return { type: 'simple', id: this.id, data: this.data.clone() };
    }

    set(x: number, y: number, z: number, value: number): void {
        if (value === 0) {
            this.data.remove({ x, y, z });
        } else {
            this.data.set({ x, y, z }, value);
        }
    }

    setVisibility(visible: boolean) {
        this.visible = visible;
    }

    isOrContains(id: StructureId): boolean {
        return this.id === id;
    }

    static empty(id: StructureId): SimpleStructure {
        return new SimpleStructure(id, true, new Vec3Dictionary());
    }

    static fromSingleBlock(id: StructureId, x: number, y: number, z: number, value: BlockId): SimpleStructure {
        const result = SimpleStructure.empty(id);
        result.set(x, y, z, value);
        return result;
    }
}
