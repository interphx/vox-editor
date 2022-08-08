import { extruder } from './extruder';
import { pencil } from './pencil';

export const tools = {
    pencil,
    extruder
};

export type ToolId = keyof typeof tools;
