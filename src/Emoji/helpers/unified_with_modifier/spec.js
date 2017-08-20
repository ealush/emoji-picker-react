import unifiedWithModifier from './index';

describe('Test unifiedWithModifier Function', () => {
    it('Should return unified emoji code with active chosen diversity', () => {
        expect(unifiedWithModifier(emojiWithDiversities, activeModifier)).to.equal(unifiedWithDiversity);
    });

    it('Should return default unified emoji code if no diversity is chosen', () => {
        expect(unifiedWithModifier(emojiWithDiversities)).to.equal(unified);
    });

    it('Should return default unified emoji code if current emoji does not have diversities', () => {
        expect(unifiedWithModifier(emojiWithNoDiversities, activeModifier)).to.equal(unified);
    });

    it('Should return default unified emoji code if current emoji does not have chosen diversity', () => {
        expect(unifiedWithModifier(emojiWithoutChosenDiversity, activeModifier)).to.equal(unified);
    });
});

const unified = '261d',
    unifiedWithDiversity = '261d-1f3fc',
    activeModifier = '1f3fc',
    emojiWithDiversities = {
        unified,
        diversities: ['261d-1f3fb', '261d-1f3fc', '261d-1f3fd', '261d-1f3fe', '261d-1f3ff']
    },
    emojiWithNoDiversities = {
        unified
    },
    emojiWithoutChosenDiversity = {
        unified,
        diversities: ['261d-1f3fb', '261d-1f3fd', '261d-1f3fe', '261d-1f3ff']
    };