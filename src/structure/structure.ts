import { Vec3Like } from '../utilities/vec3-dictionary';
import { StructureExportedData } from './exported-data';

export type StructureId = string;
export type BlockId = number;

export interface StructureSnapshot {}

export interface Structure {
    readonly id: StructureId;
    readonly visible: boolean;
    get(x: number, y: number, z: number): BlockId;
    isMutable(): this is MutableStructure;
    canHaveChildren(): this is StructureWithChildren;
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

export interface StructureWithChildren {
    getChildren(): readonly Structure[];
    addChild(child: Structure): void;
    removeChild(id: StructureId): void;
    findChild(id: StructureId): Structure | null;
}
