import { Dictionary } from '../utilities/dictionary';
import { MeshBuilder } from './mesh-builder';
import { MutableWorld, World } from './world';

export class NaiveMeshBuilder implements MutableWorld, MeshBuilder {
    private readonly callbacks: (() => void)[] = [];
    private readonly data: Dictionary<[number, number, number], boolean> = new Dictionary(
        String,
        (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
    );
    private readonly transactions: {
        readonly tempData: Dictionary<[number, number, number], boolean>;
    }[] = [];
    private nestedWorld: World | null = null;

    constructor(nestedMeshBuilder: World | null) {
        this.nestedWorld = nestedMeshBuilder;
    }

    clone(): NaiveMeshBuilder {
        const result = new NaiveMeshBuilder(this.nestedWorld?.clone() ?? null);
        for (const [[x, y, z], block] of Array.from(this.data.entries())) {
            result.setBlock('xxx', x, y, z, Number(block));
        }
        return result;
    }

    /*
    createTransaction() {
        const tempData = this.data.clone();
        tempData.clear();
        //console.log(tempData);

        const transaction = {
            tempData,
            valid: true,
            set: (x: number, y: number, z: number, value: boolean) => {
                tempData.set([x, y, z], value);
                this.invalidate();
            },
            clear: () => {
                tempData.clear();
                this.invalidate();
            },
            commit: () => {
                this.data.extend(tempData);
                this.invalidate();
                const index = this.transactions.indexOf(transaction);
                if (index >= 0) this.transactions.splice(index, 1);
                transaction.tempData = null as any;
                transaction.valid = false;
                transaction.set = () => {
                    throw new Error(`Transaction is already committed`);
                };
                transaction.commit = () => {
                    throw new Error(`Transaction is already committed`);
                };
            }
        };

        this.transactions.push(transaction);

        return transaction;
    }
*/
    forEach(callback: (x: number, y: number, z: number, value: number) => void): void {
        for (const [[x, y, z], value] of Array.from(this.data.entries())) {
            callback(x, y, z, Number(value));
        }
        this.nestedWorld?.forEach((x, y, z, value) => {
            if (this.data.has([x, y, z])) return;
            callback(x, y, z, value);
        });
    }

    getBlock(x: number, y: number, z: number): number {
        if (this.data.has([x, y, z])) return Number(this.data.get([x, y, z]));
        if (this.nestedWorld) return this.nestedWorld.getBlock(x, y, z);
        return 0;
    }

    getMeshes(): JSX.Element[] {
        const meshes: JSX.Element[] = [];
        const allEntries = [
            ...Array.from(this.data.entries()),
            ...this.transactions.flatMap(transaction => Array.from(transaction.tempData.entries()))
        ];
        //console.log(allEntries);
        for (const [[x, y, z], value] of allEntries) {
            if (!value) continue;
            meshes.push(createCubeNode(x, y, z));
        }
        const nestedMeshes = this.nestedWorld?.getMeshes() ?? [];
        return [...nestedMeshes, ...meshes];
    }

    invalidate(): void {
        for (const callback of this.callbacks) {
            callback();
        }
    }

    isEmpty(): boolean {
        return this.data.size() === 0 && (!this.nestedWorld || this.nestedWorld.isEmpty());
    }

    restoreSnapshot(snapshot: World): void {
        this.data.clear();
        snapshot.forEach((x, y, z, value) => {
            this.setBlock('xxx', x, y, z, value);
        });
    }

    set(x: number, y: number, z: number, value: boolean) {
        this.data.set([x, y, z], value);
        this.invalidate();
    }

    setBlock(layerId: string, x: number, y: number, z: number, value: number): void {
        this.set(x, y, z, Boolean(value));
    }

    snapshot(): World {
        return this.clone();
    }

    subscribe(callback: () => void) {
        this.callbacks.push(callback);
        if (this.nestedWorld) this.nestedWorld.subscribe(callback);
    }

    unsubscribe(callback: () => void) {
        const index = this.callbacks.indexOf(callback);
        if (index >= 0) {
            this.callbacks.splice(index, 1);
        }
        if (this.nestedWorld) this.nestedWorld.unsubscribe(callback);
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
