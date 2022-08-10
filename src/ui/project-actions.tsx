import styled from 'styled-components';
import { UiColor, UiSize } from '../design';
import { StyledProps } from '../types/props';

export function ProjectActions({ style, className }: StyledProps) {
    return (
        <Container style={style} className={className}>
            <Header></Header>
            <ActionButton>Export</ActionButton>
            <ActionButton>Import</ActionButton>
        </Container>
    );
}

const Container = styled.div`
    flex: 0 0 auto;
    color: ${UiColor.text};
    padding: ${UiSize.XS};
    user-select: none;
`;

const Header = styled.h3`
    padding: ${UiSize.XS} 0 0 0;
    margin: 0;
    font-size: ${UiSize.S};
    font-weight: bold;
    border-top: 1px solid ${UiColor.separator};
`;

const ActionButton = styled.button`
    outline: none;
    background: #444444;
    border: none;
    width: 100%;
    padding: ${UiSize.XS};
    margin: 0;
    font-size: ${UiSize.S};
    color: ${UiColor.text};
    cursor: pointer;
    box-sizing: border-box;
    text-align: center;

    &:hover {
        background: #555555;
        color: ${UiColor.active};
    }

    &:not(:last-child) {
        margin-bottom: ${UiSize.XS};
    }
`;
