import { Face, Object3D, OrthographicCamera, PerspectiveCamera, Vector2, Vector3 } from 'three';

export interface PointerInteractionEvent {
    object: Object3D | null;
    face: Face | null;
    worldPoint: Vector3 | null;
    viewportPoint: Vector2;
    camera: PerspectiveCamera | OrthographicCamera;
}
