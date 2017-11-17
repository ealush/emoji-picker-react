import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { categories } from '../emoji-data';
import EmojiCategory from '../EmojiCategory';
import './style.scss';

class EmojiList extends Component {
    shouldComponentUpdate(nextProps, nextState, {_emojiName, activeModifier}) {
        if (nextProps.modifiersSpread) {
            return false;
        }

        if (nextProps.filter || (!nextProps.filter && this.props.filter)) {
            return true;
        }

        if (_emojiName !== this.context._emojiName) {
            return true;
        }

        if (activeModifier !== this.context.activeModifier) {
            return true;
        }

        return Object.keys(nextProps.seenCategories).length !== Object.keys(this.props.seenCategories).length;
    }

    render() {
        const { filter, onScroll, seenCategories, style, preload } = this.props;
        const filterClass = filter ? ' filter' : '';
        return (
            <div className={`emoji-list${filterClass}`}
                ref={(list) => this._list = list}
                onScroll={onScroll}
                style={style}>
                {categories.map((category, index) => {
                    const isCategorySeen = preload || seenCategories[index];
                    return (
                        <EmojiCategory category={category}
                            index={index}
                            key={index}
                            filter={filter}
                            categorySeen={isCategorySeen}/>
                    );
                })}
            </div>
        );
    }
}

EmojiList.propTypes = {
    filter: PropTypes.object,
    onScroll: PropTypes.func.isRequired,
    seenCategories: PropTypes.object.isRequired,
    style: PropTypes.object,
    preload: PropTypes.bool
};

EmojiList.contextTypes = {
    _emojiName: PropTypes.object,
    activeModifier: PropTypes.string
};

export default EmojiList;