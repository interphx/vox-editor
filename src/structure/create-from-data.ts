import { GroupStructure } from './group';
import { SimpleStructure } from './simple';
import { Structure } from './structure';
import { StructureExportedData } from './types';

export function createStructureFromExportedData(data: StructureExportedData): Structure {
    switch (data.type) {
        case 'group':
            return GroupStructure.fromExportedData(data);
        case 'simple':
            return SimpleStructure.fromExportedData(data);
    }
    throw new Error(`Unknown structure type: ${(data as any).type}`);
}
