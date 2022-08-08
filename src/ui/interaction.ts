import { Action } from '../rendering/action';
import { Gizmo } from '../rendering/gizmo';
import { ProjectStore } from '../rendering/project-store';
import { ActionHistory } from '../utilities/action-history';
import { PointerInteractionEvent } from './pointer-interaction-event';

export interface Interaction {
    move(event: PointerInteractionEvent): void;
    finish(): void;
}

export type InteractionFactory = (
    event: PointerInteractionEvent,
    history: ActionHistory<ProjectStore, Action>,
    setGizmos: (gizmos: readonly Gizmo[]) => void
) => Interaction | null;
