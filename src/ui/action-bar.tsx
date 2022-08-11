import { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { UiSize } from '../design';

export function ActionBar({ children }: PropsWithChildren) {
    return <Container>{children}</Container>;
}

const Container = styled.div`
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: ${UiSize.S};
    pointer-events: none;
    user-select: none;

    > * {
        pointer-events: all;
    }

    > :not(:last-child) {
        margin-bottom: ${UiSize.S};
    }
`;
