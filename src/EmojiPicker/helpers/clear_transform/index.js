export default function clearTransform(transformed, keep) {

    if (!transformed) {
        return;
    }

    const newList = [];

    transformed.forEach((categoryName) => {
        if (categoryName.index === keep) {
            newList.push(categoryName);
            return;
        }

        categoryName.element.removeAttribute('style');
    });

    return newList;
}