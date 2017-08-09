import React, { Component } from 'react';
import { emojis } from '../emoji-data';
import emojiAccessor from '../emoji-data/emoji_accessor';
import Emoji from '../Emoji';
import './style.scss';

function EmojiCategory({index, category, filter, categorySeen, emojiProps}) {
    const hiddenClass = filter && !filter.hasOwnProperty(category.name) ? ' hidden' : '';

    return (
        <div className={`emoji-category ${category.name}${hiddenClass}`} key={index}>
            <div className="category-name">#{category.name}</div>
            {category.members.map((member, index) => {

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
                        categorySeen={categorySeen}
                        emojiProps={emojiProps}/>
                );
            })}
        </div>
    );
}

export default EmojiCategory;