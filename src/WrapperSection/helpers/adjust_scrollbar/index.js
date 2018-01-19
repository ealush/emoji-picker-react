import { MIN_SCROLLBAR_HEIGHT_PADDED } from '../../../constants';

export default function adjustScrollbar(scrollHeight, scrollTop, listHeight, _scroller) {

    const scrollbarHeight = Math.floor((listHeight/(scrollHeight/listHeight)) * 0.8);

    const wholeRange = scrollHeight - listHeight,
        visibleRange = (listHeight - (scrollbarHeight < MIN_SCROLLBAR_HEIGHT_PADDED ? MIN_SCROLLBAR_HEIGHT_PADDED : scrollbarHeight) - 5),
        newPos = (scrollTop * visibleRange) / (wholeRange);

    _scroller.setAttribute('style', `transform: translateY(${newPos}px)`);
    _scroller.children[0].setAttribute('style', `height: ${scrollbarHeight}px`);
}