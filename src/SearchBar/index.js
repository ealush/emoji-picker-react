import React, { Component } from 'react';
import { stackFilter, textIndexInStack, reduceEmojis, filterStack } from './helpers';
import { ALL_KEYWORDS, KEYWORDS_SINGLE } from '../constants';
import './style.scss';

class SearchBar extends Component {
    constructor(props) {
        super(props);

        this.onChange = props.onChange;
        this.filterStack = [];

        this.filterKeywords = this.filterKeywords.bind(this);
    }

    addToStack(currentFilter) {

        if (this.filterStack[this.filterStack.length-1].text === currentFilter.text) {
            return;
        }

        this.filterStack = filterStack(this.filterStack, currentFilter);

        this.filterStack.push(currentFilter);
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

            if (KEYWORDS_SINGLE.hasOwnProperty(text)) {
                matches = KEYWORDS_SINGLE[text];
            } else {
                matches = ALL_KEYWORDS.filter((keyword) => keyword.indexOf(text) > -1);
            }

            if (!matches.length) {
                return this.onChange({});
            }

            matches = reduceEmojis(matches);

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