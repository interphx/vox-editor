export interface Gizmo3d {
    readonly type: '3d';
    readonly threeElement: JSX.Element;
}

export interface DotGizmo2d {
    readonly type: '2d-dot';
    readonly color: string;
    readonly pos: { readonly x: number; readonly y: number };
}

export interface TextGizmo2d {
    readonly type: '2d-text';
    readonly color: string;
    readonly pos: { readonly x: number; readonly y: number };
    readonly text: string;
}

export interface ArrowGizmo2d {
    readonly type: '2d-arrow';
    readonly color: string;
    readonly start: { readonly x: number; readonly y: number };
    readonly end: { readonly x: number; readonly y: number };
}

export type Gizmo2d = DotGizmo2d | TextGizmo2d | ArrowGizmo2d;

export type Gizmo = Gizmo2d | Gizmo3d;

export function isGizmo2d(gizmo: Gizmo): gizmo is Gizmo2d {
    return gizmo.type === '2d-dot' || gizmo.type === '2d-text' || gizmo.type === '2d-arrow';
}

export function isGizmo3d(gizmo: Gizmo): gizmo is Gizmo3d {
    return gizmo.type === '3d';
}
