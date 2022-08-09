import { ActionHistory, SimpleActionHistory } from '../utilities/action-history';

describe('SimpleHistory', () => {
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

    const createTestHistories = () => [createMutableHistory(0), createImmutableHistory(0)];

    const historiesEqual = <State, Action>(
        a: ActionHistory<State, Action>,
        b: ActionHistory<State, Action>,
        statesEqual: (stateA: State, stateB: State) => boolean
    ) => {
        if (a.size() !== b.size()) return false;
        if (a.getCurrentPosition() !== b.getCurrentPosition()) return false;
        while (a.canRedo()) {
            if (!b.canRedo()) return false;
            a.redo();
            b.redo();
            if (!statesEqual(a.getCurrent(), b.getCurrent())) return false;
        }
        while (a.canUndo()) {
            if (!b.canUndo()) return false;
            a.undo();
            b.undo();
            if (!statesEqual(a.getCurrent(), b.getCurrent())) return false;
        }
        return true;
    };

    const expectHistoriesEqual = <State, Action>(a: ActionHistory<State, Action>, b: ActionHistory<State, Action>) => {
        expect(a.size()).toEqual(b.size());
        const aInitialPos = a.getCurrentPosition();
        const bInitialPos = b.getCurrentPosition();
        expect(aInitialPos).toEqual(bInitialPos);
        expect(a.getCurrent()).toEqual(b.getCurrent());
        while (a.canRedo()) {
            expect(b.canRedo()).toBe(true);
            a.redo();
            b.redo();
            expect(a.getCurrent()).toEqual(b.getCurrent());
        }
        while (a.canUndo()) {
            expect(b.canUndo()).toBe(true);
            a.undo();
            b.undo();
            expect(a.getCurrent()).toEqual(b.getCurrent());
        }
        a.goToPosition(aInitialPos);
        b.goToPosition(bInitialPos);
    };

    it.each(createTestHistories())('undoes actions', history => {
        history.apply(10);
        history.undo();

        expect(history.getCurrent().count).toBe(0);
    });

    it.each(createTestHistories())('redoes actions', history => {
        history.apply(10);
        history.undo();
        history.redo();

        expect(history.getCurrent().count).toBe(10);
    });

    it.each(createTestHistories())('undoes multiple actions', history => {
        history.apply(5);
        history.apply(10);
        history.apply(20);
        history.undo();
        history.undo();
        history.undo();

        expect(history.getCurrent().count).toBe(0);
    });

    it.each(createTestHistories())('redoes multiple actions', history => {
        history.apply(5);
        history.apply(10);
        history.apply(20);
        history.undo();
        history.undo();
        history.undo();
        history.redo();
        history.redo();
        history.redo();

        expect(history.getCurrent().count).toBe(35);
    });

    it.each(createTestHistories())('can reset to specific checkpoint', history => {
        history.apply(1);
        history.apply(1);
        const checkpoint2 = history.getCurrentPosition();
        history.apply(1);
        history.apply(1);
        const checkpoint4 = history.getCurrentPosition();
        history.apply(1);
        const checkpoint5 = history.getCurrentPosition();
        history.undo();

        history.goToPosition(checkpoint2);
        expect(history.getCurrent().count).toBe(2);
        history.goToPosition(checkpoint5);
        expect(history.getCurrent().count).toBe(5);
        history.goToPosition(checkpoint4);
        expect(history.getCurrent().count).toBe(4);
    });

    it.each(createTestHistories())('replaces the initial state when collapsing from 0', history => {
        const idealHistory = createImmutableHistory(3);
        const start = history.getCurrentPosition();
        history.apply(1);
        history.apply(1);
        history.apply(1);
        const end = history.getCurrentPosition();
        history.collapse(start, end, sum);

        expectHistoriesEqual(history, idealHistory);
    });

    it.each(createTestHistories())('does not collapse anything for start = end', history => {
        const idealHistory = createImmutableHistory(0);
        idealHistory.apply(1);
        idealHistory.apply(1);
        idealHistory.apply(1);

        history.apply(1);
        history.apply(1);
        const a = history.getCurrentPosition();
        const b = history.getCurrentPosition();
        history.apply(1);

        history.collapse(a, b, sum);

        expectHistoriesEqual(history, idealHistory);
    });

    it.each(createTestHistories())('collapses a part of the history preceding the current position', history => {
        const idealHistory = createImmutableHistory(0);
        idealHistory.apply(2);
        idealHistory.apply(1);

        history.apply(1);
        const a = history.getCurrentPosition();
        history.apply(1);
        const b = history.getCurrentPosition();
        history.apply(1);

        history.collapse(a, b, sum);

        expectHistoriesEqual(history, idealHistory);
    });

    it.each(createTestHistories())('collapses a part of the history following the current position', history => {
        const idealHistory = createImmutableHistory(0);
        idealHistory.apply(1);
        idealHistory.apply(2);
        idealHistory.undo();

        history.apply(1);
        history.apply(1);
        const a = history.getCurrentPosition();
        history.apply(1);
        const b = history.getCurrentPosition();
        history.undo();
        history.undo();

        history.collapse(a, b, sum);

        expectHistoriesEqual(history, idealHistory);
    });

    it.each(createTestHistories())('collapses a part of the history including the current position', history => {
        const idealHistory = createImmutableHistory(0);
        idealHistory.apply(1);
        idealHistory.apply(3);
        idealHistory.apply(1);
        idealHistory.undo();

        history.apply(1);
        history.apply(1);
        const a = history.getCurrentPosition();
        history.apply(1);
        history.apply(1);
        const b = history.getCurrentPosition();
        history.apply(1);
        history.undo();
        history.undo();

        history.collapse(a, b, sum);

        expectHistoriesEqual(history, idealHistory);
    });
});
