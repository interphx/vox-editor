import { Action } from '../rendering/action';
import { Gizmo } from '../rendering/gizmo';
import { World } from '../rendering/world';
import { StructureId } from '../structure';
import { ActionHistory } from '../utilities/action-history';
import { PointerInteractionEvent } from './pointer-interaction-event';

export interface Interaction {
    move(event: PointerInteractionEvent): void;
    finish(): void;
}

export type InteractionFactoryV2 = (
    event: PointerInteractionEvent,
    history: ActionHistory<World, Action>,
    activeStructureId: StructureId,
    setGizmos: (gizmos: readonly Gizmo[]) => void
) => Interaction | null;
