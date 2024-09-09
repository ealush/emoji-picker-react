export const convertToPixel = (value: number, unit: string, fontSize: number, rootFontSize: number) => {
    switch (unit) {
        case 'px':
            return value; // already in pixels
        case 'rem':
            return value * rootFontSize; // root font size is default 16px
        case 'em':
            return value * fontSize; // font size of the element
        default:
            return value; // assuming value is in pixels if unit is unknown
    }
}


