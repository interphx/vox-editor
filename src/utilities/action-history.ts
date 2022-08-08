import { makeObservable, observable } from 'mobx';
import { NaiveOrderedMap } from './naive-ordered-map';

export interface ActionHistory<State, Action> {
    apply(action: Action): void;
    undo(): void;
    redo(): void;
    canUndo(): boolean;
    canRedo(): boolean;
    getCurrentPosition(): number;
    size(): number;
    collapse(
        fromPositionInclusive: number,
        toPositionInclusive: number,
        combine: (actions: readonly Action[]) => Action
    ): void;
    getCurrent(): State;
    goToPosition(position: number): void;
}

export class SimpleActionHistory<State, Action, Snapshot> implements ActionHistory<State, Action> {
    private readonly onApplyAction: (state: State, action: Action) => State;
    private readonly onMakeSnapshot: (state: State) => Snapshot;
    private readonly onRestoreSnapshot: (currentState: State, snapshot: Snapshot) => State;
    private readonly snapshotInterval: number;

    private timeline: Action[];
    private snapshots: NaiveOrderedMap<Snapshot>;
    private position: number;
    private state: State;

    constructor(
        initialState: State,
        onApplyAction: (state: State, action: Action) => State,
        onMakeSnapshot: (state: State) => Snapshot,
        onRestoreSnapshot: (currentState: State, snapshot: Snapshot) => State,
        snapshotInterval: number
    ) {
        this.onApplyAction = onApplyAction;
        this.onMakeSnapshot = onMakeSnapshot;
        this.onRestoreSnapshot = onRestoreSnapshot;
        this.snapshotInterval = snapshotInterval;

        this.timeline = [];
        this.snapshots = new NaiveOrderedMap(onMakeSnapshot(initialState));
        this.position = 0;
        this.state = initialState;

        makeObservable<SimpleActionHistory<State, Action, Snapshot>, 'state' | 'position'>(this, {
            state: observable.ref,
            position: observable.ref
        });
    }

    apply(action: Action): void {
        this.dropSnapshotsAfter(this.position);
        this.timeline.length = this.position;
        this.state = this.onApplyAction(this.state, action);
        this.timeline.push(action);
        this.position += 1;
        this.createSnapshotIfNeeded();
    }

    undo(): void {
        if (this.isAtStart()) return;
        this.goTo(this.position - 1);
    }

    redo(): void {
        if (this.isAtEnd()) return;
        this.goTo(this.position + 1);
    }

    canUndo(): boolean {
        return !this.isAtStart();
    }

    canRedo(): boolean {
        return !this.isAtEnd();
    }

    size(): number {
        return this.timeline.length;
    }

    getCurrentPosition(): number {
        return this.position;
    }

    collapse(
        fromPositionInclusive: number,
        toPositionInclusive: number,
        combine: (actions: readonly Action[]) => Action
    ): void {
        if (fromPositionInclusive < 0 || fromPositionInclusive > toPositionInclusive) {
            throw new Error(
                `fromPositionInclusive must be in range [0..${this.size()}] and less than toPositionInclusive (${toPositionInclusive})`
            );
        }
        if (toPositionInclusive < 0 || toPositionInclusive > this.size()) {
            throw new Error(`toPositionInclusive must be in range [0..${this.size()}]`);
        }

        const initialActionCount = this.timeline.length;

        const startingActionIndex = fromPositionInclusive - 1;
        const endingActionIndex = toPositionInclusive - 1;

        /*console.log(
            `Initial timeline (${this.position}): ${this.timeline.map((num, index) =>
                this.position === index + 1 ? `${num}^` : String(num)
            )}`
        );*/
        if (startingActionIndex < 0) {
            const initialPosition = this.getCurrentPosition();
            this.goTo(toPositionInclusive);
            const snapshot = this.onMakeSnapshot(this.state);
            this.goTo(initialPosition);
            this.timeline.splice(0, endingActionIndex + 1);
            this.snapshots.set(0, snapshot);
        } else {
            const actionsToCollapse = this.timeline.slice(startingActionIndex, endingActionIndex + 1);
            const combined = combine(actionsToCollapse);
            this.timeline.splice(startingActionIndex, endingActionIndex + 1 - startingActionIndex, combined);
        }
        /*console.log(
            `Final timeline (${this.position}): ${this.timeline.map((num, index) =>
                this.position === index + 1 ? `${num}^` : String(num)
            )}`
        );*/

        const finalActionCount = this.timeline.length;

        // Move all snapshots the same amount. Or just drop snapshots after the collapsed position?
        // Let's just drop them for now.
        this.dropSnapshotsAfter(Math.max(0, fromPositionInclusive - 1));

        if (this.position >= toPositionInclusive) {
            const removedActions = initialActionCount - finalActionCount;
            this.position = this.position - removedActions;
        } else if (this.position > fromPositionInclusive) {
            this.goTo(fromPositionInclusive);
        }
    }

    getCurrent(): State {
        return this.state;
    }

    goToPosition(position: number): void {
        this.goTo(position);
    }

    private isAtStart(): boolean {
        return this.position === 0;
    }

    private isAtEnd(): boolean {
        return this.position === this.timeline.length;
    }

    private goTo(position: number) {
        if (position < 0 || position > this.timeline.length) {
            throw new Error(`Position must be in [0..${this.timeline.length}] range, got: ${position}`);
        }

        this.position = position;
        const [latestSnapshotPointer, latestSnapshot] = this.snapshots.smallerOrEqualEntry(position);
        if (latestSnapshot === undefined) {
            throw new Error(`Something went wrong: unable to get snapshot #${latestSnapshotPointer}`);
        }
        this.state = this.onRestoreSnapshot(this.state, latestSnapshot);
        for (let i = latestSnapshotPointer; i < this.position; ++i) {
            this.state = this.onApplyAction(this.state, this.timeline[i]);
        }
    }

    private dropSnapshotsAfter(positionExclusive: number) {
        if (positionExclusive < 0) throw new Error(`positionExclusive must be >= 0, got: ${positionExclusive}`);
        this.snapshots.pruneGreaterThan(positionExclusive);
    }

    private createSnapshotIfNeeded() {
        if (this.size() - this.snapshots.maxKey() < this.snapshotInterval) return;
        this.snapshots.set(this.timeline.length, this.onMakeSnapshot(this.state));
    }
}
