import { Vector3 } from 'three';
import { InteractionFactoryV2 } from '../ui/interaction';
import { PointerInteractionEvent } from '../ui/pointer-interaction-event';
import { Vec3Dictionary } from '../utilities/vec3-dictionary';
import { worldToVoxel } from '../utilities/vector';

export const pencil: InteractionFactoryV2 = (event, history, activeStructureId, setGizmos) => {
    if (!event.face || !event.worldPoint) return null;

    const drawn = new Vec3Dictionary<boolean>();

    const placeVoxelOnFace = (worldPos: Vector3, faceNormal: Vector3) => {
        const world = history.getCurrent();
        const voxelPos = worldToVoxel(worldPos, faceNormal);
        if (!world.getBlock(voxelPos.x, voxelPos.y, voxelPos.z)) return;
        if (drawn.has(voxelPos)) return;
        const newVoxelPos = voxelPos.clone().add(faceNormal).floor();
        if (world.getBlock(newVoxelPos.x, newVoxelPos.y, newVoxelPos.z)) return;
        drawn.set(newVoxelPos, true);
        history.apply({
            type: 'SetBlock',
            structureId: activeStructureId,
            position: newVoxelPos,
            blockId: 1
        });
    };

    placeVoxelOnFace(event.worldPoint, event.face.normal);

    return {
        move(event: PointerInteractionEvent) {
            if (!event.face || !event.worldPoint) return;

            const worldPos = event.worldPoint;
            const faceNormal = event.face.normal;

            placeVoxelOnFace(worldPos, faceNormal);
        },

        finish() {}
    };
};
