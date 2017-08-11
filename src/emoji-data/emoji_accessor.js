import { categories } from './';

export default function(emoji) {

    if (!emoji) {
        return;
    }

    const emojiObject = {
        name: emoji.n,
        unified: emoji.u,
        order: emoji.o,
        category: categories[emoji.c].name
    };

    if (emoji.d) {
        emojiObject.diversities = emoji.d;
    }

    return emojiObject;
}