export default function textIndexInStack(text, stack) {
    const textLength = text.length,
        stackLength = stack.length;

    let bestMatch = -1;

    if (!stackLength) {
        return bestMatch;
    }

    if (stackLength >= textLength && stack[textLength - 1].text === text) {
        return (textLength - 1);
    }

    for (let i = stackLength - 1; i > 0; i--) {
        const stackItem = stack[i];

        if (stackItem.text === text) {
            return i;
        }

        if (stackItem.text.indexOf(text.substr(0, stackItem.text.length)) > -1) {
            bestMatch = i;
        } else {
            return bestMatch;
        }
    }

    return bestMatch;
}