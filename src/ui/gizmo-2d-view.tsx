import { useEffect, useRef } from 'react';
import { ArrowGizmo2d, DotGizmo2d, Gizmo2d, TextGizmo2d } from '../rendering/gizmo';
import { remap } from '../utilities/math';

export function Gizmo2dView({ gizmo }: { gizmo: Gizmo2d }) {
    switch (gizmo.type) {
        case '2d-arrow':
            return <Arrow2d arrow={gizmo} />;
        case '2d-text':
            return <Text2d text={gizmo} />;
        case '2d-dot':
            return <Dot2d dot={gizmo} />;
    }
}

function Arrow2d({ arrow }: { arrow: ArrowGizmo2d }) {
    const { start, end, color } = arrow;
    const elementRef = useRef<HTMLDivElement>(null);
    const updateSize = () => {
        const element = elementRef.current;
        if (!element) return;
        const parent = element.parentElement;
        if (!parent) return;

        const startX = remap(arrow.start.x, -1, 1, 0, parent.clientWidth);
        const startY = remap(arrow.start.y, 1, -1, 0, parent.clientHeight);
        const endX = remap(arrow.end.x, -1, 1, 0, parent.clientWidth);
        const endY = remap(arrow.end.y, 1, -1, 0, parent.clientHeight);

        const dx = endX - startX;
        const dy = endY - startY;

        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        element.style.left = `${Math.round(startX)}px`;
        element.style.top = `${Math.round(startY)}px`;
        element.style.width = `${Math.round(length)}px`;
        element.style.transform = `rotate(${angle.toFixed(4)}rad)`;
    };
    useEffect(() => {
        updateSize();
    });
    return (
        <>
            <div
                ref={elementRef}
                style={{
                    position: 'absolute',
                    height: '1px',
                    background: color,
                    boxSizing: 'border-box',
                    padding: 0,
                    margin: 0,
                    transformOrigin: 'top left'
                }}
            ></div>
            <Gizmo2dView gizmo={{ type: '2d-dot', pos: start, color: 'green' }} />
            <Gizmo2dView gizmo={{ type: '2d-dot', pos: end, color: 'blue' }} />
        </>
    );
}

function Text2d({ text }: { text: TextGizmo2d }) {
    return (
        <div
            style={{
                width: '16px',
                height: '16px',
                position: 'absolute',
                top: `${((1 - text.pos.y) / 2) * 100}%`,
                left: `${((text.pos.x + 1) / 2) * 100}%`,
                transform: 'translate(-50%, -50%)',
                color: text.color,
                pointerEvents: 'none',
                userSelect: 'none'
            }}
        >
            {text.text}
        </div>
    );
}

function Dot2d({ dot }: { dot: DotGizmo2d }) {
    return (
        <div
            style={{
                width: '16px',
                height: '16px',
                position: 'absolute',
                top: `${((1 - dot.pos.y) / 2) * 100}%`,
                left: `${((dot.pos.x + 1) / 2) * 100}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: dot.color,
                borderRadius: '50%',
                pointerEvents: 'none',
                userSelect: 'none'
            }}
        ></div>
    );
}
