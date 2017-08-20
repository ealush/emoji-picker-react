import { DEFAULT_CDN_PATH, DEFAULT_IMAGE_RESOLUTION } from '../../../constants';
import bgImage from './index';

describe('Test bgImage Function', () => {
    it('Shoud provide correct emoji background image given all parameters', () => {
        const scope = fullDataForFunction;
        expect(bgImage(scope.testData)).to.deep.equal(scope.expect);
    });

    it('Shoud provide correct emoji background image based on default parameters', () => {
        const scope = noSpecifiedConfig;
        expect(bgImage(scope.testData)).to.deep.equal(scope.expect);
    });
});

const noSpecifiedConfig = {
        testData: { unified: 'sampleEmoji' },
        expect: {
            'backgroundImage': `url(${DEFAULT_CDN_PATH}/${DEFAULT_IMAGE_RESOLUTION}/sampleEmoji.png)`
        }
    },
    fullDataForFunction = {
        testData: {
            unified: 'sampleEmoji',
            assetPath: 'my_asset',
            emojiResolution: '128'
        },
        expect: {
            'backgroundImage': 'url(my_asset/128/sampleEmoji.png)'
        }
    };