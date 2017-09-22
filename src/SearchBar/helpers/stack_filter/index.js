export default function stackFilter(index, text, stack) {
    const matches = {},
        stackedItem = stack[index],
        prevMatches = stackedItem.matches;

    if (stackedItem.text === text) {
        return prevMatches;
    }

    for (const category in prevMatches) {
        matches[category] = {};
        for (const emoji in prevMatches[category]) {
            if (prevMatches[category][emoji].indexOf(text) > -1) {
                matches[category][emoji] = prevMatches[category][emoji];
            }
        }
        if (!Object.keys(matches[category]).length) {
            delete matches[category];
        }
    }

    return matches;
}