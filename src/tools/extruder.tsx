import { runInAction } from 'mobx';
import { Vector2, Vector3 } from 'three';
import { Gizmo } from '../model/gizmo';
import { Arrow3d } from '../ui/arrow-3d';
import { Tool } from '../ui/interaction';
import { minBy } from '../utilities/array';
import { projectToViewport, vecToString, worldToVoxel } from '../utilities/vector';

const maxCubesToSpawn = 100;
const cardinalDirections = [
    new Vector3(-1, 0, 0),
    new Vector3(+1, 0, 0),
    new Vector3(0, -1, 0),
    new Vector3(0, +1, 0),
    new Vector3(0, 0, -1),
    new Vector3(0, 0, +1)
];

export const extruder: Tool = (event, store, setGizmos) => {
    if (!event.face || !event.worldPoint) return null;
    const startVoxelPosInWorld = worldToVoxel(event.worldPoint, event.face.normal);
    const startVoxelPosInViewport = projectToViewport(startVoxelPosInWorld, event.camera);

    const dirs = cardinalDirections.map(absoluteVector => {
        const projected = projectToViewport(startVoxelPosInWorld.clone().add(absoluteVector), event.camera)
            .clone()
            .sub(projectToViewport(startVoxelPosInWorld, event.camera));
        return {
            worldVector: absoluteVector,
            viewportVector: projected,
            viewportVectorNormalized: projected.clone().normalize()
        };
    });

    const history = store.getHistory();
    const checkpoint = history.getCurrentPosition();

    const generateGizmos = (mouseVector: Vector2 | null, activeDir: typeof dirs[number] | null) => {
        const cardinalArrows: Gizmo[] = dirs.map(dir => ({
            type: '3d' as const,
            threeElement: (
                <Arrow3d
                    key={vecToString(dir.worldVector)}
                    startPosition={startVoxelPosInWorld}
                    direction={dir.worldVector}
                    length={2}
                    color={dir === activeDir ? 'lime' : '#DDDDDD'}
                />
            )
        }));

        return cardinalArrows;
    };

    setGizmos(generateGizmos(null, null));

    return {
        move(event) {
            const vector = event.viewportPoint.clone().sub(startVoxelPosInViewport).normalize();
            const direction = minBy(dirs, dir => Math.abs(1 - dir.viewportVectorNormalized.dot(vector)));

            runInAction(() => {
                history.goToPosition(checkpoint);

                let nextVoxelCenter = startVoxelPosInWorld.clone();
                for (let spawned = 0; spawned < maxCubesToSpawn; ++spawned) {
                    nextVoxelCenter.add(direction.worldVector).round();
                    const distanceFromNewVoxelToOriginalVoxelInViewport = projectToViewport(
                        nextVoxelCenter,
                        event.camera
                    ).distanceTo(startVoxelPosInViewport);
                    const distanceFromPointerToOriginalVoxelInViewport =
                        event.viewportPoint.distanceTo(startVoxelPosInViewport);
                    if (distanceFromNewVoxelToOriginalVoxelInViewport > distanceFromPointerToOriginalVoxelInViewport) {
                        break;
                    }
                    history.apply({
                        type: 'SetBlock',
                        structureId: store.selectedStructureId,
                        position: nextVoxelCenter.clone(),
                        blockId: store.selectedBlockId
                    });
                }
            });

            setGizmos(generateGizmos(vector, direction));
        },
        finish() {}
    };
};
