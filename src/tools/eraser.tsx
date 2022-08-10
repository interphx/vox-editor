import { Vector3 } from 'three';
import { Tool } from '../ui/interaction';
import { PointerInteractionEvent } from '../ui/pointer-interaction-event';
import { Vec3Dictionary } from '../utilities/vec3-dictionary';
import { worldToVoxel } from '../utilities/vector';

export const eraser: Tool = (event, store, setGizmos) => {
    if (!event.face || !event.worldPoint) return null;

    const erased = new Vec3Dictionary<boolean>();

    const history = store.getHistory();

    const eraseVoxel = (worldPos: Vector3, faceNormal: Vector3) => {
        const project = history.getCurrent();
        const voxelPos = worldToVoxel(worldPos, faceNormal);
        if (!project.getBlock(voxelPos.x, voxelPos.y, voxelPos.z)) return;
        const neighborPos = worldToVoxel(worldPos, faceNormal).clone().add(faceNormal).floor();
        if (erased.has(neighborPos)) return;
        erased.set(voxelPos, true);
        history.apply({
            type: 'SetBlock',
            structureId: store.getSelectedStructureId(),
            position: voxelPos,
            blockId: 0
        });
    };

    eraseVoxel(event.worldPoint, event.face.normal);

    return {
        move(event: PointerInteractionEvent) {
            if (!event.face || !event.worldPoint) return;

            const worldPos = event.worldPoint;
            const faceNormal = event.face.normal;

            eraseVoxel(worldPos, faceNormal);
        },

        finish() {}
    };
};
