import React, { Component } from 'react';
import emojiKeywords from '../emoji-data/emoji-keywords';
import emojiKeywordsSingle from '../emoji-data/emoji-keywords-single';
import emojis from '../emoji-data/emoji-list';
import { stackFilter, textIndexInStack } from './helpers';
import './style.scss';

const keys = Object.keys(emojiKeywords);

class SearchBar extends Component {
    constructor(props) {
        super(props);

        this.onChange = props.onChange;
        this.filterStack = [];

        this.filterKeywords = this.filterKeywords.bind(this);
    }

    addToStack(filter) {

        if (this.filterStack[this.filterStack.length-1].text === filter.text) {
            return;
        }

        this.filterStack = this.filterStack.filter((item, index, all) => {
            const itemPresent = !!item,
                nextItem = all[index + 1],
                nextItemPresent = !!nextItem,
                doesnotmatchesFilterText = item.text !== filter.text,
                nextDoesnotMatchesCurrent = nextItemPresent && nextItem.text !== item.text;

            return itemPresent && (!nextItemPresent || nextDoesnotMatchesCurrent) && doesnotmatchesFilterText;
        });

        this.filterStack.push(filter);
    }

    filterKeywords(e) {
        e.persist();

        setTimeout(() => {
            const text = e.target.value.trim();

            if (!text) {
                this.filterStack = [];
                return this.onChange(null);
            }

            this.filterStack = this.filterStack || [];

            const textLength = text.length;

            if (this.filterStack.length > textLength) {
                this.filterStack = this.filterStack.slice(0, textLength);
            }

            const stackIndex = textIndexInStack(text, this.filterStack);

            let matches;

            if (stackIndex > -1) {
                matches = stackFilter(stackIndex, text, this.filterStack);
                this.addToStack({ text, matches });
                return this.onChange(matches);
            } else {
                this.filterStack = [];
            }

            if (emojiKeywordsSingle.hasOwnProperty(text)) {
                matches = emojiKeywordsSingle[text];
            } else {
                matches = keys.filter((keyword) => keyword.indexOf(text) > -1);
            }


            if (!matches.length) {
                return this.onChange({});
            }

            matches = matches.reduce((accumulator, keyword) => {
                emojiKeywords[keyword].forEach((emoji) => {
                    accumulator[emojis[emoji].category] = accumulator[emojis[emoji].category] || {};
                    accumulator[emojis[emoji].category][emoji] = keyword;
                });
                return accumulator;
            }, {});

            this.filterStack.push({ text, matches });
            this.onChange(matches);
        });
    }

    render() {

        return (
            <div className="search-bar">
                <input type="text" placeholder="Emoji Search" onChange={this.filterKeywords}/>
                <i/>
            </div>
        );

    }
}

export default SearchBar;