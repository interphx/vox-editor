import { NaiveOrderedMap } from './naive-ordered-map';

export interface ActionHistory<State, Action> {
    getCurrentState(): State;
    getTimeline(): readonly Action[];
    apply(action: Action): void;
    undo(steps: number): void;
    redo(steps: number): void;
    canUndo(): boolean;
    canRedo(): boolean;
    clear(): void;
    getCurrentCheckpoint(): number;
    collapseAfterCheckpoint(checkpoint: number, combine: (action: readonly Action[]) => Action): void;
    resetToCheckpoint(checkpoint: number): void;
    /*createTransientHistory(): ActionHistory<State, Action>;
    mergeTransientHistory(batchActions: (actions: readonly Action[]) => Action): void;*/
}

export class SimpleHistory<State, Action, Snapshot = State> implements ActionHistory<State, Action> {
    private readonly timeline: Action[];
    private readonly snapshots: NaiveOrderedMap<Snapshot>;
    public readonly applyAction: (action: Action, state: State) => State;
    public readonly makeSnapshot: (state: State) => Snapshot;
    public readonly loadSnapshot: (snapshot: Snapshot, state: State) => State;
    private readonly actionsBetweenSnapshots: number;
    private currentState: State;
    private currentPointer: number;
    //private transientHistory: SimpleHistory<State, Action, Snapshot> | null = null;

    constructor(
        actionsBetweenSnapshots: number,
        initialState: State,
        applyAction: (action: Action, state: State) => State,
        makeSnapshot: (state: State) => Snapshot,
        loadSnapshot: (snapshot: Snapshot, state: State) => State
    ) {
        this.actionsBetweenSnapshots = actionsBetweenSnapshots;
        this.timeline = [];
        this.currentState = initialState;
        this.applyAction = applyAction;
        this.makeSnapshot = makeSnapshot;
        this.loadSnapshot = loadSnapshot;
        this.snapshots = new NaiveOrderedMap(this.makeSnapshot(initialState));
        this.currentPointer = 0;
    }

    getCurrentState(): State {
        //if (this.transientHistory) return this.transientHistory.getCurrentState();
        return this.currentState;
    }

    getCurrentCheckpoint(): number {
        return this.currentPointer;
    }

    collapseAfterCheckpoint(checkpoint: number, combine: (action: readonly Action[]) => Action): void {
        if (checkpoint > this.currentPointer) {
            throw new Error(`Checkpoint is ${checkpoint}, but the latest collapsible action is ${this.currentPointer}`);
        }
        if (checkpoint < 0) throw new Error(`Checkpoint  must be >= 0`);
        const actionsToCollapse = this.timeline.slice(checkpoint, this.currentPointer);
        console.log(
            `Collapse from ${checkpoint} to ${this.currentPointer} inclusive in ${this.timeline}: `,
            actionsToCollapse
        );
        const batch = combine(actionsToCollapse);
        this.timeline.splice(checkpoint + 1, this.timeline.length);
        this.timeline[checkpoint] = batch;
        this.currentPointer = checkpoint;
        this.pruneStaleSnapshots();
    }

    resetToCheckpoint(checkpoint: number): void {
        this.goToPointer(checkpoint);
    }

    apply(action: Action) {
        //if (this.transientHistory) throw new Error(`Cannot use main history when transient history exists`);
        this.currentState = this.applyAction(action, this.currentState);
        if (this.currentPointer === this.timeline.length) {
            this.timeline.push(action);
        } else {
            this.timeline.splice(this.currentPointer + 1, this.timeline.length);
            this.pruneStaleSnapshots();
            this.timeline.push(action);
        }
        this.currentPointer += 1;

        this.takeSnapshotIfNeeded();
    }

    undo(steps: number) {
        //if (this.transientHistory) throw new Error(`Cannot use main history when transient history exists`);
        this.goToPointer(Math.max(0, this.currentPointer - steps));
    }

    redo(steps: number) {
        //if (this.transientHistory) throw new Error(`Cannot use main history when transient history exists`);
        this.goToPointer(Math.min(this.timeline.length, this.currentPointer + steps));
    }

    canUndo() {
        return this.currentPointer > 0;
    }

    canRedo() {
        return this.currentPointer < this.timeline.length;
    }

    clear() {
        //if (this.transientHistory) throw new Error(`Cannot use main history when transient history exists`);
        this.timeline.length = 0;
        const initialState = this.snapshots.get(0);
        if (!initialState) throw new Error(`Something went wrong: initial state is missing in the map`);
        this.snapshots.reset(initialState);
    }

    getTimeline(): readonly Action[] {
        return this.timeline;
        //return [...this.timeline, ...(this.transientHistory ? this.transientHistory.getTimeline() : [])];
    }

    /*createTransientHistory() {
        if (this.transientHistory) {
            throw new Error(`Only one transient history can exist at a time`);
        }
        this.transientHistory = new SimpleHistory(
            5,
            this.getCurrentState(),
            this.applyAction,
            this.makeSnapshot,
            this.loadSnapshot
        );
        this.timeline.splice(this.currentPointer + 1, this.timeline.length);
        this.pruneStaleSnapshots();
        return this.transientHistory;
    }

    mergeTransientHistory(batchActions: (actions: readonly Action[]) => Action) {
        if (!this.transientHistory) throw new Error(`Cannot merge a nonexistent transient history`);
        const batch = batchActions(this.transientHistory.getTimeline());
        this.currentState = this.transientHistory.getCurrentState();
        this.transientHistory = null;
        if (this.currentPointer !== this.timeline.length) {
            throw new Error(
                `Something went wrong: current pointer must be at the end of the timeline when merging a transient history`
            );
        }
        this.timeline.push(batch);
        this.currentPointer += 1;
        this.takeSnapshotIfNeeded();
    }*/

    private goToPointer(pointer: number) {
        if (pointer < 0) throw new Error(`Cannot go to a negative pointer: ${pointer}`);
        if (pointer > this.timeline.length) {
            throw new Error(
                `Pointer out of bounds: ${pointer} (there are only ${this.timeline.length} actions in the timeline)`
            );
        }

        this.currentPointer = pointer;
        const [latestSnapshotPointer, latestSnapshot] = this.snapshots.smallerOrEqualEntry(pointer);
        if (latestSnapshot === undefined) {
            throw new Error(`Something went wrong: unable to get snapshot #${latestSnapshotPointer}`);
        }
        this.currentState = this.loadSnapshot(latestSnapshot, this.currentState);
        for (let i = latestSnapshotPointer; i < this.currentPointer; ++i) {
            this.currentState = this.applyAction(this.timeline[i], this.currentState);
        }
    }

    private pruneStaleSnapshots() {
        this.snapshots.pruneGreaterThan(this.timeline.length);
    }

    private takeSnapshotIfNeeded() {
        if (this.timeline.length - this.snapshots.maxKey() < this.actionsBetweenSnapshots) return;
        this.takeSnapshot();
    }

    private takeSnapshot() {
        this.snapshots.set(this.timeline.length, this.makeSnapshot(this.currentState));
    }
}
