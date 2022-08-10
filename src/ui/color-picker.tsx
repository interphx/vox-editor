import { faPalette } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import styled from 'styled-components';
import { useRootStore } from '../hooks/use-root-store';
import { shouldUseLightForeground } from '../utilities/color';
import { AspectRatioContainer } from './aspect-ratio';
import { ToolButton } from './tool-button';

export const BlockTypePicker = observer(function ColorPicker() {
    const store = useRootStore();
    const colorId = store.getSelectedBlockId();
    const project = store.getHistory().getCurrent();
    const palette = project.getPalette();
    const color = palette.getById(colorId)!.color;
    const [open, setOpen] = useState(false);
    return (
        <Container>
            <ToolButton
                active={false}
                onClick={() => setOpen(!open)}
                title="Palette"
                style={{
                    flex: '0 0 auto',
                    background: color,
                    color: shouldUseLightForeground(color) ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
                }}
            >
                <FontAwesomeIcon icon={faPalette} />
            </ToolButton>
            {open && (
                <Colors>
                    {palette.getAll().map(({ id, color, name }) => (
                        <AspectRatioContainer key={id} height="100%" aspectRatio={1}>
                            <Item style={{ background: color }} onClick={() => store.selectBlockType(id)}></Item>
                        </AspectRatioContainer>
                    ))}
                </Colors>
            )}
        </Container>
    );
});

const Container = styled.div`
    display: flex;
    flex-direction: row;
    align-items: stretch;
`;

const Colors = styled.div`
    flex: 1 0 auto;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: stretch;
`;

const Item = styled.button`
    border: 0;
    padding: 0;
    margin: 0;
    height: 100%;
    width: 100%;
    cursor: pointer;
`;
