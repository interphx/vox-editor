import { Vector3 } from 'three';
import { Tool } from '../ui/interaction';
import { PointerInteractionEvent } from '../ui/pointer-interaction-event';
import { Vec3Dictionary } from '../utilities/vec3-dictionary';
import { worldToVoxel } from '../utilities/vector';

export const paint: Tool = (event, store, setGizmos) => {
    if (!event.face || !event.worldPoint) return null;

    const painted = new Vec3Dictionary<boolean>();

    const history = store.getHistory();

    const paint = (worldPos: Vector3, faceNormal: Vector3) => {
        const project = history.getCurrent();
        const voxelPos = worldToVoxel(worldPos, faceNormal);
        if (painted.has(voxelPos)) return;
        if (project.getBlock(voxelPos.x, voxelPos.y, voxelPos.z) === 0) return;
        painted.set(voxelPos, true);
        history.apply({
            type: 'SetBlock',
            structureId: store.selectedStructureId,
            position: voxelPos,
            blockId: store.selectedBlockId
        });
    };

    paint(event.worldPoint, event.face.normal);

    return {
        move(event: PointerInteractionEvent) {
            if (!event.face || !event.worldPoint) return;

            const worldPos = event.worldPoint;
            const faceNormal = event.face.normal;

            paint(worldPos, faceNormal);
        },

        finish() {}
    };
};
