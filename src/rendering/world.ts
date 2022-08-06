import { StructureId } from '../structure';
import { MeshBuilder } from './mesh-builder';
import { WorldSnapshot } from './naive-mesh-builder';

export interface World extends MeshBuilder {
    getBlock(x: number, y: number, z: number): number;
    snapshot(): WorldSnapshot;
    isEmpty(): boolean;
    clone(): this;
    getDefaultStructureId(): StructureId;
    subscribe(callback: () => void): void;
    unsubscribe(callback: () => void): void;
}

export interface MutableWorld extends World {
    setBlock(structureId: StructureId, x: number, y: number, z: number, value: number): void;
    restoreSnapshot(snapshot: WorldSnapshot): void;
}
