import React, { Component } from 'react';
import { categories } from '../emoji-data';
import CategoriesNav from '../CategoriesNav';

import { imgURL } from '../Emoji/helpers';


import styles from './style.scss';
import EmojiList from '../EmojiList';

class EmojiPicker extends Component {
    
    state = {
        activeCategory: '',
        seenCategories: {}
    };

    componentDidMount() {
        const firstCategory = categories[0].name;

        let seenCategories = {}
        seenCategories[firstCategory] = true;

        this.setState({
            activeCategory: firstCategory,
            seenCategories: seenCategories
        });
    }

    setSeenCategory = (category) => {
        const seenCategories = Object.assign({}, this.state.seenCategories);
        seenCategories[category.name] = true;
        this.setState({seenCategories, activeCategory: category.name });
    }

    onCategoryClick = (category) => {
        this.setSeenCategory(category);
    }

    
    onEmojiClick(unified, emoji, e) {
        e.preventDefault();
        return imgURL({unified, emoji, e});
    }

    render() {
        const { assetPath } = this.props;
        const {activeCategory, seenCategories, emojiResolution} = this.state;
        
        return (
            <aside className={styles.emojiPicker}>
                <CategoriesNav onClick={this.onCategoryClick} activeCategory={activeCategory}/>

                <div className={styles.barWrapper}></div>

                <EmojiList 
                    onEmojiClick = {this.onEmojiClick}
                    assetPath = {assetPath}
                    emojiResolution= {emojiResolution}
                    activeCategory = {activeCategory}
                    seenCategories = {seenCategories}/>
            </aside>
        );
    }
}

export default EmojiPicker;