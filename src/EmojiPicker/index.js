import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SkinTones from '../SkinTones';
import { modifiers, skinTones } from '../emoji-data';
import CategoriesNav from '../CategoriesNav';
import WrapperSection from '../WrapperSection';
import SearchBar from '../SearchBar';
import { Aside } from './styled';

const CLASSNAME_MODIFIER_INDEX = 2;

class EmojiPicker extends Component {

    constructor(props) {
        super(props);

        this.state = {
            filter: null,
            modifier: null,
            activeModifier: null,
            seenCategories: {},
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
    }

    getChildContext() {
        const { assetPath, emojiResolution, disableDiversityPicker, customCategoryNames} = this.props;
        const { activeModifier } = this.state;
        const { openDiversitiesMenu } = this;
        return { onEmojiClick: this.onEmojiClick, parent: this, assetPath, activeModifier, emojiResolution, openDiversitiesMenu, disableDiversityPicker, customCategoryNames };
    }

    setPickerClassname(index, nextValue = '') {
        this.pickerClassNames[index] = nextValue;
        this._picker.setAttribute('class', this.pickerClassNames.join(' '));
    }

    setActiveCategory({ name }) {
        if (this.state.filter) { return; }

        const prevActive = this.state.activeCategory;

        if (name === prevActive) {
            return;
        }

        this.setState({ activeCategory: name });
    }

    setSeenCategory(name) {
        const seenCategories = Object.assign({}, this.state.seenCategories);
        seenCategories[name] = true;

        if (Object.keys(this.state.seenCategories).length === Object.keys(seenCategories).length) {
            return;
        }

        this.setState({ seenCategories });
    }

    onCategoryClick(e, name) {
        e && e.preventDefault();
        this.setSeenCategory(name);
        this._wrapperSection.scrollToCategory(name);
    }

    onSearch(filter) {

        this.setState({ filter }, () => {
            this._wrapperSection.scrollTop();
            this._wrapperSection.onScroll();
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
        const { activeCategory } = this.state;
        const visibleCategories = Object.assign({}, this.state.seenCategories);

        return (
            <Aside className={this.pickerClassNames.join(' ')}
                ref={(picker) => this._picker = picker}>
                <CategoriesNav onClick={this.onCategoryClick}
                    activeCategory={activeCategory}/>
                <div className="bar-wrapper">
                    <SkinTones onModifierClick={this.onModifierClick}
                        activeModifier={this.state.activeModifier}
                        spread={this.state.modifiersSpread}/>
                    <SearchBar onChange={this.onSearch}/>
                </div>
                <WrapperSection ref={(ref) => this._wrapperSection = ref}
                    filter={this.state.filter}
                    diversityPicker={this.state.diversityPicker}
                    closeDiversitiesMenu={this.closeDiversitiesMenu}
                    visibleCategories={visibleCategories}
                    modifiersSpread={this.state.modifiersSpread}
                    setSeenCategory={this.setSeenCategory}
                    suppressModifiers={this.suppressModifiers}
                    setActiveCategory={this.setActiveCategory}
                    activeCategory={activeCategory}
                    preload={preload}/>
            </Aside>
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