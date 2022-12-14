import { action, computed, makeObservable, observable } from 'mobx';
import {
    BlockId,
    createStructureFromExportedData,
    Structure,
    StructureExportedData,
    StructureId,
    StructureWithChildren
} from '../structure';
import { Vec3Dictionary } from '../utilities/vec3-dictionary';
import { Palette, PaletteExportedData } from './palette';

export type ProjectExportedData = { readonly root: StructureExportedData; readonly palette: PaletteExportedData };

export class Project {
    private lastOperationId = 0;

    constructor(private readonly root: Structure & StructureWithChildren, private readonly palette: Palette) {
        makeObservable<Project, 'lastOperationId'>(this, {
            lastOperationId: observable.ref,
            addStructure: action,
            removeStructure: action,
            setBlock: action,
            meshes: computed
        });
    }

    clone() {
        return new Project(this.root.clone(), this.palette);
    }

    addStructure(structure: Structure) {
        this.root.addChild(structure);
        this.lastOperationId += 1;
    }

    removeStructure(structureId: StructureId) {
        this.root.removeChild(structureId);
        this.lastOperationId += 1;
    }

    getBlock(x: number, y: number, z: number): number {
        return this.root.get(x, y, z);
    }

    get meshes(): readonly JSX.Element[] {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.lastOperationId;

        // TODO: Generate optimized meshes consisting
        // only of visible planes
        const meshes: JSX.Element[] = [];
        const viewed = new Vec3Dictionary<boolean>();

        for (const [pos, blockId] of Array.from(this.root.blocks())) {
            if (blockId === 0 || viewed.has(pos)) continue;
            const color = this.palette.getById(blockId);
            if (color == null) continue;
            viewed.set(pos, true);
            meshes.push(createCubeNode(pos.x, pos.y, pos.z, color.color));
        }

        return meshes;
    }

    getRoot() {
        // TODO: Make this.root an observable atom
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.lastOperationId;

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

    static fromExportedData(data: ProjectExportedData): Project {
        const root = createStructureFromExportedData(data.root);
        if (!root.isContainer()) {
            throw new Error(`Root must be a container structure`);
        }
        return new Project(root, Palette.fromExportedData(data.palette));
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
