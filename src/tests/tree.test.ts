import { Tree } from '../utilities/tree';

describe('Tree', () => {
    const createTestTree = () => {
        const tree = Tree.empty<number>();
        tree.add(1);
        tree.add(2);
        tree.add(3);
        tree.entry(1).addChild(4);
        tree.entry(3).addChild(5);
        return tree;
    };

    it('returns added items from getItems()', () => {
        const tree = createTestTree();

        const items = tree.getAll();

        expect(items).toHaveLength(5);
        expect(items).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));
    });

    it('only returns roots from getRoots()', () => {
        const tree = createTestTree();

        const roots = tree.getRoots();

        expect(roots).toHaveLength(3);
        expect(roots).toEqual(expect.arrayContaining([1, 2, 3]));
    });

    it('returns children of a specific element', () => {
        const tree = createTestTree();

        const children = tree.getChildren(1);

        expect(children).toHaveLength(1);
        expect(children).toEqual(expect.arrayContaining([4]));
    });

    it('reparents elements', () => {
        const tree = createTestTree();

        tree.moveToParent(3, 1);
        tree.moveToParent(5, 1);
        const childrenOf1 = tree.getChildren(1);
        const childrenOf3 = tree.getChildren(3);

        expect(tree.getParent(3)).toBe(1);
        expect(tree.getParent(5)).toBe(1);

        expect(childrenOf1.length).toBe(3);
        expect(childrenOf1).toEqual(expect.arrayContaining([3, 4, 5]));
        expect(childrenOf3).toEqual([]);

        expect(tree.getRoots()).toHaveLength(2);
    });

    it('removes elements', () => {
        const tree = createTestTree();

        tree.remove(2);
        tree.remove(4);

        const roots = tree.getRoots();

        expect(tree.getAll()).not.toEqual(expect.arrayContaining([2, 4]));

        expect(tree.getParent(2)).toBe(null);
        expect(tree.getParent(4)).toBe(null);

        expect(roots).toHaveLength(2);
        expect(roots).toEqual(expect.arrayContaining([1, 3]));

        expect(tree.getChildren(1)).toEqual([]);
    });

    it('can be cloned', () => {
        const tree = createTestTree();
        const clone = tree.clone();

        tree.add(100);
        clone.add(200);
        tree.entry(1).addChild(1000);
        clone.entry(1).addChild(2000);

        expect(tree.getRoots().sort()).toEqual([1, 2, 3, 100].sort());
        expect(clone.getRoots().sort()).toEqual([1, 2, 3, 200].sort());

        expect(tree.getChildren(1).sort()).toEqual([4, 1000].sort());
        expect(clone.getChildren(1).sort()).toEqual([4, 2000].sort());
    });
});
