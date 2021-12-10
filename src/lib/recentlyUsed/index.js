import {
  EMOJI_PROPERTY_UNIFIED,
  EMOJI_PROPERTY_SKIN_VARIATIONS,
} from '../../../lib/constants';
import globalObject from '../globalObject';

const RECENTLY_USED_KEY = 'epr_ru';

export const getRecentlyUsed = () => {
  try {
    if (!globalObject.localStorage) {
      return [];
    }

    const ruList = globalObject.localStorage.getItem(RECENTLY_USED_KEY);

    return !ruList ? [] : JSON.parse(ruList);
  } catch (e) {
    return [];
  }
};

export const setRecentlyUsed = ({ unified, originalUnified }) => {
  try {
    if (!globalObject.localStorage) {
      return;
    }

    const unifiedParts = unified.split('-');

    let skinVariation = '';

    if (unified !== originalUnified && unifiedParts.length > 1) {
      skinVariation = unifiedParts[1];
    }

    const ruList = [
      {
        [EMOJI_PROPERTY_UNIFIED]: originalUnified,
        ...(skinVariation && {
          [EMOJI_PROPERTY_SKIN_VARIATIONS]: skinVariation,
        }),
      },
      ...getRecentlyUsed().filter(
        item => item[EMOJI_PROPERTY_UNIFIED] !== originalUnified
      ),
    ];

    const output = ruList.splice(0, 14);

    globalObject.localStorage.setItem(
      RECENTLY_USED_KEY,
      JSON.stringify(output)
    );
  } catch (e) {
    return;
  }
};
