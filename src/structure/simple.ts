import { Signal } from '../utilities/signal';
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
    public visible: boolean = true;
    public readonly onChange: Signal<void> = new Signal();

    constructor(public readonly id: StructureId, private readonly data: Vec3Dictionary<BlockId>) {}

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
        return new SimpleStructure(this.id, this.data.clone()) as this;
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
        this.onChange.dispatch();
    }

    setVisibility(visible: boolean) {
        this.visible = visible;
        this.onChange.dispatch();
    }

    static empty(id: StructureId): SimpleStructure {
        return new SimpleStructure(id, new Vec3Dictionary());
    }

    static fromSingleBlock(id: StructureId, x: number, y: number, z: number, value: BlockId): SimpleStructure {
        const result = SimpleStructure.empty(id);
        result.set(x, y, z, value);
        return result;
    }
}
