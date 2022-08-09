export function remap(value: number, fromStart: number, fromEnd: number, toStart: number, toEnd: number): number {
    return ((value - fromStart) / (fromEnd - fromStart)) * (toEnd - toStart) + toStart;
}
