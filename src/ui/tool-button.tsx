import styled from 'styled-components';
import { UiColor, UiSize } from '../design';

export const ToolButton = styled.button<{ readonly active: boolean }>`
    position: relative;
    outline: none;
    background: ${props => (props.active ? UiColor.buttonHover : UiColor.button)};
    border: none;
    height: ${UiSize.ML};
    width: ${UiSize.ML};
    padding: 0;
    margin: 0;
    font-size: 1.5em;
    color: ${props => (props.active ? UiColor.active : UiColor.inactive)};
    cursor: pointer;
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.25);

    &:hover {
        background: ${UiColor.buttonHover};
    }
`;
