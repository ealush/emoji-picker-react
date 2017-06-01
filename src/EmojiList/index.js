import React, { Component } from 'react';
import emojiCategories from '../emoji-data/emoji-categories';
import EmojiCategory from '../EmojiCategory';
import './style.scss';

class EmojiList extends Component {

    render() {
        const { filter, activeModifier, onScroll, assetPath, onEmojiClick, seenCategories } = this.props;
        return (
            <div className="emoji-list" ref={(list) => this._list = list} onScroll={onScroll}>
                {emojiCategories.map((category, index) => {
                    const isCategorySeen = !!filter ||seenCategories[index]; // filter is here so all emojis are displayed when filtering
                    return (
                        <EmojiCategory category={category}
                            index={index}
                            key={index}
                            filter={filter}
                            activeModifier={activeModifier}
                            assetPath={assetPath}
                            onEmojiClick={onEmojiClick}
                            categorySeen={isCategorySeen}/>
                    );
                })}
            </div>
        );
    }
}

export default EmojiList;