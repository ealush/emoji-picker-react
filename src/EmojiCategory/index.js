import React from 'react';
import PropTypes from 'prop-types';
import { emojis } from '../emoji-data';
import emojiAccessor from '../emoji-data/emoji_accessor';
import Emoji from '../Emoji';
import { Div } from './styled';

function EmojiCategory({ index, category, filter, categorySeen, _emojiName, activeCategory }, {customCategoryNames}) {
    const hiddenClass = filter && !filter.hasOwnProperty(category.name) ? ' hidden' : '';
    const categoryName = customCategoryNames && customCategoryNames[category.name] ? customCategoryNames[category.name] : category.name;
    return (
        <Div className={`emoji-category ${category.name}${hiddenClass}`}
            name={category.name}
            activeCategory={activeCategory}
            key={index}>
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
        </Div>
    );
}

EmojiCategory.propTypes = {
    index: PropTypes.number.isRequired,
    category: PropTypes.object.isRequired,
    filter: PropTypes.object,
    categorySeen: PropTypes.bool,
    _emojiName: PropTypes.object,
    activeCategory: PropTypes.string
};

EmojiCategory.contextTypes = {
    customCategoryNames: PropTypes.object
};

export default EmojiCategory;