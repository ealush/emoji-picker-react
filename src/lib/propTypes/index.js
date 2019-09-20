import PropTypes from 'prop-types';
import {
    EMOJI_PROPERTY_NAME,
    EMOJI_PROPERTY_UNIFIED,
    EMOJI_PROPERTY_SKIN_VARIATIONS,
    EMOJI_PROPERTY_GROUP
} from '../../../lib/constants';

export const emoji = PropTypes.shape({
    [EMOJI_PROPERTY_NAME]: PropTypes.arrayOf(PropTypes.string),
    [EMOJI_PROPERTY_UNIFIED]: PropTypes.string,
    [EMOJI_PROPERTY_SKIN_VARIATIONS]: PropTypes.arrayOf(PropTypes.string),
    [EMOJI_PROPERTY_GROUP]: PropTypes.string,
});
