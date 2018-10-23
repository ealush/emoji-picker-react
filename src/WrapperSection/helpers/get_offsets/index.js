export default function getOffsets(_list) {
    const scrollHeight = _list.scrollHeight,
        listHeight = _list.offsetHeight;

    return { scrollHeight, listHeight };
}