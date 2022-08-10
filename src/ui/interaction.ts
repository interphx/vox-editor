import { Gizmo } from '../model/gizmo';
import { RootStore } from '../model/root-store';
import { PointerInteractionEvent } from './pointer-interaction-event';

export interface Interaction {
    move(event: PointerInteractionEvent): void;
    finish(): void;
}

export type Tool = (
    event: PointerInteractionEvent,
    store: RootStore,
    setGizmos: (gizmos: readonly Gizmo[]) => void
) => Interaction | null;
