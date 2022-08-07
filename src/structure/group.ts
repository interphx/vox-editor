import { Signal, SubscriptionHandle } from '../utilities/signal';
import { Vec3Like } from '../utilities/vec3-dictionary';
import {
    BlockId,
    MutableStructure,
    Structure,
    StructureId,
    StructureSnapshot,
    StructureWithChildren
} from './structure';

export class GroupStructure implements Structure, StructureWithChildren {
    public visible: boolean = true;
    public readonly onChange: Signal<void> = new Signal();
    private readonly subscriptionByChildId: Map<StructureId, SubscriptionHandle> = new Map();

    constructor(public readonly id: StructureId, private readonly children: Structure[]) {
        for (const child of children) {
            this.subscriptionByChildId.set(
                child.id,
                child.onChange.subscribe(() => this.onChange.dispatch())
            );
        }
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
        this.subscriptionByChildId.set(
            child.id,
            child.onChange.subscribe(() => this.onChange.dispatch())
        );
        this.onChange.dispatch();
    }

    removeChild(id: string): void {
        const index = this.children.findIndex(child => child.id === id);
        if (index < 0) throw new Error(`Structure with id ${id} is not a direct child of this group`);
        this.children.splice(index, 1);
        const subscription = this.subscriptionByChildId.get(id);
        if (subscription) subscription.unsubscribe();
        this.onChange.dispatch();
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
        this.onChange.dispatch();
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
}
