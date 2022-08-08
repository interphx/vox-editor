import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import styled from 'styled-components';
import { Palette } from '../rendering/palette';
import { AspectRatioContainer } from './aspect-ratio';
import { ToolButton } from './tool-button';

export const ColorPicker = observer(function ColorPicker({
    getPalette,
    getCurrentColorId: getCurrentColor,
    onColorSelect
}: {
    getPalette: () => Palette;
    getCurrentColorId: () => number;
    onColorSelect: (colorId: number) => void;
}) {
    const colorId = getCurrentColor();
    const palette = getPalette();
    const [open, setOpen] = useState(false);
    return (
        <Container>
            <ToolButton
                active={false}
                onClick={() => setOpen(!open)}
                style={{ flex: '0 0 auto', background: palette.getById(colorId)!.color }}
            >
                P
            </ToolButton>
            {open && (
                <Colors>
                    {palette.getAll().map(({ id, color, name }) => (
                        <Item
                            key={id}
                            height="100%"
                            aspectRatio={1}
                            style={{ background: color }}
                            onClick={() => onColorSelect(id)}
                        >
                            C
                        </Item>
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

const Item = styled(AspectRatioContainer)``;
