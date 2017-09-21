import inlineStyleTags from './index';

describe('Test inlineStyleTags Function', () => {

    const defaultResult = { picker: { width: '240px' }, list: { width: '238px', height: '240px' } };

    it('Should produce a correct default style object given no params', () => {
        expect(inlineStyleTags()).to.deep.equal(defaultResult);
    });

    it('Should produce a correct style object when overriding defaults', () => {
        const expectedResult = { picker: { width: '500px' }, list: { width: '476px', height: '300px' } };
        expect(inlineStyleTags({width: 500, height: 300})).to.deep.equal(expectedResult);
    });

    it('Should fallback to defaults when bad data is passed', () => {
        expect(inlineStyleTags({ width: null, height: undefined })).to.deep.equal(defaultResult);
        expect(inlineStyleTags({ width: 0, height: '' })).to.deep.equal(defaultResult);
        expect(inlineStyleTags({ width: NaN, height: 'undefined' })).to.deep.equal(defaultResult);
    });
});