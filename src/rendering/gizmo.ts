interface Gizmo3d {
    readonly type: '3d';
    readonly threeElement: JSX.Element;
}

interface DotGizmo2d {
    readonly type: '2d-dot';
    readonly color: string;
    readonly pos: { readonly x: number; readonly y: number };
}

interface TextGizmo2d {
    readonly type: '2d-text';
    readonly color: string;
    readonly pos: { readonly x: number; readonly y: number };
    readonly text: string;
}

type Gizmo2d = DotGizmo2d | TextGizmo2d;

export type Gizmo = Gizmo2d | Gizmo3d;

export function isGizmo2d(gizmo: Gizmo): gizmo is Gizmo2d {
    return gizmo.type === '2d-dot' || gizmo.type === '2d-text';
}

export function isGizmo3d(gizmo: Gizmo): gizmo is Gizmo3d {
    return gizmo.type === '3d';
}
