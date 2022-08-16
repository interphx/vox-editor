import { runInAction } from 'mobx';
import { Vector3 } from 'three';
import { Action } from '../model/action';
import { BlockId } from '../structure';
import { Tool } from '../ui/interaction';
import { Vec3Dictionary } from '../utilities/vec3-dictionary';
import { getCoplanarAxes, getNonZeroAxis, projectToViewport, worldToVoxel } from '../utilities/vector';

const maxBlocksToSpawn = 200;
const maxBlocksToConsider = 512;
const maxArea = 256;
const coplanarNeighborOffsets = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
] as const;

export const planeExtruder: Tool = (event, store, setGizmos) => {
    const { worldPoint, face } = event;
    if (!worldPoint || !face) return null;

    const history = store.getHistory();
    const project = history.getCurrent();
    const checkpoint = history.getCurrentPosition();

    const originVoxel = worldToVoxel(worldPoint, face.normal);
    const originVoxelPosInViewport = projectToViewport(originVoxel, event.camera);
    const axis = getNonZeroAxis(face.normal);
    if (!axis) return null;

    const coplanarAxes = getCoplanarAxes(axis);

    const startingBlocks: { pos: Vector3; blockId: BlockId }[] = [];
    const viewed = new Vec3Dictionary<boolean>();
    const stack = [originVoxel];

    while (stack.length > 0) {
        const pos = stack.pop()!;
        if (viewed.has(pos)) continue;
        viewed.set(pos, true);
        const blockId = project.getBlock(pos.x, pos.y, pos.z);
        if (blockId === 0) continue;
        startingBlocks.push({ pos, blockId });

        if (viewed.size() >= maxBlocksToConsider) break;
        if (startingBlocks.length >= maxArea) break;

        for (const offset of coplanarNeighborOffsets) {
            const neighbor = pos.clone();
            neighbor[coplanarAxes[0]] += offset[0];
            neighbor[coplanarAxes[1]] += offset[1];
            stack.push(neighbor);
        }
    }

    let lastDiff: number | null = null;

    return {
        move(event) {
            const direction = face.normal;

            runInAction(() => {
                const nextVoxelCenter = originVoxel.clone();
                for (let spawned = 0; spawned < maxBlocksToSpawn; ++spawned) {
                    nextVoxelCenter.add(direction).round();
                    // TODO: Consider pointer direction, not just distance
                    const distanceFromNewVoxelToOriginalVoxelInViewport = projectToViewport(
                        nextVoxelCenter,
                        event.camera
                    ).distanceTo(originVoxelPosInViewport);
                    const distanceFromPointerToOriginalVoxelInViewport =
                        event.viewportPoint.distanceTo(originVoxelPosInViewport);
                    if (distanceFromNewVoxelToOriginalVoxelInViewport > distanceFromPointerToOriginalVoxelInViewport) {
                        break;
                    }
                }

                const diff = nextVoxelCenter[axis] - originVoxel[axis];
                if (diff === lastDiff) return;

                const sign = Math.sign(diff);
                const length = Math.abs(diff);

                history.goToPosition(checkpoint);

                const actions: Action[] = [];

                for (const { pos, blockId } of startingBlocks) {
                    const offsetPos = pos.clone();
                    for (let i = 1; i <= length; ++i) {
                        offsetPos[axis] += sign;
                        actions.push({
                            type: 'SetBlock',
                            structureId: store.selectedStructureId,
                            position: offsetPos.clone(),
                            blockId
                        });
                    }
                }

                history.apply({ type: 'Batch', actions });
            });
        },
        finish() {}
    };
};
