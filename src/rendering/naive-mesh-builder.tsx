import { Structure, StructureId } from '../structure';
import { BlockId, restoreStructureSnapshot, StructureSnapshot, StructureWithChildren } from '../structure/structure';
import { SubscriptionHandle } from '../utilities/signal';
import { MeshBuilder } from './mesh-builder';
import { MutableWorld } from './world';

export interface WorldSnapshot {
    rootSnapshot: StructureSnapshot;
}

export class NaiveMeshBuilder implements MutableWorld, MeshBuilder {
    private readonly callbacks: (() => void)[] = [];
    private readonly subscriptionByStructureId: Map<StructureId, SubscriptionHandle> = new Map();
    private root: Structure & StructureWithChildren;

    constructor(root: Structure & StructureWithChildren) {
        this.subscriptionByStructureId.set(
            root.id,
            root.onChange.subscribe(() => this.invalidate())
        );
        this.root = root;
    }

    clone(): this {
        return new NaiveMeshBuilder(this.root.clone()) as this;
    }

    addStructure(structure: Structure) {
        this.root.addChild(structure);
        this.subscriptionByStructureId.set(
            structure.id,
            structure.onChange.subscribe(() => this.invalidate())
        );
        this.invalidate();
    }

    removeStructure(id: StructureId) {
        this.root.removeChild(id);
        const subscription = this.subscriptionByStructureId.get(id);
        if (subscription) subscription.unsubscribe();
        this.invalidate();
    }

    getBlock(x: number, y: number, z: number): number {
        return this.root.get(x, y, z);
    }

    getMeshes(): JSX.Element[] {
        const meshes: JSX.Element[] = [];

        for (const [{ x, y, z }, blockId] of Array.from(this.root.blocks())) {
            if (blockId === 0) continue;
            meshes.push(createCubeNode(x, y, z));
        }

        return meshes;
    }

    invalidate(): void {
        for (const callback of this.callbacks) {
            callback();
        }
    }

    isEmpty(): boolean {
        return this.root.isEmpty();
    }

    restoreSnapshot(snapshot: WorldSnapshot): void {
        const restoredRoot = restoreStructureSnapshot(snapshot.rootSnapshot);
        if (!restoredRoot.canHaveChildren()) {
            throw new Error(`Root structure of the snapshot must be able to have children`);
        }
        this.root = restoredRoot;
        this.invalidate();
    }

    setBlock(structureId: StructureId, x: number, y: number, z: number, value: BlockId) {
        const structure = this.root.findChild(structureId);
        if (!structure) throw new Error(`Structure with id ${structureId} is not found`);
        if (!structure.isMutable()) throw new Error(`Structure with id ${structureId} is not mutable`);
        structure.set(x, y, z, value);
        this.invalidate();
    }

    snapshot(): WorldSnapshot {
        return { rootSnapshot: this.root.snapshot() };
    }

    getDefaultStructureId(): StructureId {
        if (this.root.getChildren().length > 0) {
            return this.root.getChildren()[0].id;
        }
        return this.root.id;
    }

    getRoot(): Structure {
        return this.root;
    }

    subscribe(callback: () => void) {
        // TODO: Use signals?

        this.callbacks.push(callback);
    }

    unsubscribe(callback: () => void) {
        const index = this.callbacks.indexOf(callback);
        if (index >= 0) {
            this.callbacks.splice(index, 1);
        }
    }
}

function createCubeNode(x: number, y: number, z: number): JSX.Element {
    return (
        <mesh key={`${x};${y};${z}`} position={[x, y, z]}>
            {boxGeo}
            {testMaterial}
        </mesh>
    );
}

const boxGeo = <boxGeometry args={[1, 1, 1]} />;
const testMaterial = <meshPhongMaterial color={'orange'} />;
