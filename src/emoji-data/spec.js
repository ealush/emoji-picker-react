import emojiAccessor from './emoji_accessor';

describe('Test emojiAccessor Function', () => {
    it('should return undefined if no emoji was supplied', () => {
        expect(emojiAccessor()).toBe(undefined);
    });

    it('should return correct emoji structure', () => {
        expect(emojiAccessor(emoji)).toEqual(expected);
    });

    it('should return correct emoji structure with diversities', () => {
        expect(emojiAccessor(emojiWithDiversities)).toEqual(Object.assign({}, expected, {
            diversities: []
        }));
    });
});

const emoji = {
        n: 'name',
        c: 2,
        u: '1',
        o: 1
    },
    emojiWithDiversities = Object.assign({}, emoji, {
        d: []
    }),
    expected = {
        name: 'name',
        category: 'nature',
        unified: '1',
        order: 1
    };