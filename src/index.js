import React, { Component } from 'react';
import { debounce } from 'throttle-debounce';
import emojiCategories from './emoji-data/emoji-categories';
import EmojiList from './EmojiList';
import Footer from './Footer';
import CategoriesNav from './CategoriesNav';
import SearchBar from './SearchBar';

import { headerHeight, getOffsets, clearTransform, getProximity, getScrollbarWidt, adjustScrollbar } from './helpers';
import './picker.scss';

const hideScrollDebounce = 550;

class EmojiPicker extends Component {

    constructor() {
        super();

        this.state = {
            filter: null,
            modifier: null,
            activeModifier: null,
            seenCategories: {
                0: true
            }
        };

        this.active = null; // this is for updating the category name
        this.transformed = [];

        this.onScroll = this.onScroll.bind(this);
        this.onCategoryClick = this.onCategoryClick.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.onModifierChosen = this.onModifierChosen.bind(this);
        this.hideScrollbar = debounce(hideScrollDebounce, this.hideScrollbar.bind(this));
    }

    componentDidMount() {
        this.scrollbarWidth = getScrollbarWidt();
        const positions = getOffsets(this._list);
        this.offsets = positions.offsets;
        this.scrollHeight = positions.scrollHeight;
        this.listHeight = positions.listHeight;
        this._categories = this._list.children; // FIXME: Another abomination
        this.setActiveCategory({index: 0});
    }

    componentDidUpdate() {
        const positions = getOffsets(this._list);
        this.offsets = positions.offsets;
        this.scrollHeight = positions.scrollHeight;
    }

    setActiveCategory({index}) {

        const indexPresent = typeof index === 'number',
            classList = this._picker.classList,
            prevActive = this.active;

        if (index === prevActive) {
            return;
        }

        if (!indexPresent) {
            index = 0;
        }

        emojiCategories.forEach((category) => {
            if (category.name !== emojiCategories[index].name && classList.contains(category.name)) {
                classList.remove(category.name);
            }
        });

        classList.add(emojiCategories[index].name);
        this.active = index;
    }

    setSeenCategory(index) {
        if (this.state.seenCategories[index]) {
            return;
        }

        this.setState((prevState) => {
            const nextState = Object.assign({}, prevState);
            nextState.seenCategories[index] = true;
        });
    }

    onScroll(e) {
        this.hideScrollbar();

        const scrollTop = e.target.scrollTop,
            active = this.active,
            _active = this._categories[active];

        adjustScrollbar(this.scrollHeight, scrollTop, this.listHeight, this._scroller);
        this._scroller.classList.add('shown');

        const {
                proximityIndex,  // closest category index
                visibleCategory, // currently visible category
                notActiveVisible // partially visible, not active
            } = getProximity(this.offsets, scrollTop, this.listHeight);

        if (typeof notActiveVisible === 'number') {
            this.setSeenCategory(notActiveVisible);
        }

        if (visibleCategory !== active) {
            this.setSeenCategory(visibleCategory);
        }

        // this block deals with mismatches that are caused by fast scrolling
        if (typeof proximityIndex !== 'number') {
            if (visibleCategory !== active) {
                this.setActiveCategory({ index: visibleCategory });
            }
            return this.transformed = clearTransform(this.transformed);
        }

        const distance =  -(scrollTop - this.offsets[proximityIndex]),
            _activeName = _active.querySelector('.category-name'), // active category name
            currentIsFirst = proximityIndex === 0, // is this the first category?
            currentIsActive = proximityIndex === active; // is the current category the active one

        if (distance === 0 || (distance < 0 && !currentIsActive)) {
            // scroll down
            this.setActiveCategory({ index: proximityIndex});
        } else if (!currentIsFirst && distance >= 0 && currentIsActive) {
            // scroll up
            this.setActiveCategory({ index: active -1 });
        }

        if (!currentIsActive) {
            this.transformed = clearTransform(this.transformed, active);

            // push the active title up or down
            _activeName.setAttribute('style', `transform: translateY(${distance-headerHeight}px);`);
            this.transformed.push({ index: active, element: _activeName });
        }
    }

    hideScrollbar() {
        this._scroller.classList.remove('shown');
    }

    onCategoryClick(e, index) {
        e && e.preventDefault();
        const _newActive = this._list.children[index];
        _newActive.scrollIntoView({'behavior': 'smooth'});
        this.setActiveCategory({index});
    }

    onSearch(filter) {
        this.onCategoryClick(null, 0); // FIXME!!! scroll back to the top
        this.setState({ filter });
    }

    onModifierChosen(e, modifier) {
        e.preventDefault();
        if (modifier === this.state.activeModifier) {
            modifier = null;
        }
        this.setState({ activeModifier: modifier });
    }

    render() {

        const { nav = 'top', assetPath, onEmojiClick } = this.props;
        const { filter, activeModifier, seenCategories } = this.state;
        const navClass = `nav-${nav}`;

        return (
            <aside className={`emoji-picker ${navClass}`} ref={(picker) => this._picker = picker}>
                <CategoriesNav onClick={this.onCategoryClick}/>
                <SearchBar onChange={this.onSearch}/>
                <div className="wrapper">
                    <div className="scroller" ref={(scroller) => this._scroller = scroller}><div/></div>
                    <EmojiList filter={filter}
                        activeModifier={activeModifier}
                        ref={(list) => this._list = (list ? list._list : null)}
                        onScroll={this.onScroll}
                        assetPath={assetPath}
                        onEmojiClick={onEmojiClick}
                        seenCategories={seenCategories}/>
                </div>
                <Footer onModifierChosen={this.onModifierChosen} activeModifier={activeModifier}/>
            </aside>
        );
    }
}

export default EmojiPicker;
