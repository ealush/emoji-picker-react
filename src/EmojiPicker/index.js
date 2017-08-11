import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { debounce, throttle } from 'throttle-debounce';
import SkinTones from '../SkinTones';
import { categories, modifiers, skinTones } from '../emoji-data';
import EmojiList from '../EmojiList';
import CategoriesNav from '../CategoriesNav';
import SearchBar from '../SearchBar';
import DiversityPicker from '../DiversityPicker';

import './picker.scss';
import { HIDE_SCROLL_DEBOUNCE } from '../constants';
import { getOffsets,
    clearTransform,
    getProximity,
    getScrollbarWidth,
    adjustScrollbar,
    getScrollDirection,
    headerTransform,
    isFirefoxOnMac } from './helpers';

const isFFMac = isFirefoxOnMac();

class EmojiPicker extends Component {

    constructor(props) {
        super(props);

        this.state = {
            filter: null,
            modifier: null,
            activeModifier: null,
            seenCategories: {
                0: true
            },
            seenInSearch: {},
            modifiersSpread: false
        };

        this.active = null; // this is for updating the category name
        this.transformed = [];
        this.pickerClassName = `emoji-picker nav-${props.nav ? props.nav : 'top'}`;

        this.onScroll = throttle(16, this.onScroll.bind(this));
        this.onCategoryClick = this.onCategoryClick.bind(this);
        this.onEmojiClick = this.onEmojiClick.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.onModifierClick = this.onModifierClick.bind(this);
        this.suppressModifiers = this.suppressModifiers.bind(this);
        this.openDiversitiesMenu = this.openDiversitiesMenu.bind(this);
        this.closeDiversitiesMenu = this.closeDiversitiesMenu.bind(this);
        this.hideScrollIndicator = debounce(HIDE_SCROLL_DEBOUNCE, this.hideScrollIndicator.bind(this));
    }

    componentDidMount() {
        this.scrollbarWidth = getScrollbarWidth();
        this.hideNativeScrollbar();
        const positions = getOffsets(this._list);
        this.offsets = positions.offsets;
        this.scrollHeight = positions.scrollHeight;
        this.listHeight = positions.listHeight;
        this.listWidth = positions.listWidth;
        this._categories = this._list.children;
        this.setActiveCategory({index: 0});
    }

    componentDidUpdate() {
        const positions = getOffsets(this._list);
        this.offsets = positions.offsets;
        this.scrollHeight = positions.scrollHeight;
    }

    hideNativeScrollbar() {
        if (!isFFMac && this.scrollbarWidth > 0) {
            return this._list.style.width = `${this._list.offsetWidth + this.scrollbarWidth}px`;
        }
    }

    setActiveCategory({index}) {

        if (this.state.filter) { return; }

        const indexPresent = typeof index === 'number',
            prevActive = this.active;

        if (index === prevActive) {
            return;
        }

        if (!indexPresent) {
            index = 0;
        }

        this._picker.setAttribute('class', `${this.pickerClassName} ${categories[index].name}`);

        this.active = index;
    }

    unsetActiveCategory() {
        this._picker.setAttribute('class', this.pickerClassName);
    }

    setSeenCategory(index, categories) {

        const seenCategories = Object.assign({}, this.state.seenCategories, categories);
        seenCategories[index] = true;

        if (Object.keys(this.state.seenCategories).length === Object.keys(seenCategories).length) {
            return;
        }

        this.setState({ seenCategories });
    }

    setSeenInSearch(categories) {
        const seenInSearch = {...this.state.seenInSearch};
        let counter = 0;

        for (const catIndex in categories) {

            if (this.state.seenCategories[catIndex] || this.state.seenInSearch[catIndex]) {
                continue;
            }

            if (categories.hasOwnProperty(catIndex)) {
                counter++;
                seenInSearch[catIndex] = true;
            }
        }

        counter && this.setState({seenInSearch});
    }

    onScroll() {
        const scrollTop = this._list.scrollTop,
            active = this.active,
            _active = this._categories[active];

        if (!isFFMac) {
            adjustScrollbar(this.scrollHeight, scrollTop, this.listHeight, this._scroller);
            this.hideScrollIndicator();
            this._scroller.classList.add('shown');
        }

        this.proximity = getProximity(this.offsets, scrollTop, this.listHeight);

        const {
            proximityIndex, // closest category index
            activeCategory, // currently visible category
            inViewPort // partially visible, not active
        } = this.proximity;

        if (this.state.filter) {
            this.setSeenInSearch(inViewPort);
            return this.transformed = clearTransform(this.transformed);
        }

        this.setSeenCategory(activeCategory, inViewPort);

        // this block deals with mismatches that are caused by fast scrolling
        if (typeof proximityIndex !== 'number') {
            if (activeCategory !== active) {
                this.setActiveCategory({ index: activeCategory });
            }
            return this.transformed = clearTransform(this.transformed);
        }

        const distance =  -(scrollTop - this.offsets[proximityIndex]),
            _activeName = _active.firstElementChild, // active category name
            currentIsFirst = proximityIndex === 0, // is this the first category?
            currentIsActive = proximityIndex === active, // is the current category the active one
            scrollDirection = getScrollDirection({ distance, currentIsActive, currentIsFirst });

        if (scrollDirection === 'down') {
            this.setActiveCategory({ index: proximityIndex});
        } else if (scrollDirection === 'up') {
            this.setActiveCategory({ index: active -1 });
        }

        if (!currentIsActive) {
            this.transformed = clearTransform(this.transformed, active);

            // push the active title up or down
            _activeName.setAttribute('style', headerTransform(distance));
            this.transformed.push({ index: active, element: _activeName });
        }
    }

