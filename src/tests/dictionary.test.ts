import { Dictionary } from '../utilities/dictionary';

describe('Dictionary', () => {
    it('sets & gets entries with default hash & equality', () => {
        const dict = new Dictionary<string, number>();
        dict.set('foo', 123);

        expect(dict.size()).toBe(1);
        expect(dict.get('foo')).toBe(123);
        expect(Array.from(dict.entries())).toHaveLength(1);
    });

    it('sets & gets entries with custom hash & equality', () => {
        // We intentionally use non-unique hashes here to test
        // the behavior of equality as well
        const dict = new Dictionary<[number, number], string>(
            ([x, y]) => String(x + y),
            ([ax, ay], [bx, by]) => ax === bx && ay === by
        );
        dict.set([5, 5], 'foo');
        dict.set([3, 7], 'bar');
        dict.set([10, 0], 'baz');
        dict.set([15, -1234], 'qux');

        expect(dict.size()).toBe(4);
        expect(dict.get([5, 5])).toBe('foo');
        expect(dict.get([3, 7])).toBe('bar');
        expect(dict.get([10, 0])).toBe('baz');
        expect(dict.get([15, -1234])).toBe('qux');
        expect(Array.from(dict.entries())).toHaveLength(4);
    });

    it('removes entries with default hash & equality', () => {
        const dict = new Dictionary<string, number>();
        dict.set('foo', 123);
        dict.remove('foo');

        expect(dict.size()).toBe(0);
        expect(Array.from(dict.entries())).toHaveLength(0);
    });

    it('removes entries with custom hash & equality', () => {
        const dict = new Dictionary<[number, number], string>(
            ([x, y]) => String(x + y),
            ([ax, ay], [bx, by]) => ax === bx && ay === by
        );
        dict.set([5, 5], 'foo');
        dict.set([3, 7], 'bar');
        dict.set([10, 0], 'baz');
        dict.set([15, -1234], 'qux');

        dict.remove([10, 0]);
        dict.remove([3, 7]);

        expect(dict.size()).toBe(2);
        expect(() => dict.get([10, 0])).toThrow();
        expect(() => dict.get([3, 7])).toThrow();
        expect(Array.from(dict.entries())).toHaveLength(2);
    });

    it('throws on missing keys', () => {
        const dict = new Dictionary<string, number>();
        expect(() => dict.get('foo')).toThrow();
    });

    it('replaces same keys', () => {
        const dict = new Dictionary<string, number>();
        dict.set('foo', 123);
        dict.set('foo', 789);

        expect(dict.size()).toBe(1);
        expect(dict.get('foo')).toBe(789);
        expect(Array.from(dict.entries())).toHaveLength(1);
    });

    it('extends from another Dictionary', () => {
        const a = new Dictionary<string, number>();
        const b = new Dictionary<string, number>();

        a.set('foo', 123);
        a.set('bar', 456);
        b.set('foo', 789);

        b.extend(a);

        expect(b.size()).toBe(2);
        expect(b.get('foo')).toBe(123);
        expect(b.get('bar')).toBe(456);
        expect(Array.from(b.entries())).toHaveLength(2);
    });

    it('clears itself', () => {
        const dict = new Dictionary<string, number>();
        dict.set('foo', 123);
        dict.set('bar', 789);

        dict.clear();

        expect(dict.size()).toBe(0);
        expect(Array.from(dict.entries())).toHaveLength(0);
    });
});
