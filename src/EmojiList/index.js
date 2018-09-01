import React, { Component } from 'react';
import { categories } from '../emoji-data';
import EmojiCategory from '../EmojiCategory';
import styles from './style.scss';

class EmojiList extends Component {
    render() {
        const { activeCategory, seenCategories, onEmojiClick, assetPath, emojiResolution } = this.props;

        return (
            <div className={styles.emojiList} >
                {categories.map((category) => {
                    if(!seenCategories[category.name]) {
                        return null;
                    }
                    return (
                        <EmojiCategory 
                            key={category.name}
                            category={category}
                            visible={activeCategory === category.name}
                            onEmojiClick={onEmojiClick}
                            assetPath = {assetPath}
                            emojiResolution= {emojiResolution}
                        /> 
                    );
                })}
            </div>
        );
    }
}

export default EmojiList;