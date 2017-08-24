import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { categories } from '../emoji-data';
import EmojiCategory from '../EmojiCategory';
import './style.scss';

class EmojiList extends Component {
    shouldComponentUpdate(nextProps) {
        if (nextProps.modifiersSpread) {
            return false;
        }

        if (nextProps.filter || (!nextProps.filter && this.props.filter)|| nextProps) {
            return true;
        }

        if (nextProps.emojiProps._emojiName !== this.props.emojiProps._emojiName) {
            return true;
        }

        if (nextProps.emojiProps.activeModifier !== this.props.emojiProps.activeModifier) {
            return true;
        }

        return Object.keys(nextProps.seenCategories).length !== Object.keys(this.props.seenCategories).length;
    }

    render() {
        const { filter, emojiProps, onScroll, seenCategories, style } = this.props;
        const filterClass = filter ? ' filter' : '';
        return (
            <div className={`emoji-list${filterClass}`}
                ref={(list) => this._list = list}
                onScroll={onScroll}
                style={style}>
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