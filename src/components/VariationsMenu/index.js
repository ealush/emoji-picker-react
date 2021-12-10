import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import skinTones from '../../skinTones';
import {
  EMOJI_PROPERTY_UNIFIED,
  EMOJI_PROPERTY_SKIN_VARIATIONS,
} from '../../../lib/constants';
import EmojiImg from '../EmojiImg';
import './style.css';
import {
  useActiveSkinTone,
  useCloseVariationMenu,
  useConfig,
  useOnEmojiClick,
  useVariationMenuValue,
} from '../../PickerContext';

const VariationsMenu = () => {
  const [showMenu, setShowMenu] = useState(false);
  const closeVariations = useCloseVariationMenu();
  const variationMenu = useVariationMenuValue();
  const activeSkinTone = useActiveSkinTone();

  const onEmojiClick = useOnEmojiClick();
  const config = useConfig();

  useEffect(() => {
    if (variationMenu && !showMenu) {
      setShowMenu(true);
    }
    return () => {
      setShowMenu(false);
    };
  }, [variationMenu]);

  if (!variationMenu) {
    return null;
  }

  const classes = cn('variation-list', {
    visible: showMenu,
  });

  return (
    <div className="variations-wrapper">
      <ul className={classes}>
        {skinTones.map(tone => {
          const unified =
            variationMenu[EMOJI_PROPERTY_SKIN_VARIATIONS].find(v =>
              v.includes(tone)
            ) || variationMenu[EMOJI_PROPERTY_UNIFIED];

          const handleClick = e => {
            closeVariations(e);

            return onEmojiClick(e, unified, variationMenu, activeSkinTone);
          };

          return (
            <li key={unified}>
              <button
                onClick={handleClick}
                onMouseDown={e => e.stopPropagation()}
              >
                <EmojiImg native={config.native} unified={unified} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default VariationsMenu;

VariationsMenu.propTypes = {
  closeVariations: PropTypes.func,
};
