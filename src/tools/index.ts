import { extruder } from './extruder-v2';
import { pencil } from './pencil-v2';

export const tools = {
    pencil,
    extruder
};

export type ToolId = keyof typeof tools;
