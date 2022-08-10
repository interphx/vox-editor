import { useCallback, useRef, useState } from 'react';
import { Gizmo } from '../rendering/gizmo';
import { RootStore } from '../rendering/root-store';
import { ToolId, tools } from '../tools';
import { Interaction } from '../ui/interaction';
import { PointerInteractionEvent } from '../ui/pointer-interaction-event';

export function useInteraction(toolId: ToolId, store: RootStore) {
    const [interactionActive, setInteractionActive] = useState(false);
    const [interactionGizmos, setInteractionGizmos] = useState<readonly Gizmo[]>([]);
    const interactionRef = useRef<Interaction | null>(null);

    const startInteraction = useCallback(
        (event: PointerInteractionEvent) => {
            if (interactionRef.current) return;
            const history = store.getHistory();
            const checkpoint = history.getCurrentPosition();

            const tool = tools.find(({ id }) => id === toolId)?.tool;
            const interaction = tool?.(event, store, setInteractionGizmos);
            if (!interaction) return;

            interactionRef.current = interaction;
            setInteractionActive(true);

            const finish = () => {
                interaction.finish();
                setInteractionActive(false);
                setInteractionGizmos([]);
                interactionRef.current = null;
                if (history.getCurrentPosition() !== checkpoint) {
                    // Make sure the tool use can be undone in one go
                    history.collapse(checkpoint + 1, history.getCurrentPosition(), actions => ({
                        type: 'Batch',
                        actions
                    }));
                }
                window.removeEventListener('pointerup', finish);
                window.removeEventListener('blur', finish);
            };

            window.addEventListener('pointerup', finish);
            window.addEventListener('blur', finish);
        },
        [store, toolId]
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
