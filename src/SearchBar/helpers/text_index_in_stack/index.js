export default function textIndexInStack(text, stack) {
    const textLength = text.length,
        stackLength = stack.length,
        stackLast = stackLength -1;

    let bestMatch = -1;

    if (!stackLength) {
        return bestMatch;
    }

    if (stackLength >= textLength && stack[textLength - 1].text === text) {
        return (textLength - 1);
    }

    if (text.indexOf(stack[stackLast].text) !== -1) {
        return stackLast;
    }

    for (let i = stackLast; i >= 0; i--) {
        const stackItem = stack[i];

        if (stackItem.text === text) {
            return i;
        }

        if (stackItem.text.indexOf(text.substr(0, stackItem.text.length)) > -1) {
            return bestMatch = i;
        }
    }

    return bestMatch;
}