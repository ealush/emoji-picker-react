import React, { Component } from 'react';
import { throttle } from 'throttle-debounce';
import emojiKeywords from '../emoji-data/emoji-keywords';
import emojiKeywordsSingle from '../emoji-data/emoji-keywords-single';
import emojis from '../emoji-data/emoji-list';
import './style.scss';

const keys = Object.keys(emojiKeywords),
    searchThrottle = 50;

class SearchBar extends Component {
    constructor(props) {
        super(props);

        this.onChange = props.onChange;
        this.filterStack = [];

        this.filterKeywords = this.filterKeywords.bind(this);
        this.throttledChange = throttle(searchThrottle, this.throttledChange.bind(this));
    }

    textIndexInStack(text) {
        const textLength = text.length,
            stack = this.filterStack,
            stackLength = stack.length;

        if (!stackLength) {
            return -1;
        }

        if (stackLength >= textLength && stack[textLength - 1].text === text) {
            return (textLength - 1);
        }

        for (let i = stackLength - 1; i >= 0; i--) {
            const stackItem = stack[i];

            if (stackItem.text === text) {
                return i;
            }

            if (stackItem.text.indexOf(text.substr(0, i)) > -1) {
                return i;
            }
        }

        return -1;
    }

    stackFilter(index, text) {
        const matches = {},
            stackedItem = this.filterStack[index],
            prevMatches = stackedItem.matches;

        for (const category in prevMatches) {
            matches[category] = {};
            for (const emoji in prevMatches[category]) {
                if (prevMatches[category][emoji].indexOf(text) > -1) {
                    matches[category][emoji] = prevMatches[category][emoji];
                }
            }
            if (!Object.keys(matches[category]).length) {
                delete matches[category];
            }
        }

        return matches;
    }

    addToStack(filter) {
        this.filterStack.filter((item) => !!item);
        this.filterStack.push(filter);
    }

    throttledChange(e) {
        const text = e.target.value.trim();

        if (!text) {
            this.filterStack = [];
            return this.onChange(null);
        }

        const textLength = text.length,
            stackIndex = this.textIndexInStack(text);

        let matches;

        if (stackIndex > -1) {
            if (this.filterStack.length > textLength) {
                this.filterStack.slice(0, textLength);
            }
            matches = this.stackFilter(stackIndex, text);
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
    }

    filterKeywords(e) {
        e.persist();
        this.throttledChange(e);
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