    hideScrollIndicator() {
        this._scroller.classList.remove('shown');
    }

    onCategoryClick(e, index) {
        e && e.preventDefault();
        const _newActive = this._list.children[index];
        _newActive.scrollIntoView({'behavior': 'smooth'});
        this.setActiveCategory({index});
        this.setSeenCategory(index);
    }

    onSearch(filter) {

        this.setState({ filter }, () => {
            this._list.scrollTop = 0;
            if (!filter) { return this.setActiveCategory(0); }
            this.onScroll();
            this.unsetActiveCategory();
        });
    }

    onModifierClick(e, modifier) {
        e.preventDefault();

        if (!this.state.modifiersSpread) {
            this._picker.addEventListener('mousedown', this.suppressModifiers);
            return this.setState({ modifiersSpread: true });
        }

        if (modifier === this.state.activeModifier) {
            modifier = null;
        }
        this.setState({ activeModifier: modifier, modifiersSpread: false });
    }

    suppressModifiers(e) {
        this._picker.removeEventListener('mousedown', this.suppressModifiers);

        if (e && e.target.classList.contains('st')) {
            return;
        }

        this.setState({ modifiersSpread: false });
    }

    openDiversitiesMenu(name) {

        this._picker.addEventListener('mousedown', this.closeDiversitiesMenu);
        this.setState({
            diversityPicker: name
        });
    }

    closeDiversitiesMenu(e) {
        const pickerClass = 'diversity-picker';

        if (e && (e.target.classList.contains(pickerClass) || e.target.parentElement.classList.contains(pickerClass))) {
            return;
        }

        this._picker.removeEventListener('mousedown', this.closeDiversitiesMenu);

        this.setState({
            diversityPicker: null
        });
    }

    onEmojiClick(unified, emoji) {

        const usedModifiers = modifiers.filter((modifier) => unified.indexOf(modifier) > -1);

        if (usedModifiers.length) {
            const name = `${emoji.name}::${skinTones[usedModifiers[0]]}`;
            return this.props.onEmojiClick(unified, Object.assign({}, emoji, {
                name: name || emoji.name
            }));
        } else if (this.state.activeModifier && emoji.hasOwnProperty('diversities')) {
            const modifier = emoji.diversities.filter((diversity) => diversity.indexOf(this.state.activeModifier) > -1);

            if (modifier.length) {
                const name = `${emoji.name}::${skinTones[this.state.activeModifier]}`;
                return this.props.onEmojiClick(modifier[0], Object.assign({}, emoji, {
                    name: name || emoji.name
                }));
            }
        }

        return this.props.onEmojiClick(unified, emoji);
    }

    render() {

        const { assetPath, emojiResolution } = this.props;
        const { filter, activeModifier, seenCategories, seenInSearch, diversityPicker, modifiersSpread } = this.state;
        const { openDiversitiesMenu, closeDiversitiesMenu, _emojiName } = this;
        const emojiProps = { onEmojiClick: this.onEmojiClick, assetPath, activeModifier, emojiResolution, _emojiName, openDiversitiesMenu },
            visibleCategories = Object.assign({}, seenCategories, seenInSearch);

        return (
            <aside className={this.pickerClassName} ref={(picker) => this._picker = picker}>
                <CategoriesNav onClick={this.onCategoryClick}/>
                <div className="bar-wrapper">
                    <SkinTones onModifierClick={this.onModifierClick} activeModifier={activeModifier} spread={modifiersSpread}/>
                    <SearchBar onChange={this.onSearch}/>
                </div>
                <div className="wrapper">
                    <DiversityPicker name={diversityPicker}
                        assetPath={assetPath}
                        emojiResolution={emojiResolution}
                        onEmojiClick={this.onEmojiClick}
                        close={closeDiversitiesMenu}/>
                    <div className="scroller" ref={(scroller) => this._scroller = scroller}><div/></div>
                    <span className="emoji-name" ref={(emojiName) => this._emojiName = emojiName}></span>
                    <EmojiList emojiProps={emojiProps}
                        filter={filter}
                        onScroll={this.onScroll}
                        seenCategories={visibleCategories}
                        modifiersSpread={modifiersSpread}
                        ref={(list) => this._list = (list ? list._list : null)}/>
                </div>
            </aside>
        );
    }
}

EmojiPicker.propTypes = {
    onEmojiClick: PropTypes.func.isRequired,
    nav: PropTypes.string,
    assetPath: PropTypes.string.isRequired,
    emojiResolution: PropTypes.number.isRequired
};

export default EmojiPicker;