import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { categories } from '../emoji-data';
import EmojiCategory from '../EmojiCategory';
import './style.scss';

class EmojiList extends Component {

    render() {
        const { filter, emojiProps, onScroll, seenCategories } = this.props;
        const filterClass = filter ? ' filter' : '';
        return (
            <div className={`emoji-list${filterClass}`} ref={(list) => this._list = list} onScroll={onScroll}>
                {categories.map((category, index) => {
                    const isCategorySeen = seenCategories[index];
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

EmojiList.propTypes = {
    filter: PropTypes.object,
    emojiProps: PropTypes.object.isRequired,
    onScroll: PropTypes.func.isRequired,
    seenCategories: PropTypes.object.isRequired
};

export default EmojiList;