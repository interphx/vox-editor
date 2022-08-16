import { faPalette } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import styled from 'styled-components';
import { UiSize } from '../design';
import { useRootStore } from '../hooks/use-root-store';
import { shouldUseLightForeground } from '../utilities/color';
import { ToolButton } from './tool-button';

export const BlockTypePicker = observer(function ColorPicker() {
    const store = useRootStore();
    const colorId = store.selectedBlockId;
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
                        <Item
                            key={id}
                            title={name}
                            style={{ background: color }}
                            onClick={() => {
                                store.selectBlockType(id);
                                setOpen(false);
                            }}
                        ></Item>
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
    position: relative;
`;

const Colors = styled.div`
    flex: 1 0 auto;
    width: calc(${UiSize.ML} * 3);
    display: flex;
    flex-direction: row;
    flex-wrap: wrap-reverse;
    align-items: stretch;
    position: absolute;
    bottom: 0;
    left: calc(${UiSize.ML} + ${UiSize.XS});
`;

const Item = styled.button`
    border: 0;
    padding: 0;
    margin: 0;
    height: ${UiSize.ML};
    width: ${UiSize.ML};
    cursor: pointer;
    box-shadow: 0 0 0px 1px rgba(0, 0, 0, 1) inset;
`;
