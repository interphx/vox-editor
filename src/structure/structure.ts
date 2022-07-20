export interface Structure {
    get(x: number, y: number, z: number): boolean;
    isMutable(): this is MutableStructure;
}

export interface MutableStructure {
    set(x: number, y: number, z: number, value: boolean): void;
}
