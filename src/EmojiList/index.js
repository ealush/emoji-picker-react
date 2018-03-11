import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { categories } from '../emoji-data';
import EmojiCategory from '../EmojiCategory';
import './style.scss';

class EmojiList extends Component {

    shouldComponentUpdate(nextProps, nextState, {activeModifier}) {
        if (nextProps.modifiersSpread) {
            return false;
        }

        if (nextProps.filter || (!nextProps.filter && this.props.filter)) {
            return true;
        }

        if (this.props._emojiName !== nextProps._emojiName) {
            return true;
        }

        if (activeModifier !== this.context.activeModifier) {
            return true;
        }

        return Object.keys(nextProps.seenCategories).length !== Object.keys(this.props.seenCategories).length;
    }

    render() {
        const { filter, onScroll, seenCategories, preload, customCategoryNames, _emojiName } = this.props;
        const filterClass = filter ? ' filter' : '';
        return (
            <div className={`emoji-list${filterClass}`}
                ref={(list) => this._list = list}
                onScroll={onScroll}>
                {categories.map((category, index) => {
                    const isCategorySeen = preload || seenCategories[index];

                    return (
                        <EmojiCategory category={category}
                            index={index}
                            key={index}
                            filter={filter}
                            customCategoryNames={customCategoryNames}
                            _emojiName={_emojiName}
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
    preload: PropTypes.bool,
    _emojiName: PropTypes.object,
    customCategoryNames: PropTypes.object
};

EmojiList.contextTypes = {
    activeModifier: PropTypes.string
};

export default EmojiList;