import * as fc from 'fast-check';
import { SimpleActionHistory } from '../utilities/action-history';

describe('ActionHistory properties', () => {
    const sum = (nums: readonly number[]) => nums.reduce((sum, num) => sum + num, 0);

    const createMutableHistory = (initialCount: number) =>
        new SimpleActionHistory(
            { count: initialCount },
            (state, delta: number) => {
                state.count += delta;
                return state;
            },
            state => ({ ...state } as const),
            (state, snapshot) => {
                state.count = snapshot.count;
                return state;
            },
            2
        );

    const createImmutableHistory = (initialCount: number) =>
        new SimpleActionHistory(
            { count: initialCount } as { readonly count: number },
            (state, delta: number) => ({ ...state, count: state.count + delta }),
            state => ({ ...state } as const),
            (state, snapshot) => ({ count: snapshot.count } as const),
            2
        );

    type TestHistory = ReturnType<typeof createMutableHistory> | ReturnType<typeof createImmutableHistory>;

    const arbitraryIntegerInterval = (min: number, max: number) =>
        fc
            .tuple(fc.integer({ min, max }), fc.integer({ min, max }))
            .map(([a, b]) => (a <= b ? ([a, b] as const) : ([b, a] as const)));
    const initial = fc.integer({ min: -10000, max: 10000 });
    const actions = fc.array(fc.integer({ min: -1000, max: 1000 }), { maxLength: 1500 });
    const type = fc.oneof(fc.constant('mutable' as const), fc.constant('immutable' as const));
    const params = fc.tuple(initial, actions, type).chain(([initial, actions, type]) => {
        const undos = fc.nat(actions.length);
        const collapses = fc.array(
            arbitraryIntegerInterval(0, actions.length).map(([from, to]) => ({ from, to })),
            { maxLength: 1 }
        );
        return fc.record({
            initial: fc.constant(initial),
            actions: fc.constant(actions),
            type: fc.constant(type),
            collapses,
            undos
        });
    });

    const createHistory = ({ initial, type, actions, collapses }: ReturnType<typeof params['generate']>['value']) => {
        const history = (type === 'immutable' ? createImmutableHistory : createMutableHistory)(initial);
        for (const action of actions) history.apply(action);
        for (const { from, to } of collapses) history.collapse(from, to, sum);
        return history;
    };

    it('does not change state when N undos are followed by N redos', () => {
        fc.assert(
            fc.property(params, params => {
                const { undos } = params;
                const history = createHistory(params);
                const initialState = JSON.parse(JSON.stringify(history.getCurrent()));
                for (let i = 0; i < undos; ++i) history.undo();
                for (let i = 0; i < undos; ++i) history.redo();
                expect(initialState).toEqual(history.getCurrent());
            })
        );
    });
});
