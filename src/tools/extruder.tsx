import { runInAction } from 'mobx';
import { Vector2, Vector3 } from 'three';
import { Gizmo } from '../rendering/gizmo';
import { Arrow3d } from '../ui/arrow-3d';
import { InteractionFactory } from '../ui/interaction';
import { minBy } from '../utilities/array';
import { projectToViewport, vecToString, worldToVoxel } from '../utilities/vector';

export const extruder: InteractionFactory = (event, history, setGizmos) => {
    if (!event.face || !event.worldPoint) return null;
    const worldStartVoxelPos = worldToVoxel(event.worldPoint, event.face.normal);
    const viewportStartVoxelPos = projectToViewport(worldStartVoxelPos, event.camera);
    const dirs = [
        new Vector3(-1, 0, 0),
        new Vector3(+1, 0, 0),
        new Vector3(0, -1, 0),
        new Vector3(0, +1, 0),
        new Vector3(0, 0, -1),
        new Vector3(0, 0, +1)
    ].map(worldVector => ({
        worldVector,
        viewportVectorRaw: projectToViewport(worldVector, event.camera),
        viewportVector: projectToViewport(worldVector, event.camera).normalize()
    }));

    const checkpoint = history.getCurrentPosition();

    const generateGizmos = (mouseVector: Vector2 | null, activeDir: typeof dirs[number] | null) => {
        const gizmos: Gizmo[] = [];

        gizmos.push({
            type: '2d-dot',
            color: 'cyan',
            pos: viewportStartVoxelPos
        });

        if (mouseVector) {
            for (const dir of dirs) {
                const dot = Math.abs(1 - dir.viewportVector.dot(mouseVector));
                gizmos.push({
                    type: '2d-text',
                    color: 'white',
                    pos: viewportStartVoxelPos.clone().add(dir.viewportVectorRaw),
                    text: `${dot.toFixed(2)}`
                });
            }
        }

        gizmos.push(
            ...dirs.map(dir => ({
                type: '3d' as const,
                threeElement: (
                    <Arrow3d
                        key={vecToString(dir.worldVector)}
                        startPosition={worldStartVoxelPos}
                        direction={dir.worldVector}
                        length={2}
                        color={dir === activeDir ? 'lime' : '#DDDDDD'}
                    />
                )
            }))
        );

        return gizmos;
    };

    setGizmos(generateGizmos(null, null));

    return {
        move(event) {
            const vector = event.viewportPoint.clone().sub(viewportStartVoxelPos).normalize();
            const direction = minBy(dirs, dir => Math.abs(1 - dir.viewportVector.dot(vector)));

            runInAction(() => {
                history.goToPosition(checkpoint);

                const maxCubesToSpawn = 100;
                let spawned = 0;
                let pt = worldStartVoxelPos.clone();
                while (true) {
                    if (spawned >= maxCubesToSpawn) break;
                    spawned += 1;
                    pt.add(direction.worldVector).round();
                    const distanceFromNewVoxelToOriginalVoxelInViewport = projectToViewport(
                        pt,
                        event.camera
                    ).distanceTo(viewportStartVoxelPos);
                    const distanceFromPointerToOriginalVoxelInViewport =
                        event.viewportPoint.distanceTo(viewportStartVoxelPos);
                    if (distanceFromNewVoxelToOriginalVoxelInViewport > distanceFromPointerToOriginalVoxelInViewport) {
                        break;
                    }
                    history.apply({
                        type: 'SetBlock',
                        structureId: history.getCurrent().activeStructureId,
                        position: pt.clone(),
                        blockId: history.getCurrent().selectedBlockId
                    });
                }
                pt.sub(direction.worldVector).round();
            });

            setGizmos(generateGizmos(vector, direction));
        },
        finish() {}
    };
};
