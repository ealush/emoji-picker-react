import hitAnotherCategory from './index';

describe('Test hitAnotherCategory Function', () => {

    it('Should indicate previous category when meeting criteria', () => {
        expect(hitAnotherCategory({
            distance: 25,
            currentIsFirst: false,
            currentIsActive: true
        })).to.equal('prev');

        expect(hitAnotherCategory({
            distance: 5,
            currentIsFirst: false,
            currentIsActive: true
        })).to.equal('prev');

        expect(hitAnotherCategory({
            distance: -0,
            currentIsFirst: false,
            currentIsActive: true
        })).to.equal('prev');
    });

    it('Should indicate next category when meeting criteria', () => {
        expect(hitAnotherCategory({
            distance: 0,
            currentIsActive: false
        })).to.equal('next');

        expect(hitAnotherCategory({
            distance: -5,
            currentIsFirst: true,
            currentIsActive: false
        })).to.equal('next');

        expect(hitAnotherCategory({
            distance: -10,
            currentIsFirst: false,
            currentIsActive: false
        })).to.equal('next');
    });

    it('Should return undefined when not meeting any criteria', () => {
        expect(hitAnotherCategory({
            distance: -1,
            currentIsActive: true
        })).to.equal(undefined);

        expect(hitAnotherCategory({
            distance: 5,
            currentIsFirst: false,
            currentIsActive: false
        })).to.equal(undefined);

        expect(hitAnotherCategory({
            currentIsFirst: true,
            currentIsActive: true
        })).to.equal(undefined);

        expect(hitAnotherCategory({})).to.equal(undefined);
    });
});