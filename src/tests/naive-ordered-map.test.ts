import { NaiveOrderedMap } from '../utilities/naive-ordered-map';

describe('NaiveOrderedMap', () => {
    it('gets and sets values', () => {
        const map = new NaiveOrderedMap<string>('foo');

        map.set(123, 'bar');

        expect(map.get(123)).toBe('bar');
    });

    it('contains a value at 0 after creation', () => {
        const map = new NaiveOrderedMap<string>('foo');
        expect(map.get(0)).toBe('foo');
    });

    it('contains a value at 0 after being reset', () => {
        const map = new NaiveOrderedMap<string>('foo');
        map.reset('bar');
        expect(map.get(0)).toBe('bar');
    });

    it('returns 0 as upper bound after creation', () => {
        const map = new NaiveOrderedMap<string>('foo');
        const [key, value] = map.smallerOrEqualEntry(123);
        expect(key).toBe(0);
        expect(value).toBe('foo');
    });

    it('returns the largest smaller or equal key when no key matches exactly', () => {
        const map = new NaiveOrderedMap<string>('foo');

        map.set(10, 'bar');
        map.set(100, 'baz');
        map.set(1000, 'qux');

        const [key, value] = map.smallerOrEqualEntry(123);
        expect(key).toBe(100);
        expect(value).toBe('baz');
    });

    it('returns the exact smaller or equal key when one exists', () => {
        const map = new NaiveOrderedMap<string>('foo');

        map.set(10, 'bar');
        map.set(100, 'baz');
        map.set(1000, 'qux');

        const [key, value] = map.smallerOrEqualEntry(1000);
        expect(key).toBe(1000);
        expect(value).toBe('qux');
    });

    it('finds the max key', () => {
        const map = new NaiveOrderedMap<string>('foo');

        map.set(10, 'bar');
        map.set(100, 'baz');
        map.set(1000, 'qux');

        expect(map.maxKey()).toBe(1000);
    });
});
