import PropTypes from 'prop-types';
import {
  EMOJI_PROPERTY_NAME,
  EMOJI_PROPERTY_UNIFIED,
  EMOJI_PROPERTY_SKIN_VARIATIONS,
  EMOJI_PROPERTY_GROUP,
} from '../../../lib/constants';

export const emoji = PropTypes.shape({
  [EMOJI_PROPERTY_NAME]: PropTypes.arrayOf(PropTypes.string),
  [EMOJI_PROPERTY_UNIFIED]: PropTypes.string,
  [EMOJI_PROPERTY_SKIN_VARIATIONS]: PropTypes.arrayOf(PropTypes.string),
  [EMOJI_PROPERTY_GROUP]: PropTypes.string,
});

export const groupNamesPropType = PropTypes.shape({
  smileys_people: PropTypes.string,
  animals_nature: PropTypes.string,
  food_drink: PropTypes.string,
  travel_places: PropTypes.string,
  activities: PropTypes.string,
  objects: PropTypes.string,
  symbols: PropTypes.string,
  flags: PropTypes.string,
  recently_used: PropTypes.string,
});

export const configPropsShape = PropTypes.shape({
  ...configPropTypes,
});

export const configPropTypes = {
  emojiUrl: PropTypes.string,
  preload: PropTypes.bool,
  skinTone: PropTypes.string,
  groupNames: groupNamesPropType,
  native: PropTypes.bool,
  groupVisibility: PropTypes.objectOf(PropTypes.bool),
  disableAutoFocus: PropTypes.bool,
  disableSearchBar: PropTypes.bool,
  disableSkinTonePicker: PropTypes.bool,
};
