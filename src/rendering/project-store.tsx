import { action, makeObservable, observable } from 'mobx';
import { Structure } from '../structure';
import { createStructureFromExportedData } from '../structure/create-from-data';
import { StructureExportedData } from '../structure/exported-data';
import { BlockId, StructureId, StructureWithChildren } from '../structure/structure';
import { Palette, PaletteExportedData } from './palette';

export type ProjectExportedData = { readonly root: StructureExportedData; readonly palette: PaletteExportedData };

export class ProjectStore {
    private lastOperationId = 0;

    constructor(private readonly root: Structure & StructureWithChildren, private readonly palette: Palette) {
        makeObservable<ProjectStore, 'lastOperationId'>(this, {
            lastOperationId: observable.ref,
            addStructure: action,
            removeStructure: action,
            setBlock: action
        });
    }

    clone() {
        return new ProjectStore(this.root.clone(), this.palette);
    }

    addStructure(structure: Structure) {
        this.lastOperationId += 1;
        this.root.addChild(structure);
    }

    removeStructure(structureId: StructureId) {
        this.lastOperationId += 1;
        this.root.removeChild(structureId);
    }

    getBlock(x: number, y: number, z: number): number {
        return this.root.get(x, y, z);
    }

    getMeshes(): JSX.Element[] {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.lastOperationId;

        // TODO: Generate optimized meshes consisting
        // only of visible planes
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
        this.lastOperationId += 1;
        structure.set(x, y, z, value);
    }

    export() {
        return {
            root: this.root.export(),
            palette: this.palette.export()
        };
    }

    static fromExportedData(data: ProjectExportedData): ProjectStore {
        const root = createStructureFromExportedData(data.root);
        if (!root.canHaveChildren()) {
            throw new Error(`Root must be a container structure`);
        }
        return new ProjectStore(root, Palette.fromExportedData(data.palette));
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
