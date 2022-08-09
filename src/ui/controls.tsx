import { extend, Object3DNode, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { OrbitControlsGizmo } from '../controls/orbit-gizmo';
import { OrbitControls } from '../controls/orbit-gizmo-controls';

extend({ OrbitControlsGizmo });

declare global {
    namespace JSX {
        interface IntrinsicElements {
            orbitControlsGizmo: Object3DNode<OrbitControlsGizmo, typeof OrbitControlsGizmo>;
        }
    }
}

export function Controls() {
    const camera = useThree(state => state.camera);
    const domElement = useThree(state => state.gl.domElement);

    const controls = useMemo(() => new OrbitControls(camera, domElement), [camera, domElement]);
    const gizmo = useMemo(() => new OrbitControlsGizmo(controls, {}), [controls]);

    useEffect(() => {
        document.body.appendChild(gizmo.domElement);
        return () => gizmo.domElement.remove();
    }, [gizmo.domElement]);

    // useFrame(() => {
    //     controls.update();
    // });

    //return <orbitControlsGizmo args={[controls, { size: 100, padding: 8 }]} />;
    return <></>;
}
