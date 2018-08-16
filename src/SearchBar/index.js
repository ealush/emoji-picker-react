import React, { Component } from 'react';
import { debounce } from 'throttle-debounce';
import PropTypes from 'prop-types';
import { stackFilter, textIndexInStack, reduceEmojis, findMatches } from './helpers';
import { FILTER_UPDATE_DEBOUNCE } from '../constants';
import './style.scss';

class SearchBar extends Component {
    constructor(props) {
        super(props);

        this.onChange = debounce(FILTER_UPDATE_DEBOUNCE, props.onChange);
        this.filterStack = [];

        this.filterKeywords = debounce(50, this.filterKeywords.bind(this));
    }

    addToStack(currentFilter) {

        const stack = this.filterStack,
            stackLength = stack.length;

        if (stackLength && stack[stackLength-1].text === currentFilter.text) {
            return;
        }

        this.filterStack.push(currentFilter);
    }

    filterKeywords() {

        const text = this._input.value.trim().toLowerCase();

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
            this.filterStack.length = stackIndex + 1;
            let skip = false;

            // if the text is shorter than the last item in the stack
            // but the full text is not in the stack
            if (text.length < this.filterStack[stackIndex].text.length) {
                skip = true;
                this.filterStack.forEach((stackItem) => {
                    if (stackItem.text === text) {
                        skip = false;
                    }
                });
            }

            if (!skip) {
                matches = stackFilter(stackIndex, text, this.filterStack);
                if (Object.keys(matches).length) {
                    this.addToStack({ text, matches });
                    return this.onChange(matches);
                }
            }
        }

        matches = findMatches(text);

        this.filterStack = [];

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
                <i className="icn-magnifier"/>
            </div>
        );

    }
}

SearchBar.propTypes = {
    onChange: PropTypes.func.isRequired
};

export default SearchBar;