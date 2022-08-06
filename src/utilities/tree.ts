export class Tree<Item> {
    private constructor(
        private readonly items: Set<Item>,
        private readonly childrenByItem: Map<Item, Set<Item>>,
        private readonly parentByItem: Map<Item, Item>
    ) {}

    add(item: Item) {
        this.items.add(item);
    }

    moveToParent(child: Item, parent: Item): void {
        const oldParent = this.parentByItem.get(child);
        if (oldParent === parent) return;
        if (oldParent) {
            this.childrenByItem.get(oldParent)?.delete(child);
        }
        const newParentChildren = this.childrenByItem.get(parent) ?? new Set();
        newParentChildren.add(child);
        this.childrenByItem.set(parent, newParentChildren);
        this.parentByItem.set(child, parent);
    }

    remove(item: Item): void {
        this.items.delete(item);
        const parent = this.parentByItem.get(item);
        if (parent === undefined) return;
        this.childrenByItem.get(parent)?.delete(item);
        this.parentByItem.delete(item);
    }

    has(item: Item): boolean {
        return this.items.has(item);
    }

    getAll(): Item[] {
        return Array.from(this.items);
    }

    getRoots(): Item[] {
        return this.getAll().filter(item => !this.parentByItem.has(item));
    }

    getChildren(item: Item): Item[] {
        return Array.from(this.childrenByItem.get(item) ?? []);
    }

    getParent(item: Item): Item | null {
        return this.parentByItem.get(item) ?? null;
    }

    entry(item: Item) {
        return {
            isInTree: () => this.has(item),
            getChildren: () => this.getChildren(item),
            getParent: () => this.getParent(item),
            addChild: (child: Item) => {
                if (!this.has(item)) {
                    throw new Error(`Cannot add a child to an entry which is not in the tree`);
                }
                if (!this.has(child)) {
                    this.add(child);
                }
                this.moveToParent(child, item);
            },
            hasChild: (child: Item) => this.getChildren(item).includes(child)
        };
    }

    clone() {
        return new Tree(
            new Set(this.items),
            new Map(Array.from(this.childrenByItem).map(([parent, children]) => [parent, new Set(children)] as const)),
            new Map(this.parentByItem)
        );
    }

    clear() {
        this.items.clear();
        this.childrenByItem.clear();
        this.parentByItem.clear();
    }

    static empty<T>(): Tree<T> {
        return new Tree(new Set(), new Map(), new Map());
    }

    static fromRoots<T>(roots: readonly T[]): Tree<T> {
        const tree = Tree.empty<T>();
        for (const root of roots) {
            tree.add(root);
        }
        return tree;
    }
}
