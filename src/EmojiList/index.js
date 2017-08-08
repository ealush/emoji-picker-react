import React, { Component } from 'react';
import { categories } from '../emoji-data';
import EmojiCategory from '../EmojiCategory';
import './style.scss';

class EmojiList extends Component {

    render() {
        const { filter, emojiProps, onScroll, seenCategories } = this.props;
        return (
            <div className="emoji-list" ref={(list) => this._list = list} onScroll={onScroll}>
                {categories.map((category, index) => {
                    const isCategorySeen = seenCategories[index]; // filter is here so all emojis are displayed when filtering
                    return (
                        <EmojiCategory category={category}
                            index={index}
                            key={index}
                            filter={filter}
                            categorySeen={isCategorySeen}
                            emojiProps={emojiProps}/>
                    );
                })}
            </div>
        );
    }
}

export default EmojiList;