import styled from 'styled-components';
import { UiColor, UiSize } from '../design';
import { useRootStore } from '../hooks/use-root-store';
import { StyledProps } from '../types/props';
import { downloadAsFile, readUploadedFileAsString } from '../utilities/dom';

export function ProjectActions({ style, className }: StyledProps) {
    const rootStore = useRootStore();

    return (
        <Container style={style} className={className}>
            <Header></Header>
            <ActionButton
                onClick={() => {
                    const data = rootStore.getHistory().getCurrent().export();
                    const json = JSON.stringify(data);
                    downloadAsFile(json, `blocks-${new Date().getTime()}.json`);
                }}
            >
                Export
            </ActionButton>
            <ActionButton
                onClick={async () => {
                    const json = await readUploadedFileAsString();
                    const data = JSON.parse(json);
                    rootStore.importProject(data);
                }}
            >
                Import
            </ActionButton>
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
    background: #444444; /* TODO: Add to UiColor? */
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
