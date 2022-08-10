import { eraser } from './eraser';
import { extruder } from './extruder';
import { pencil } from './pencil';

import { faEraser, faPen, faPenRuler } from '@fortawesome/free-solid-svg-icons';
/*
export const tools = {
    pencil,
    extruder,
    eraser
};*/

export const tools = [
    {
        id: 'pencil',
        tool: pencil,
        icon: faPen
    },
    {
        id: 'extruder',
        tool: extruder,
        icon: faPenRuler
    },
    {
        id: 'eraser',
        tool: eraser,
        icon: faEraser
    }
] as const;

export type ToolId = typeof tools[number]['id'];
