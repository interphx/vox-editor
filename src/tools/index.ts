import { eraser } from './eraser';
import { extruder } from './extruder';
import { pencil } from './pencil';

import { faEraser, faPen, faPenRuler, faUpDownLeftRight } from '@fortawesome/free-solid-svg-icons';
import { cameraMovement } from './camera-movement';
import { planeExtruder } from './plane-extruder';

export const tools = [
    {
        id: 'camera-movement',
        tool: cameraMovement,
        icon: faUpDownLeftRight
    },
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
        id: 'plane-extruder',
        tool: planeExtruder,
        icon: faPenRuler
    },
    {
        id: 'eraser',
        tool: eraser,
        icon: faEraser
    }
] as const;

export type ToolId = typeof tools[number]['id'];
