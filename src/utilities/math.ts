/**
 * Maps a number from one range to another.
 * Example: remap( 0,  0,10,  100,200) === 100
 * Example: remap( 5,  0,10,  100,200) === 150
 * Example: remap(10,  0,10,  100,200) === 200
 * @param value The number
 * @param fromStart Start of the initial range
 * @param fromEnd End of the initial range
 * @param toStart Start of the target range
 * @param toEnd End of the target range
 * @returns {number}
 */
export function remap(value: number, fromStart: number, fromEnd: number, toStart: number, toEnd: number): number {
    return ((value - fromStart) / (fromEnd - fromStart)) * (toEnd - toStart) + toStart;
}
