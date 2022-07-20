import { Vector2 } from 'three';

export type Debug2d =
    | { readonly type: 'dot'; readonly color: string; readonly pos: Vector2 }
    | { readonly type: 'text'; readonly color: string; readonly pos: Vector2; readonly text: string };
