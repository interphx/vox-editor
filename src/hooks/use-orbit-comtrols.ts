import { useEffect, useRef } from 'react';
import { OrthographicCamera, PerspectiveCamera } from 'three';
import { OrbitControls } from '../controls/orbit-gizmo-controls';

export function useOrbitControls(
    canvas: HTMLCanvasElement | null,
    camera: PerspectiveCamera | OrthographicCamera,
    enable: boolean
) {
    const orbitControlsRef = useRef<OrbitControls | null>(null);
    useEffect(() => {
        if (!canvas) return () => {};
        const controls = new OrbitControls(camera, canvas);
        orbitControlsRef.current = controls;
        return () => orbitControlsRef.current?.dispose();
    }, [camera, canvas]);

    useEffect(() => {
        if (!orbitControlsRef.current) return;
        orbitControlsRef.current.enabled = enable;
    }, [enable]);
}
