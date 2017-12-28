export default function clearTransform(transformed, keep) {

    if (!Array.isArray(transformed) || transformed.length === 0) {
        return [];
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