import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import { HTMLAttributes } from 'react';
import styled from 'styled-components';
import { UiColor, UiSize } from '../design';
import { useRootStore } from '../hooks/use-root-store';
import { SimpleStructure } from '../structure';

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
    const structures = root.canHaveChildren() ? root.getChildren() : [root];
    const activeStructureId = store.getSelectedStructureId();

    const rows = structures.map(structure => (
        <Item
            active={activeStructureId === structure.id}
            key={structure.id}
            onClick={() => store.selectStructure(structure.id)}
        >
            <Title>{structure.id}</Title>
            <ItemActions>
                {structures.length > 1 && (
                    <MiniIconButton
                        onClick={event => {
                            event.stopPropagation();
                            event.preventDefault();
                            history.apply({ type: 'RemoveStructure', structureId: structure.id });
                        }}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </MiniIconButton>
                )}
                <MiniIconButton
                    onClick={event => {
                        event.stopPropagation();
                        event.preventDefault();
                        structure.setVisibility(!structure.visible);
                    }}
                >
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
    const max = existingNames.reduce((max, name) => {
        const match = name.match(layerNameRegEx);
        if (!match || match.length < 2) return max;
        const value = Number(match[1]);
        if (!isFinite(value)) return max;
        return value > max ? value : max;
    }, 0);
    return `Layer ${max + 1}`;
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
    padding: ${UiSize.XS};
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
