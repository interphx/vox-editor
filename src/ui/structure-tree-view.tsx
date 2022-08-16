import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React from 'react';
import styled from 'styled-components';
import { UiColor, UiSize } from '../design';
import { useRootStore } from '../hooks/use-root-store';
import { SimpleStructure, Structure } from '../structure';
import { StyledProps } from '../types/props';

export const StructureTreeView = observer(function StructureTreeView({ style, className }: StyledProps) {
    const store = useRootStore();
    const history = store.getHistory();
    const root = history.getCurrent().getRoot();
    const structures = root.isContainer() ? root.getChildren() : [root];
    const activeStructureId = store.selectedStructureId;

    const createDeletionHandler = (structure: Structure) => (event: React.SyntheticEvent) => {
        event.stopPropagation();
        event.preventDefault();
        history.apply({ type: 'RemoveStructure', structureId: structure.id });
    };

    const createVisibilityHandler = (structure: Structure) => (event: React.SyntheticEvent) => {
        event.stopPropagation();
        event.preventDefault();
        history.apply({
            type: 'SetStructureVisibility',
            structureId: structure.id,
            visible: !structure.visible
        });
    };

    const rows = structures.map(structure => (
        <Item
            active={activeStructureId === structure.id}
            key={structure.id}
            onClick={() => store.selectStructure(structure.id)}
        >
            <Title>{structure.id}</Title>
            <ItemActions>
                {structures.length > 1 && (
                    <MiniIconButton onClick={createDeletionHandler(structure)}>
                        <FontAwesomeIcon icon={faTrash} />
                    </MiniIconButton>
                )}
                <MiniIconButton onClick={createVisibilityHandler(structure)}>
                    <FontAwesomeIcon icon={structure.visible ? faEye : faEyeSlash} />
                </MiniIconButton>
            </ItemActions>
        </Item>
    ));

    return (
        <Container style={style} className={className}>
            {rows}
            <Actions>
                <IconButton
                    title="Add layer"
                    onClick={() => {
                        const id = generateLayerName(structures.map(structure => structure.id));
                        const structure = SimpleStructure.empty(id);
                        history.apply({ type: 'AddStructure', structure });
                        store.selectStructure(id);
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} />
                </IconButton>
            </Actions>
        </Container>
    );
});

const layerNameRegEx = /^\s*layer\s*(\d+)\s*/i;
function generateLayerName(existingNames: readonly string[]) {
    const maxIndex = existingNames.reduce((max, name) => {
        const match: RegExpMatchArray | null = name.match(layerNameRegEx);
        if (!match || match.length < 2) return max;
        const value = Number(match[1]);
        if (!isFinite(value)) return max;
        return value > max ? value : max;
    }, 0);
    return `Layer ${maxIndex + 1}`;
}

const Actions = styled.div``;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    color: white;
    user-select: none;
    flex: 1 1 auto;
    overflow: auto;
`;

const Item = styled.div<{ active: boolean }>`
    display: flex;
    flex-direction: row;
    background: ${props => (props.active ? UiColor.backgroundSelected : 'none')};
    border-color: ${UiColor.borderSelected};
    border-style: solid;
    border-width: 0;
    border-top-width: ${props => (props.active ? '1px' : '0')};
    border-bottom-width: ${props => (props.active ? '1px' : '0')};
    box-sizing: border-box;
    padding: ${props => (props.active ? `calc(${UiSize.XS} - 1px)` : UiSize.XS)} ${UiSize.XS};
    font-size: ${UiSize.S};
    cursor: pointer;
`;

const Title = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    flex: 1 1 auto;
`;

const ItemActions = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;

const MiniIconButton = styled.button`
    border: 0;
    background: none;
    margin: 0;
    padding: 0;
    width: 1.25rem;
    font-size: 1rem;
    color: ${UiColor.inactive};
    cursor: pointer;

    &:not(:last-child) {
        margin-right: 0.5rem;
    }

    &:hover {
        color: ${UiColor.textHover};
    }
`;

const IconButton = styled.button`
    border: 0;
    background: none;
    margin: 0;
    padding: ${UiSize.XS};
    font-size: 1.5rem; /* TODO: Add to UiSize? */
    color: ${UiColor.inactive};
    cursor: pointer;

    &:hover {
        color: ${UiColor.textHover};
    }
`;
