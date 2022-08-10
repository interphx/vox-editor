type ColorDefinition = {
    readonly id: number;
    readonly name: string;
    readonly color: string;
};

export type PaletteExportedData = {
    readonly [id: string]: ColorDefinition;
};

export class Palette {
    private constructor(private readonly colorById: Map<number, ColorDefinition>) {}

    getById(id: number): ColorDefinition | null {
        return this.colorById.get(id) ?? null;
    }

    getAll(): readonly ColorDefinition[] {
        return Array.from(this.colorById.values());
    }

    export(): PaletteExportedData {
        return Object.fromEntries(this.colorById);
    }

    static fromColorList(colors: readonly string[]): Palette {
        const colorById = new Map<number, ColorDefinition>();
        for (let i = 0; i < colors.length; ++i) {
            // id = 0 means empty space, so we start at 1
            const id = i + 1;
            const color = colors[i];
            const name = color;
            colorById.set(id, { id, name, color });
        }
        return new Palette(colorById);
    }

    static fromExportedData(data: PaletteExportedData): Palette {
        const map = new Map<number, ColorDefinition>();
        for (const definition of Object.values(data)) {
            map.set(definition.id, { ...definition });
        }
        return new Palette(map);
    }
}
