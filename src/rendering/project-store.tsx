import { action, makeObservable, observable } from 'mobx';
import { Structure } from '../structure';
import { BlockId, StructureId, StructureWithChildren } from '../structure/structure';
import { Palette } from './palette';

export class ProjectStore {
    constructor(
        public activeStructureId: StructureId,
        private readonly root: Structure & StructureWithChildren,
        private readonly palette: Palette,
        public selectedBlockId: BlockId
    ) {
        makeObservable<ProjectStore, 'activeStructureId'>(this, {
            activeStructureId: observable.ref,
            selectedBlockId: observable.ref,
            addStructure: action,
            removeStructure: action,
            selectStructure: action,
            selectBlockType: action,
            setBlock: action
        });
    }

    clone() {
        return new ProjectStore(this.activeStructureId, this.root.clone(), this.palette, this.selectedBlockId);
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

    selectStructure(structureId: StructureId) {
        if (!this.root.isOrContains(structureId)) {
            throw new Error(`Structure ${structureId} is not in the hierarchy`);
        }
        this.activeStructureId = structureId;
    }

    selectBlockType(blockId: BlockId) {
        console.log(`Selected: ${blockId}, ${this.palette.getById(blockId)!.color}`);
        if (this.palette.getById(blockId) === null) {
            throw new Error(`BlockId ${blockId} is not in the palette`);
        }
        this.selectedBlockId = blockId;
    }

    getBlock(x: number, y: number, z: number): number {
        return this.root.get(x, y, z);
    }

    getMeshes(): JSX.Element[] {
        const meshes: JSX.Element[] = [];

        for (const [{ x, y, z }, blockId] of Array.from(this.root.blocks())) {
            if (blockId === 0) continue;
            const color = this.palette.getById(blockId);
            if (color === null) continue;
            meshes.push(createCubeNode(x, y, z, color.color));
        }

        return meshes;
    }

    getRoot() {
        return this.root;
    }

    getPalette() {
        return this.palette;
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

function createCubeNode(x: number, y: number, z: number, color: string): JSX.Element {
    return (
        <mesh key={`${x};${y};${z}`} position={[x, y, z]}>
            {boxGeo}
            <meshPhongMaterial color={color} />
        </mesh>
    );
}

const boxGeo = <boxGeometry args={[1, 1, 1]} />;
//const testMaterial = <meshPhongMaterial color={'orange'} />;
