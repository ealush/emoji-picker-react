export default function adjustScrollbar(scrollHeight, scrollTop, listHeight, _scroller) {

    const wholeRange = (scrollHeight - 0),
        visibleRange = (listHeight - 15),
        newPos = (((scrollTop - 0) * visibleRange) / wholeRange) + 0;

    _scroller.setAttribute('style', `transform: translateY(${newPos}px)`);
}