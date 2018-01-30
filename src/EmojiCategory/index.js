import React from 'react';
import PropTypes from 'prop-types';
import { emojis } from '../emoji-data';
import emojiAccessor from '../emoji-data/emoji_accessor';
import Emoji from '../Emoji';
import './style.scss';

function EmojiCategory({ index, category, filter, categorySeen, _emojiName }, {customCategoryNames}) {
    const hiddenClass = filter && !filter.hasOwnProperty(category.name) ? ' hidden' : '';

    const categoryName = customCategoryNames && customCategoryNames[category.name] ? customCategoryNames[category.name] : `#${category.name}`;

    return (
        <div className={`emoji-category ${category.name}${hiddenClass}`} key={index}>
            <div className="category-name">{categoryName}</div>
            {categorySeen && category.members.map((member, index) => {

                const emoji = emojis[member],
                    hidden = filter && !(filter.hasOwnProperty(category.name) && filter[category.name].hasOwnProperty(member));

                if (!emoji) {
                    return null;
                }

                return (
                    <Emoji member={member}
                        emoji={emojiAccessor(emoji)}
                        key={index}
                        hidden={hidden}
                        _emojiName={_emojiName}
                        categorySeen={categorySeen}/>
                );
            })}
        </div>
    );
}

EmojiCategory.propTypes = {
    index: PropTypes.number.isRequired,
    category: PropTypes.object.isRequired,
    filter: PropTypes.object,
    categorySeen: PropTypes.bool,
    _emojiName: PropTypes.object
};

EmojiCategory.contextTypes = {
    customCategoryNames: PropTypes.object
};

export default EmojiCategory;