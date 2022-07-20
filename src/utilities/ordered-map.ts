export interface OrderedMap<Key, Value> {
    has(key: Key): boolean;
    get(key: Key): Value;
    set(key: Key, value: Value): void;
    nextKey(afterKey: Key): Key | undefined;
    previousKey(beforeKey: Key): Key | undefined;
    nextEntry(afterKey: Key): readonly [Key, Value] | undefined;
    previousEntry(beforeKey: Key): readonly [Key, Value] | undefined;
}

class BTreeMap {}
