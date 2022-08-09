import { Gizmo } from '../rendering/gizmo';
import { RootStore } from '../rendering/root-store';
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
