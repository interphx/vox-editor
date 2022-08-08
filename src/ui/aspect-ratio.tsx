import { HTMLAttributes, PropsWithChildren } from 'react';
import styled from 'styled-components';

type AspectRatioContainerProps = HTMLAttributes<HTMLDivElement> &
    PropsWithChildren<
        { aspectRatio: number } & (
            | { width: string | number; height?: undefined }
            | { height: string | number; width?: undefined }
        )
    >;

/**
 * Alternative to the aspect-ratio CSS property that works in all browsers.
 * Attaches an invisible image that stretches to the desired aspect ratio.
 * @props {AspectRatioContainerProps} Must contain either "width" or "height", not both
 * @returns {JSX.Element}
 */
export function AspectRatioContainer(props: AspectRatioContainerProps) {
    const { aspectRatio, width, height, children, ...rest } = props;
    const expanderStyle = width !== undefined ? { width, height: 'auto' } : { height, width: 'auto' };
    return (
        <Container {...rest}>
            <AspectRatioExpander style={expanderStyle} />
            <Children>{children}</Children>
        </Container>
    );
}

const Container = styled.div`
    position: relative;
`;

const Children = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
`;

const AspectRatioExpander = styled.img.attrs({
    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'></svg>"
})``;
