import React, { Component } from 'react';
import emojis from '../emoji-data/emoji-list';
import Emoji from '../Emoji';
import './style.scss';

function EmojiCategory({index, category, filter, activeModifier, assetPath}) {
    const hiddenClass = filter && !filter.hasOwnProperty(category.name) ? ' hidden' : '';

    return (
        <ul className={`emoji-category ${category.name}${hiddenClass}`} key={index}>
            <li className="category-name">#{category.name}</li>
            {category.members.map((member, index) => {

                const emoji = emojis[member],
                    hidden = filter && !(filter.hasOwnProperty(category.name) && filter[category.name].hasOwnProperty(member));
                return (
                    <Emoji member={member}
                        emoji={emoji}
                        key={index}
                        hidden={hidden}
                        activeModifier={activeModifier}
                        assetPath={assetPath}/>
                );
            })}
        </ul>
    );
}

export default EmojiCategory;