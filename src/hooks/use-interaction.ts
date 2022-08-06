import { useCallback, useRef, useState } from 'react';
import { Action } from '../rendering/action';
import { Gizmo } from '../rendering/gizmo';
import { World } from '../rendering/world';
import { StructureId } from '../structure';
import { ToolId, tools } from '../tools';
import { Interaction } from '../ui/interaction';
import { PointerInteractionEvent } from '../ui/pointer-interaction-event';
import { ActionHistory } from '../utilities/action-history';

export function useInteraction(toolId: ToolId, activeStructureId: StructureId, history: ActionHistory<World, Action>) {
    const [interactionActive, setInteractionActive] = useState(false);
    const [interactionGizmos, setInteractionGizmos] = useState<readonly Gizmo[]>([]);
    const interactionRef = useRef<Interaction | null>(null);

    const startInteraction = useCallback(
        (event: PointerInteractionEvent) => {
            if (interactionRef.current) return;
            const checkpoint = history.getCurrentPosition();

            const interaction = tools[toolId](event, history, activeStructureId, setInteractionGizmos);
            if (!interaction) return;

            interactionRef.current = interaction;
            setInteractionActive(true);

            const finish = () => {
                console.log('Finish called');
                interaction.finish();
                setInteractionActive(false);
                setInteractionGizmos([]);
                interactionRef.current = null;
                history.collapse(checkpoint + 1, history.getCurrentPosition(), actions => ({ type: 'Batch', actions }));
                window.removeEventListener('pointerup', finish);
                window.removeEventListener('blur', finish);
            };

            window.addEventListener('pointerup', finish);
            window.addEventListener('blur', finish);
        },
        [activeStructureId, history, toolId]
    );

    const updateInteraction = useCallback(
        (event: PointerInteractionEvent) => {
            if (!interactionRef.current) return;
            interactionRef.current.move(event);
        },
        [interactionRef]
    );

    return { startInteraction, updateInteraction, interactionActive, interactionGizmos };
}
