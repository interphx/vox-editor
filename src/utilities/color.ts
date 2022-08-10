import { Color } from 'three';

export function shouldUseLightForeground(backgroundColor: string): boolean {
    const background = new Color(backgroundColor);
    const lr = getComponentLuminance(background.r);
    const lg = getComponentLuminance(background.g);
    const lb = getComponentLuminance(background.b);
    const luminance = 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
    return luminance <= 0.179;
}

function getComponentLuminance(colorComponent: number): number {
    return colorComponent <= 0.04045 ? colorComponent / 12.92 : ((colorComponent + 0.055) / 1.055) ** 2.4;
}
