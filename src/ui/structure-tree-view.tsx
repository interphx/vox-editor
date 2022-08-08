import { observer } from 'mobx-react-lite';
import { HTMLAttributes } from 'react';
import styled from 'styled-components';
import { UiColor } from '../design';
import { useRootStore } from '../hooks/use-root-store';
import { SimpleStructure } from '../structure';
import { randomInteger } from '../utilities/random';

export const StructureTreeView = observer(function StructureTreeView({
    style,
    className
}: {
    style?: HTMLAttributes<HTMLDivElement>['style'];
    className?: string;
}) {
    const store = useRootStore();
    const history = store.getHistory();
    const root = history.getCurrent().getRoot();
    const structures = root.canHaveChildren() ? [root, ...root.getChildren()] : [root];
    const activeStructureId = store.getSelectedStructureId();

    const rows = structures.map(structure => (
        <Item
            active={activeStructureId === structure.id}
            key={structure.id}
            onClick={() => store.selectStructure(structure.id)}
        >
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
                        const id = Math.random().toString(32).slice(2);
                        const structure = SimpleStructure.fromSingleBlock(
                            id,
                            randomInteger(-4, 5),
                            randomInteger(-4, 5),
                            randomInteger(-4, 5),
                            1
                        );
                        history.apply({ type: 'AddStructure', structure });
                        store.selectStructure(id);
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
