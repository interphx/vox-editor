import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import { BoxGeometry, EdgesGeometry, LineBasicMaterial } from 'three';
import { useMemoizedVector } from '../hooks/use-memoized-vector';
import { useRootStore } from '../hooks/use-root-store';
import { getDirectionQuaternion } from '../utilities/geometry';
import { worldToVoxel } from '../utilities/vector';

export const Cursor3d = observer(function Cursor3d() {
    const root = useRootStore();

    const normal = useMemoizedVector(root.debugData.face?.normal);
    const voxelPos = useMemoizedVector(
        root.debugData.worldPoint && normal ? worldToVoxel(root.debugData.worldPoint, normal) : null
    );

    return useMemo(() => {
        if (!voxelPos || !normal) return null;

        const blockOutline = (
            <lineSegments
                raycast={raycastNoop}
                position={voxelPos}
                geometry={cubeEdgesGeometry}
                material={cubeEdgesMaterial}
            />
        );

        const plane = (
            <mesh
                raycast={raycastNoop}
                quaternion={getDirectionQuaternion(voxelPos, normal)}
                position={voxelPos
                    .clone()
                    .add(normal.clone().multiplyScalar(0.5).add(normal.clone().multiplyScalar(0.01)))}
            >
                <meshBasicMaterial color={0xffffff} opacity={0.2} transparent={true} />
                <planeGeometry args={[1.01, 1.01]} />
            </mesh>
        );

        return (
            <>
                {blockOutline}
                {plane}
            </>
        );
    }, [normal, voxelPos]);
});

const raycastNoop = () => {};
const cubeEdgesGeometry = new EdgesGeometry(new BoxGeometry(1.01, 1.01, 1.01));
const cubeEdgesMaterial = new LineBasicMaterial({ color: 0xffffff });
