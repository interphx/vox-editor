/**
 * An alternative to Map with customizable hash and comparison functions.
 */
export class Dictionary<Key, Value> {
    private pairCount: number = 0;

    constructor(
        private readonly hash: (key: Key) => string = defaultHash,
        private readonly equals: (a: Key, b: Key) => boolean = defaultEquals,
        private readonly data: Record<string, [key: Key, value: Value][]> = Object.create(null)
    ) {
        for (let key in data) {
            this.pairCount += data[key].length;
        }
    }

    extend(other: Dictionary<Key, Value>) {
        for (const [key, value] of Array.from(other.entries())) {
            this.set(key, value);
        }
    }

    clear() {
        for (let key in this.data) delete this.data[key];
        this.pairCount = 0;
    }

    clone() {
        const newData = Object.create(null);
        for (let key in this.data) {
            newData[key] = this.data[key].map(pair => [...pair]);
        }
        return new Dictionary<Key, Value>(this.hash, this.equals, newData);
    }

    has(key: Key): boolean {
        const hash = this.hash(key);
        if (hasOwn(this.data, hash)) {
            const pairs = this.data[hash];
            for (let i = 0; i < pairs.length; ++i) {
                if (this.equals(pairs[i][0], key)) return true;
            }
        }
        return false;
    }

    size() {
        return this.pairCount;
    }

    *keys() {
        for (let hash in this.data) {
            const pairs = this.data[hash];
            for (const [key] of pairs) {
                yield key;
            }
        }
    }

    *values() {
        for (let hash in this.data) {
            const pairs = this.data[hash];
            for (const [, value] of pairs) {
                yield value;
            }
        }
    }

    *entries() {
        for (let hash in this.data) {
            const pairs = this.data[hash];
            for (const pair of pairs) {
                yield pair;
            }
        }
    }

    get(key: Key): Value {
        const hash = this.hash(key);
        const pairs = this.data[hash];
        if (pairs === undefined || pairs.length === 0) {
            throw new Error(`Key not found: ${key} (${hash})`);
        }
        for (const [k, value] of pairs) {
            if (this.equals(k, key)) return value;
        }
        throw new Error(`Key not found by equality: ${key} (${hash})`);
    }

    set(key: Key, value: Value): void {
        const hash = this.hash(key);
        if (!hasOwn(this.data, hash)) {
            this.data[hash] = [];
        }
        const pairs = this.data[hash];
        for (let i = 0; i < pairs.length; ++i) {
            if (this.equals(pairs[i][0], key)) {
                pairs[i][1] = value;
                return;
            }
        }
        pairs.push([key, value]);
        this.pairCount += 1;
    }

    remove(key: Key): void {
        const hash = this.hash(key);
        if (hasOwn(this.data, hash)) {
            const pairs = this.data[hash];
            for (let i = 0; i < pairs.length; ++i) {
                if (this.equals(pairs[i][0], key)) {
                    pairs[i] = pairs[pairs.length - 1];
                    pairs.pop();
                    this.pairCount -= 1;
                    return;
                }
            }
        }
    }
}

const hasOwn = Object.prototype.hasOwnProperty.call.bind(Object.prototype.hasOwnProperty);
const defaultEquals = Object.is;
const defaultHash = (value: unknown) => String(value);
