import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SkinTones from '../SkinTones';
import { categories, modifiers, skinTones } from '../emoji-data';
import CategoriesNav from '../CategoriesNav';
import WrapperSection from '../WrapperSection';
import SearchBar from '../SearchBar';

import './style.scss';

const CLASSNAME_CATEGORY_INDEX = 1;
const CLASSNAME_MODIFIER_INDEX = 2;

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

        this.transformed = [];
        this.pickerClassNames = ['emoji-picker', '', ''];
        this.onCategoryClick = this.onCategoryClick.bind(this);
        this.onEmojiClick = this.onEmojiClick.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.onModifierClick = this.onModifierClick.bind(this);
        this.suppressModifiers = this.suppressModifiers.bind(this);
        this.setSeenCategory = this.setSeenCategory.bind(this);
        this.openDiversitiesMenu = this.openDiversitiesMenu.bind(this);
        this.closeDiversitiesMenu = this.closeDiversitiesMenu.bind(this);
        this.setActiveCategory = this.setActiveCategory.bind(this);
        this.setSeenInSearch = this.setSeenInSearch.bind(this);
    }

    getChildContext() {
        const { assetPath, emojiResolution, disableDiversityPicker, customCategoryNames} = this.props;
        const { activeModifier } = this.state;
        const { openDiversitiesMenu } = this;
        return { onEmojiClick: this.onEmojiClick, parent: this, assetPath, activeModifier, emojiResolution, openDiversitiesMenu, disableDiversityPicker, customCategoryNames };
    }

    componentDidMount() {
        this.setActiveCategory({ index: 0 });
    }

    setPickerClassname(index, nextValue = '') {
        this.pickerClassNames[index] = nextValue;
        this._picker.setAttribute('class', this.pickerClassNames.join(' '));
    }

    setActiveCategory({index}) {

        if (!categories[index]) { return; }

        if (this.state.filter) { return; }

        const indexPresent = typeof index === 'number',
            prevActive = this.state.activeCategory;

        if (index === prevActive) {
            return;
        }

        if (!indexPresent) {
            index = 0;
        }

        this.setPickerClassname(CLASSNAME_CATEGORY_INDEX, categories[index].name);
        this.setState({ activeCategory: index });
    }

    unsetActiveCategory() {
        this.setPickerClassname(CLASSNAME_CATEGORY_INDEX);
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

    onCategoryClick(e, index) {
        e && e.preventDefault();
        this.setState({ delayedCategory: index });
        this.setSeenCategory(index);
        this._wrapperSection.scrollToCategoryByIndex(index);
    }

    onSearch(filter) {

        this.setState({ filter }, () => {
            this._wrapperSection.scrollTop();
            if (!filter) { return this.setActiveCategory(0); }
            this._wrapperSection.onScroll();
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

        this.setPickerClassname(CLASSNAME_MODIFIER_INDEX, modifier);
        this.setState({ activeModifier: modifier, modifiersSpread: false });
    }

    suppressModifiers(e) {
        if (!this.state.modifiersSpread) { return;}
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
        if (!this.state.diversityPicker) { return;}
        const pickerClass = 'diversity-picker';

        if (e && (e.target.classList.contains(pickerClass) || e.target.parentElement.classList.contains(pickerClass))) {
            return;
        }

        this._picker.removeEventListener('mousedown', this.closeDiversitiesMenu);

        this.setState({
            diversityPicker: null
        });
    }

    onEmojiClick(unified, emoji, e) {

        e.preventDefault();

        const usedModifiers = modifiers.filter((modifier) => unified.indexOf(modifier) > -1);

        if (usedModifiers.length) {
            const name = `${emoji.name}::${skinTones[usedModifiers[0]]}`;
            return this.props.onEmojiClick(unified, Object.assign({}, emoji, {
                name: name || emoji.name
            }), e);
        } else if (this.state.activeModifier && emoji.hasOwnProperty('diversities')) {
            const modifier = emoji.diversities.filter((diversity) => diversity.indexOf(this.state.activeModifier) > -1);

            if (modifier.length) {
                const name = `${emoji.name}::${skinTones[this.state.activeModifier]}`;
                return this.props.onEmojiClick(modifier[0], Object.assign({}, emoji, {
                    name: name || emoji.name
                }), e);
            }
        }

        return this.props.onEmojiClick(unified, emoji, e);
    }

    render() {
        const { preload } = this.props;
        const visibleCategories = Object.assign({}, this.state.seenCategories, this.state.seenInSearch);

        return (
            <aside className={this.pickerClassNames.join(' ')}
                ref={(picker) => this._picker = picker}>
                <CategoriesNav onClick={this.onCategoryClick}/>
                <div className="bar-wrapper">
                    <SkinTones onModifierClick={this.onModifierClick}
                        activeModifier={this.state.activeModifier}
                        spread={this.state.modifiersSpread}/>
                    <SearchBar onChange={this.onSearch}/>
                </div>
                <WrapperSection filter={this.state.filter}
                    diversityPicker={this.state.diversityPicker}
                    closeDiversitiesMenu={this.closeDiversitiesMenu}
                    visibleCategories={visibleCategories}
                    modifiersSpread={this.state.modifiersSpread}
                    ref={(ref) => this._wrapperSection = ref}
                    setSeenCategory={this.setSeenCategory}
                    suppressModifiers={this.suppressModifiers}
                    setActiveCategory={this.setActiveCategory}
                    setSeenInSearch={this.setSeenInSearch}
                    activeCategory={this.state.activeCategory}
                    delayedCategory={this.state.delayedCategory}
                    preload={preload}/>
            </aside>
        );
    }
}

EmojiPicker.propTypes = {
    onEmojiClick: PropTypes.func.isRequired,
    assetPath: PropTypes.string,
    emojiResolution: PropTypes.number,
    preload: PropTypes.bool,
    customCategoryNames: PropTypes.object,
    disableDiversityPicker: PropTypes.bool
};

EmojiPicker.childContextTypes = {
    customCategoryNames: PropTypes.object,
    onEmojiClick: PropTypes.func,
    parent: PropTypes.instanceOf(EmojiPicker),
    assetPath: PropTypes.string,
    activeModifier: PropTypes.string,
    emojiResolution: PropTypes.number,
    openDiversitiesMenu: PropTypes.func,
    disableDiversityPicker: PropTypes.bool
};

export default EmojiPicker;