import React, { Component } from 'react';
import { debounce } from 'throttle-debounce';
import PropTypes from 'prop-types';
import { stackFilter, textIndexInStack, reduceEmojis } from './helpers';
import { ALL_KEYWORDS, KEYWORDS_SINGLE, FILTER_UPDATE_DEBOUNCE } from '../constants';
import './style.scss';

class SearchBar extends Component {
    constructor(props) {
        super(props);

        this.onChange = debounce(FILTER_UPDATE_DEBOUNCE, props.onChange);
        this.filterStack = [];

        this.filterKeywords = debounce(50, this.filterKeywords.bind(this));
    }

    addToStack(currentFilter) {

        if (this.filterStack[this.filterStack.length-1].text === currentFilter.text) {
            return;
        }

        this.filterStack.push(currentFilter);
    }

    filterKeywords() {

        const text = this._input.value.trim();

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
            this.filterStack.splice(0, stackIndex);
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
    }

    render() {

        return (
            <div className="search-bar">
                <input type="text" placeholder="Emoji Search" onChange={this.filterKeywords} ref={(_input) => this._input = _input}/>
                <i/>
            </div>
        );

    }
}

SearchBar.propTypes = {
    onChange: PropTypes.func.isRequired
};

export default SearchBar;