/**
 * A non-optimized implementation of an ordered map.
 */
export class NaiveOrderedMap<T> {
    private readonly data: Map<number, T> = new Map();

    constructor(valueAtZero: T) {
        this.data.set(0, valueAtZero);
    }

    set(key: number, value: T) {
        if (key < 0) {
            throw new Error(`Keys cannot be negative`);
        }
        this.data.set(key, value);
    }

    get(key: number) {
        if (!this.data.has(key)) {
            throw new Error(`Unable to find key ${key}`);
        }
        return this.data.get(key);
    }

    delete(key: number) {
        if (key < 0) {
            throw new Error(`Ket cannot be negative`);
        }
        if (key === 0) {
            throw new Error(`Cannot remove value at 0`);
        }
        this.data.delete(key);
    }

    reset(valueAtZero: T) {
        this.data.clear();
        this.data.set(0, valueAtZero);
    }

    smallerOrEqualEntry(upperBound: number): readonly [number, T] {
        const keys = Array.from(this.data.keys());
        if (keys.length === 0) {
            throw new Error(`Cannot find smaller or equal key in an empty map`);
        }
        if (upperBound < 0) {
            throw new Error(`Upper bound must be >= 0`);
        }
        const key = keys.sort((a, b) => b - a).find(key => key <= upperBound)!;
        return [key, this.data.get(key)!];
    }

    maxKey() {
        return Array.from(this.data.keys()).reduce((max, key) => (max > key ? max : key));
    }

    pruneGreaterThan(threshold: number) {
        for (const key of Array.from(this.data.keys())) {
            if (key > 0 && key > threshold) this.delete(key);
        }
    }
}
