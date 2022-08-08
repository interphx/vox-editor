import { observer } from 'mobx-react-lite';
import { HTMLAttributes } from 'react';
import styled from 'styled-components';
import { UiColor } from '../design';
import { Action } from '../rendering/action';
import { ProjectStore } from '../rendering/project-store';
import { SimpleStructure, Structure, StructureId } from '../structure';
import { ActionHistory } from '../utilities/action-history';
import { randomInteger } from '../utilities/random';

export const StructureTreeView = observer(function StructureTreeView({
    history,
    activeStructureId,
    onItemSelect,
    style,
    className
}: {
    history: ActionHistory<ProjectStore, Action>;
    activeStructureId: StructureId;
    onItemSelect: (structure: Structure) => void;
    style?: HTMLAttributes<HTMLDivElement>['style'];
    className?: string;
}) {
    const root = history.getCurrent().getRoot();
    const structures = root.canHaveChildren() ? [root, ...root.getChildren()] : [root];

    const rows = structures.map(structure => (
        <Item active={activeStructureId === structure.id} key={structure.id} onClick={() => onItemSelect(structure)}>
            <Title>{structure.id}</Title>
            <ItemActions>
                <button
                    onClick={event => {
                        event.stopPropagation();
                        event.preventDefault();
                        history.apply({ type: 'RemoveStructure', structureId: structure.id });
                    }}
                >
                    Del
                </button>
                <button
                    onClick={event => {
                        event.stopPropagation();
                        event.preventDefault();
                        structure.setVisibility(!structure.visible);
                    }}
                >
                    Vis
                </button>
            </ItemActions>
        </Item>
    ));

    return (
        <Container style={style} className={className}>
            {rows}
            <Actions>
                <button
                    onClick={() => {
                        const structure = SimpleStructure.fromSingleBlock(
                            Math.random().toString(32).slice(2),
                            randomInteger(-4, 5),
                            randomInteger(-4, 5),
                            randomInteger(-4, 5),
                            1
                        );
                        history.apply({ type: 'AddStructure', structure });
                    }}
                >
                    Add
                </button>
            </Actions>
        </Container>
    );
});

const Actions = styled.div``;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    color: white;
`;

const Item = styled.div<{ active: boolean }>`
    display: flex;
    flex-direction: row;
    background: ${props => (props.active ? UiColor.backgroundSelected : 'none')};
`;

const Title = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const ItemActions = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;