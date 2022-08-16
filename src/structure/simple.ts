import { action, makeObservable, observable } from 'mobx';
import { Vec3Like } from '../utilities/geometry';
import { Vec3Dictionary } from '../utilities/vec3-dictionary';

import { ContainerStructure, MutableStructure, Structure, StructureSnapshot } from './structure';
import { BlockId, SimpleExportedData, StructureId } from './types';

export class SimpleStructure implements Structure, MutableStructure {
    constructor(
        public readonly id: StructureId,
        public visible: boolean,
        private readonly data: Vec3Dictionary<BlockId>
    ) {
        makeObservable(this, { visible: observable.ref, setVisibility: action });
    }

    get(x: number, y: number, z: number): number {
        const key = { x, y, z };
        return this.data.has(key) ? this.data.get(key) : 0;
    }

    isMutable(): this is MutableStructure {
        return true;
    }

    isContainer(): this is ContainerStructure {
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

    export(): SimpleExportedData {
        return {
            type: 'simple',
            id: this.id,
            visible: this.visible,
            blocks: Object.fromEntries(
                Array.from(this.data.entries()).map(
                    ([pos, blockId]) => [`${pos.x};${pos.y};${pos.z}`, blockId] as const
                )
            )
        };
    }

    static empty(id: StructureId): SimpleStructure {
        return new SimpleStructure(id, true, new Vec3Dictionary());
    }

    static fromSingleBlock(id: StructureId, x: number, y: number, z: number, value: BlockId): SimpleStructure {
        const result = SimpleStructure.empty(id);
        result.set(x, y, z, value);
        return result;
    }

    static fromCuboid(id: StructureId, min: Vec3Like, max: Vec3Like, value: BlockId): SimpleStructure {
        const result = SimpleStructure.empty(id);
        for (let z = min.z; z <= max.z; ++z) {
            for (let y = min.y; y <= max.y; ++y) {
                for (let x = min.x; x <= max.x; ++x) {
                    result.set(x, y, z, value);
                }
            }
        }
        return result;
    }

    static fromExportedData(data: SimpleExportedData): SimpleStructure {
        const blocks = new Vec3Dictionary<BlockId>();
        for (const [posString, blockId] of Object.entries(data.blocks)) {
            const [x, y, z] = posString.split(';');
            blocks.set(
                {
                    x: Number(x),
                    y: Number(y),
                    z: Number(z)
                },
                blockId
            );
        }
        return new SimpleStructure(data.id, data.visible, blocks);
    }
}
