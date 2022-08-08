import { action, makeObservable } from 'mobx';
import { Structure } from '../structure';
import { BlockId, StructureId, StructureWithChildren } from '../structure/structure';
import { Palette } from './palette';

export class ProjectStore {
    constructor(private readonly root: Structure & StructureWithChildren, private readonly palette: Palette) {
        makeObservable<ProjectStore>(this, {
            addStructure: action,
            removeStructure: action,
            setBlock: action
        });
    }

    clone() {
        return new ProjectStore(this.root.clone(), this.palette);
    }

    addStructure(structure: Structure) {
        this.root.addChild(structure);
    }

    removeStructure(structureId: StructureId) {
        this.root.removeChild(structureId);
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
