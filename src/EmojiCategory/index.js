import React from 'react';
import { emojis } from '../emoji-data';
import emojiAccessor from '../emoji-data/emoji_accessor';
import Emoji from '../Emoji';
import styles from './style.scss';

function EmojiCategory(props) {
    
    const {category, visible, onEmojiClick, assetPath, emojiResolution} = props;
    
    let className = [styles.emojiCategory];
    if (!visible){
        className.push(styles.hidden);
    }
    
    return (
        <div className={className.join(' ')}>
            {category.members.map((member, index) => {
                const emoji = emojis[member];
                if (!emoji) {
                    return null;
                }

                return (
                    <Emoji
                        key={index}    
                        emoji={emojiAccessor(emoji)}
                        onEmojiClick={onEmojiClick}
                        assetPath = {assetPath}
                        emojiResolution= {emojiResolution}
                    />
                );
            })}
        </div>
    );
}


export default EmojiCategory;