import { eraser } from './eraser';
import { extruder } from './extruder';
import { pencil } from './pencil';

export const tools = {
    pencil,
    extruder,
    eraser
};

export type ToolId = keyof typeof tools;
