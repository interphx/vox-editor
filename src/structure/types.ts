export type StructureId = string;
export type BlockId = number;

export type SimpleExportedData = {
    type: 'simple';
    id: string;
    visible: boolean;
    blocks: { readonly [position: string]: number };
};

export type GroupExportedData = {
    type: 'group';
    id: string;
    visible: boolean;
    children: readonly StructureExportedData[];
};

export type StructureExportedData = SimpleExportedData | GroupExportedData;
