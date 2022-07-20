export function randomInteger(fromInclusive: number, toExclusive: number): number {
    return Math.floor(Math.ceil(fromInclusive) + Math.random() * (toExclusive - fromInclusive));
}
