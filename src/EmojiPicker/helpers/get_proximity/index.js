import { Header_Height } from '../../../constants';

function checkIfActiveCategory({ offset, offsets, scrollTop, next }) {
    return offset <= scrollTop && (offsets[next] >= scrollTop || offsets[next] === undefined);
}

function isInViewport({ scrollTop, listHeight, offsets, index}) {
    return offsets[index] < (listHeight + scrollTop) && offsets[index] > scrollTop;
}

function isElementInProximity({scrollTop, offset}) {
    const elementIsUp = scrollTop + Header_Height >= offset,
        elementIsDown = scrollTop - Header_Height <= offset;

    return elementIsDown && elementIsUp; // logically not true, better naming needed
}

export default function getProximity(offsets, scrollTop, listHeight) {
    // gets the closest category

    let proximityIndex = null,
        activeCategory;

    const inViewPort = {};

    for (let index = 0; index < offsets.length; index++) {
        const offset = offsets[index],
            next = index + 1,
            inProximity = isElementInProximity({scrollTop, offset}),
            isActiveCategory = checkIfActiveCategory({ offset, offsets, scrollTop, next }),
            isVisible = isInViewport({ scrollTop, listHeight, offsets, index});

        if (isVisible) {
            inViewPort[index] = true;
        }

        if (isActiveCategory) {
            activeCategory = index;
        }

        if (inProximity) {
            proximityIndex = index;
        }
    }

    return {
        proximityIndex,
        activeCategory,
        inViewPort
    };
}