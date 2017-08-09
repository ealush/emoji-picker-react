import { categories } from './';

export default function(emoji) {
    return {
        name: emoji.n,
        unified: emoji.u,
        order: emoji.o,
        category: categories[emoji.c].name
    };
}