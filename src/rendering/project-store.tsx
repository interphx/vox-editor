import { action, makeObservable, observable } from 'mobx';
import { Structure } from '../structure';
import { BlockId, StructureId, StructureWithChildren } from '../structure/structure';

export class ProjectStore {
    constructor(public activeStructureId: StructureId, private readonly root: Structure & StructureWithChildren) {
        this.activeStructureId = getDefaultActiveStructureId(root);
        makeObservable<ProjectStore, 'activeStructureId'>(this, {
            activeStructureId: observable.ref,
            addStructure: action,
            removeStructure: action,
            setBlock: action
        });
    }

    clone() {
        return new ProjectStore(this.activeStructureId, this.root.clone());
    }

    addStructure(structure: Structure) {
        this.root.addChild(structure);
    }

    removeStructure(structureId: StructureId) {
        const structure = this.root.findChild(structureId);
        const updateActiveId = structure && structure.isOrContains(structureId);
        this.root.removeChild(structureId);
        if (updateActiveId) {
            this.activeStructureId = getDefaultActiveStructureId(this.root);
        }
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

    getRoot() {
        return this.root;
    }

    isEmpty(): boolean {
        return this.root.isEmpty();
    }

    setBlock(structureId: StructureId, x: number, y: number, z: number, value: BlockId) {
        const structure = this.root.findChild(structureId);
        if (!structure) throw new Error(`Structure with id ${structureId} is not found`);
        if (!structure.isMutable()) throw new Error(`Structure with id ${structureId} is not mutable`);
        structure.set(x, y, z, value);
    }
}

function getDefaultActiveStructureId(root: Structure) {
    if (root.canHaveChildren()) {
        const children = root.getChildren();
        if (children.length > 0) return children[0].id;
    }
    return root.id;
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
