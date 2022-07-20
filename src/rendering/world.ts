import { MeshBuilder } from './mesh-builder';

export interface World extends MeshBuilder {
    getBlock(x: number, y: number, z: number): number;
    forEach(callback: (x: number, y: number, z: number, value: number) => void): void;
    snapshot(): World;
    isEmpty(): boolean;
    clone(): MutableWorld;
    subscribe(callback: () => void): void;
    unsubscribe(callback: () => void): void;
}

export interface MutableWorld extends World {
    setBlock(layerId: string, x: number, y: number, z: number, value: number): void;
    restoreSnapshot(snapshot: World): void;
}
