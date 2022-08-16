import { action, makeObservable, observable } from 'mobx';
import { Vec3Like } from '../utilities/geometry';
import { createStructureFromExportedData } from './create-from-data';
import { GroupExportedData } from './exported-data';
import {
    BlockId,
    MutableStructure,
    Structure,
    StructureId,
    StructureSnapshot,
    StructureWithChildren
} from './structure';

export class GroupStructure implements Structure, StructureWithChildren {
    constructor(public readonly id: StructureId, public visible: boolean, private readonly children: Structure[]) {
        makeObservable<GroupStructure, 'children'>(this, {
            visible: observable.ref,
            children: observable.shallow,
            setVisibility: action
        });
    }

    get(x: number, y: number, z: number): BlockId {
        for (const child of this.getChildren()) {
            const blockId = child.get(x, y, z);
            if (blockId !== 0) return blockId;
        }
        return 0;
    }

    isMutable(): this is MutableStructure {
        return false;
    }

    canHaveChildren(): this is StructureWithChildren {
        return true;
    }

    clone(): this {
        return new GroupStructure(
            this.id,
            this.visible,
            this.children.map(child => child.clone())
        ) as this;
    }

    blocks(): Iterable<readonly [Vec3Like, number]> {
        if (!this.visible) return [];

        let blocks: (readonly [Vec3Like, number])[] = [];
        for (const child of this.children) {
            if (!child.visible) continue;
            blocks = blocks.concat(Array.from(child.blocks()));
        }
        return blocks;
    }

    isEmpty(): boolean {
        return this.children.length === 0 || this.children.every(child => child.isEmpty());
    }

    snapshot(): StructureSnapshot {
        return { type: 'group', id: this.id, children: this.children.map(child => child.snapshot()) };
    }

    getChildren(): readonly Structure[] {
        return this.children;
    }

    addChild(child: Structure): void {
        if (this.idExists(child.id)) throw new Error(`Structure with id ${child.id} already exists in this subtree`);
        this.children.push(child);
    }

    removeChild(id: string): void {
        const index = this.children.findIndex(child => child.id === id);
        if (index < 0) throw new Error(`Structure with id ${id} is not a direct child of this group`);
        this.children.splice(index, 1);
    }

    findChild(id: string): Structure | null {
        if (this.id === id) return this;
        for (const child of this.children) {
            if (child.id === id) return child;
            if (child.canHaveChildren()) {
                const subtreeResult = child.findChild(id);
                if (subtreeResult !== null) return subtreeResult;
            }
        }
        return null;
    }

    setVisibility(visible: boolean) {
        this.visible = visible;
    }

    isOrContains(id: StructureId): boolean {
        return this.id === id || this.children.some(child => child.isOrContains(id));
    }

    export(): GroupExportedData {
        return {
            type: 'group',
            id: this.id,
            visible: this.visible,
            children: this.children.map(child => child.export())
        };
    }

    private flatten() {
        const collect = (structure: Structure): readonly Structure[] => {
            if (!structure.canHaveChildren()) return [];
            return [structure, ...structure.getChildren().flatMap(collect)];
        };
        return collect(this);
    }

    private idExists(id: StructureId): boolean {
        return this.flatten().some(structure => structure.id === id);
    }

    static fromExportedData(data: GroupExportedData) {
        return new GroupStructure(
            data.id,
            data.visible,
            data.children.map(childData => createStructureFromExportedData(childData))
        );
    }
}
