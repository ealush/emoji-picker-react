import emojiAccessor from './emoji_accessor';

describe('Test emojiAccessor Function', () => {
    it('should return undefined if no emoji was supplied', () => {
        expect(emojiAccessor()).to.equal(undefined);
    });

    it('should return correct emoji structure', () => {
        expect(emojiAccessor(emoji)).to.deep.equal(expected);
    });

    it('should return correct emoji structure with diversities', () => {
        expect(emojiAccessor(emojiWithDiversities)).to.deep.equal(Object.assign({}, expected, {
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