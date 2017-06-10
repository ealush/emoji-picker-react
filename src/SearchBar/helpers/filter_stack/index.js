export default function filterStack(stack, currentFilter) {
    return stack.filter((item, index, all) => {
        const itemPresent = !!item,
            nextItem = all[index + 1],
            nextItemPresent = !!nextItem,
            doesnotmatchesFilterText = item.text !== currentFilter.text,
            nextDoesnotMatchesCurrent = nextItemPresent && nextItem.text !== item.text;

        return itemPresent && (!nextItemPresent || nextDoesnotMatchesCurrent) && doesnotmatchesFilterText;
    });
}