import headerTransform from './index';

describe('Test headerTransform Function', () => {

    it('Should produce a correct transform style string given the distance', () => {
        const results = {
            '0': 'transform: translateY(-25px);',
            '5': 'transform: translateY(-20px);',
            '10': 'transform: translateY(-15px);',
            '25': 'transform: translateY(0px);',
            '30': 'transform: translateY(5px);',
            '100': 'transform: translateY(75px);'
        };

        Object.keys(results).forEach((key) => {
            expect(headerTransform(key)).to.equal(results[key]);
        });
    });

    it('Should fallback to the default value (-25) when bad data is passed', () => {
        const defaultResult = 'transform: translateY(-25px);';

        expect(headerTransform(null)).to.equal(defaultResult);
        expect(headerTransform(undefined)).to.equal(defaultResult);
        expect(headerTransform(NaN)).to.equal(defaultResult);
        expect(headerTransform('zero!')).to.equal(defaultResult);
    });
});