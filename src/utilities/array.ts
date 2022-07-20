export function minBy<T>(items: readonly T[], measure: (item: T) => number): T {
    if (items.length === 0) throw new Error(`Cannot compute min of an empty array`);
    let minItem = items[0];
    let minValue = measure(items[0]);
    for (let i = 1; i < items.length; ++i) {
        const item = items[i];
        const itemValue = measure(item);
        if (itemValue < minValue) {
            minItem = item;
            minValue = itemValue;
        }
    }
    return minItem;
}

export function maxBy<T>(items: readonly T[], measure: (item: T) => number): T {
    if (items.length === 0) throw new Error(`Cannot compute min of an empty array`);
    let maxItem = items[0];
    let maxValue = measure(items[0]);
    for (let i = 1; i < items.length; ++i) {
        const item = items[i];
        const itemValue = measure(item);
        if (itemValue > maxValue) {
            maxItem = item;
            maxValue = itemValue;
        }
    }
    return maxItem;
}
