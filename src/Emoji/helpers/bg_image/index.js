import { DEFAULT_CDN_PATH, DEFAULT_IMAGE_RESOLUTION } from '../../../constants';

function bgImage({ unified, assetPath, emojiResolution }) {
    return { 'backgroundImage': `url(${imgURL({unified, assetPath, emojiResolution})})` };
};

function imgURL({ unified, assetPath, emojiResolution }) {

    if (typeof assetPath === 'undefined') {
        assetPath = DEFAULT_CDN_PATH;
    }

    assetPath += emojiResolution ? `/${emojiResolution}` : `/${DEFAULT_IMAGE_RESOLUTION}`;

    return `${assetPath}/${unified}.png`
};

export {
    bgImage,
    imgURL
}