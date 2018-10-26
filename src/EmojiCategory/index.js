import React from 'react';
import PropTypes from 'prop-types';
import { emojis } from '../emoji-data';
import emojiAccessor from '../emoji-data/emoji_accessor';
import Emoji from '../Emoji';
import { Div, CategoryName } from './styled';

function EmojiCategory({ index, category, filter, categorySeen, _emojiName, isActiveCategory }, {customCategoryNames}) {
    const hiddenClass = filter && !filter.hasOwnProperty(category.name) ? ' hidden' : '';
    const categoryName = customCategoryNames && customCategoryNames[category.name] ? customCategoryNames[category.name] : category.name;
    return (
        <Div className={`${category.name}${hiddenClass}`}
            filter={filter}
            name={category.name}
            key={index}>
            <CategoryName filter={filter} isActiveCategory={isActiveCategory}>{categoryName}</CategoryName>
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
    isActiveCategory: PropTypes.bool
};

EmojiCategory.contextTypes = {
    customCategoryNames: PropTypes.object
};

export default EmojiCategory;