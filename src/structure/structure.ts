import { Vec3Like } from '../utilities/geometry';
import { BlockId, StructureExportedData, StructureId } from './types';

export interface StructureSnapshot {}

export interface Structure {
    readonly id: StructureId;
    readonly visible: boolean;
    get(x: number, y: number, z: number): BlockId;
    isMutable(): this is MutableStructure;
    isContainer(): this is ContainerStructure;
    clone(): this;
    blocks(): Iterable<readonly [Vec3Like, BlockId]>;
    isEmpty(): boolean;
    snapshot(): StructureSnapshot;
    setVisibility(visible: boolean): void;
    isOrContains(id: StructureId): boolean;
    export(): StructureExportedData;
}

export interface MutableStructure extends Structure {
    set(x: number, y: number, z: number, value: BlockId): void;
}

export interface ContainerStructure {
    getChildren(): readonly Structure[];
    addChild(child: Structure): void;
    removeChild(id: StructureId): void;
    findChild(id: StructureId): Structure | null;
}
