import { Header_Height } from '../../../constants';

function checkIfActiveCategory({ offset, offsets, scrollTop, next }) {
    return offset <= scrollTop && (offsets[next] >= scrollTop || offsets[next] === undefined);
}

function isInViewport({ isActiveCategory, currentTop, offsets, index, next }) {
    return !isActiveCategory && (currentTop) > offsets[index] && (currentTop) < offsets[next];
}

function isElementInProximity({scrollTop, offset}) {
    const elementIsUp = scrollTop + Header_Height >= offset,
        elementIsDown = scrollTop - Header_Height <= offset;

    return elementIsDown && elementIsUp; // logically not true, better naming needed
}

export default function getProximity(offsets, scrollTop, listHeight) {
    // gets the closest category

    let proximityIndex = null,
        activeCategory,
        inViewPort;

    for (let index = 0; index < offsets.length; index++) {
        const offset = offsets[index],
            next = index + 1,
            currentTop = scrollTop + listHeight,
            inProximity = isElementInProximity({scrollTop, offset}),
            isActiveCategory = checkIfActiveCategory({ offset, offsets, scrollTop, next }),
            notActiveVisibleCategory = isInViewport({ isActiveCategory, currentTop, offsets, index, next });

        if (notActiveVisibleCategory) {
            inViewPort = index;
        }

        if (isActiveCategory) {
            activeCategory = index;
        }

        if (inProximity) {
            proximityIndex = index;
            break;
        }
    }

    return {
        proximityIndex,
        activeCategory,
        inViewPort
    };
}