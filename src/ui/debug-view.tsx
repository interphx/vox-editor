import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { UiColor, UiSize } from '../design';
import { useRootStore } from '../hooks/use-root-store';
import { StyledProps } from '../types/props';
import { vecToString } from '../utilities/vector';

export const DebugView = observer(function DebugView({ style, className }: StyledProps) {
    const store = useRootStore();
    const { face, threeObject, worldPoint, viewportPoint } = store.debugData;

    return (
        <Container style={style} className={className}>
            <Header>Debug Info</Header>
            <Table>
                <tbody>
                    <tr>
                        <Title>World pos:</Title>
                        <Value>{worldPoint ? vecToString(worldPoint) : '-'}</Value>
                    </tr>
                    <tr>
                        <Title>Pointer:</Title>
                        <Value>{viewportPoint ? vecToString(viewportPoint) : '-'}</Value>
                    </tr>
                    <tr>
                        <Title>Normal:</Title>
                        <Value>{face ? vecToString(face.normal) : '-'}</Value>
                    </tr>
                    <tr>
                        <Title>Three.js obj:</Title>
                        <Value>{threeObject ? threeObject.id : '-'}</Value>
                    </tr>
                </tbody>
            </Table>
        </Container>
    );
});

const Container = styled.div`
    flex: 0 0 auto;
    color: ${UiColor.text};
    padding: ${UiSize.XS};
    user-select: none;
`;

const Header = styled.h3`
    padding: ${UiSize.XS} 0;
    margin: 0;
    font-size: ${UiSize.S};
    font-weight: bold;
    border-top: 1px solid ${UiColor.separator};
`;

const Table = styled.table`
    width: 100%;
    padding: 0;
`;

const Title = styled.th`
    text-align: left;
    font-weight: normal;
    color: ${UiColor.text};
    padding: 0;
`;

const Value = styled.td`
    text-align: right;
    padding: 0;
`;
