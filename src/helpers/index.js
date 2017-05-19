export const headerHeight = 25,
    scrollerHeight = 20;

export function getScrollbarWidt() {
    const outer = document.createElement('div'),
        inner = document.createElement('div');
    outer.setAttribute('style', 'width: 50px;height:50px;overflow-y:scroll;');
    inner.setAttribute('style', 'height:100px;width:100%');

    outer.appendChild(inner);
    document.body.appendChild(outer);

      const w1 = outer.clientWidth,
        w2 = outer.clientWidth;

    document.body.removeChild(outer);

    const size = w1 - w2;

    return size;
}

export function getOffsets(_list) {
    const scrollHeight = _list.scrollHeight,
        listHeight = _list.offsetHeight,
        offsets = [];
    Array.prototype.forEach.call(_list.children, (node, index) => {
        offsets.push(node.offsetTop);
    });

    return { scrollHeight, listHeight, offsets };
}

export function adjustScrollbar(scrollHeight, scrollTop, listHeight, _scroller) {

    const wholeRange = (scrollHeight - 0),
        visibleRange = (listHeight - 15),
        newPos = (((scrollTop - 0) * visibleRange) / wholeRange) + 0;

    _scroller.setAttribute('style', `transform: translateY(${newPos}px)`);
}

export function clearTransform(transformed, keep) {

    if (!transformed) {
        return;
    }

    const newList = [];

    transformed.forEach((groupName) => {
        if (groupName.index === keep) {
            newList.push(groupName);
            return;
        }

        groupName.element.removeAttribute('style');
    });

    return newList;
}

export function getProximity(offsets, scrollTop) {
    // gets the closest group

    let proximityIndex = null,
        visibleGroup;

    for (let index = 0; index < offsets.length; index++) {
        const offset = offsets[index],
            elementIsDown = scrollTop + headerHeight >= offset,
            elementIsUp = scrollTop - headerHeight <= offset,
            inProximity = elementIsDown && elementIsUp, // logically not true, better naming needed
            isLastGroup = index === offsets.length,
            isVisibleGroup = offset <= scrollTop && offsets[index + 1] >= scrollTop;

        if (isVisibleGroup || isLastGroup) {
            visibleGroup = index;
        }

        if (inProximity) {
            proximityIndex = index;
            break;
        }
    }

    return {
        proximityIndex,
        visibleGroup
    };
}