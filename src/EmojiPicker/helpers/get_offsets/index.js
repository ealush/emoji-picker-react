export default function getOffsets(_list) {
    const scrollHeight = _list.scrollHeight,
        listHeight = _list.offsetHeight,
        offsets = [];
    Array.prototype.forEach.call(_list.children, (node) => {
        if (node.classList.contains('hidden')) {
            return;
        }
        offsets.push(node.offsetTop);
    });

    return { scrollHeight, listHeight, offsets };
}