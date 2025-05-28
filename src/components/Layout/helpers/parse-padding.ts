import { convertToPixel } from "./convert-value-to-pixel";

type PaddingValue = {
    value: number;
    unit: string;
};

type Padding = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};

// Function to extract value and unit
export const parseValue = (value: string) => {
    const match = value.match(/^([\d.]+)(\D+)$/);
    return match ? { value: parseFloat(match[1]), unit: match[2] } : { value: parseFloat(value), unit: '' };
}

export const parsePadding = (paddingString: string, fontSize: number = 16, rootFontSize: number = 16): Padding => {
    const values: PaddingValue[] = paddingString.split(' ').map(value => parseValue(value));

    let top: number, right: number, bottom: number, left: number;

    if (values.length === 1) {
        // If only one value is provided, it applies to all sides
        top = right = bottom = left = convertToPixel(values[0].value, values[0].unit, fontSize, rootFontSize);
    } else if (values.length === 2) {
        // If two values are provided: [top-bottom, left-right]
        top = bottom = convertToPixel(values[0].value, values[0].unit, fontSize, rootFontSize);
        right = left = convertToPixel(values[1].value, values[1].unit, fontSize, rootFontSize);
    } else if (values.length === 3) {
        // If three values are provided: [top, left-right, bottom]
        top = convertToPixel(values[0].value, values[0].unit, fontSize, rootFontSize);
        right = left = convertToPixel(values[1].value, values[1].unit, fontSize, rootFontSize);
        bottom = convertToPixel(values[2].value, values[2].unit, fontSize, rootFontSize);
    } else if (values.length === 4) {
        // If four values are provided: [top, right, bottom, left]
        [top, right, bottom, left] = values.map(v => convertToPixel(v.value, v.unit, fontSize, rootFontSize));
    } else {
        // Handle unexpected cases
        top = right = bottom = left = 0;
    }

    return { top, right, bottom, left };
}
