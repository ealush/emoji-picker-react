export default function textIndexInStack(text, stack) {
    const textLength = text.length,
        stackLength = stack.length;

    if (!stackLength) {
        return -1;
    }

    if (stackLength >= textLength && stack[textLength - 1].text === text) {
        return (textLength - 1);
    }

    for (let i = stackLength - 1; i >= 0; i--) {
        const stackItem = stack[i];

        if (stackItem.text === text) {
            return i;
        }

        if (stackItem.text.indexOf(text.substr(0, i)) > -1) {
            return i;
        }
    }

    return -1;
}