import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { debounce, throttle } from 'throttle-debounce';
import DiversityPicker from '../DiversityPicker';
import EmojiList from '../EmojiList';
import { Section, EmojiName, Scroller } from './styled';
import {
    getScrollbarWidth,
    adjustScrollbar,
    isFirefoxOnMac,
    getOffsets
} from './helpers';
import { HIDE_SCROLL_DEBOUNCE } from '../constants';

const isFFMac = isFirefoxOnMac();

class WrapperSection extends Component {

    constructor(props) {
        super(props);
        this.observeActive = this.observeActive.bind(this);
        this.onScroll = throttle(16, this.onScroll.bind(this));
        this.hideScrollIndicator = debounce(HIDE_SCROLL_DEBOUNCE, this.hideScrollIndicator.bind(this));
        this._emojiName = null;
    }

    componentDidMount() {
        this.scrollbarWidth = getScrollbarWidth();
        this.hideNativeScrollbar();
        const positions = getOffsets(this._list);
        this.scrollHeight = positions.scrollHeight;
        this.listHeight = positions.listHeight;
        this._categories = this._list.children;
        this.observeActive();
    }

    componentDidUpdate() {
        const positions = getOffsets(this._list);
        this.scrollHeight = positions.scrollHeight;
    }

    observeActive() {
        const options = {
            root: this._list
        };

        const wrapper = this; // eslint-disable-line

        const observer = new IntersectionObserver((entries) => {

            entries.forEach((entry) => {
                const name = entry.target.getAttribute('name');

                wrapper.props.setSeenCategory(name);

                // initial load
                if (!wrapper.props.activeCategory) {
                    return wrapper.props.setActiveCategory({ name });
                }

                if (!entry.target.nextSibling) {
                    return;
                }

                const nextSiblingName = entry.target.nextSibling.getAttribute('name');

                // scrolling up
                if (entry.isIntersecting && nextSiblingName === wrapper.props.activeCategory) {
                    return wrapper.props.setActiveCategory({ name });
                }

                // scrolling down
                if (!entry.isIntersecting && name === wrapper.props.activeCategory) {
                    return wrapper.props.setActiveCategory({ name: nextSiblingName });
                }

            });
        }, options);
        [...this._categories].forEach((category) => {
            observer.observe(category);
        });
    }

    onScroll() {

        const scrollTop = this._list.scrollTop;

        if (!isFFMac && !(this.scrollHeight <= this.listHeight)) {
            requestAnimationFrame(() => adjustScrollbar(this.scrollHeight, scrollTop, this.listHeight, this._scroller));
            this.hideScrollIndicator();
            this._scroller.classList.add('shown');
        }

        this.props.suppressModifiers();
        this.props.closeDiversitiesMenu();
    }

    hideScrollIndicator() {
        this._scroller.classList.remove('shown');
    }

    hideNativeScrollbar() {
        if (!isFFMac && this.scrollbarWidth > 0) {
            return this._list.style.width = `${this._list.offsetWidth + this.scrollbarWidth}px`;
        }
    }

    scrollToCategory(name) {
        // scrolling one pixel down so intersection observer doesn't get confused
        this._list.scrollTop = this._list.querySelector(`.${name}`).offsetTop + 1;
        this.props.setActiveCategory({ name });
    }

    scrollTop() {
        this._list.scrollTop = 0;
    }

    render() {
        const {
            filter,
            diversityPicker,
            closeDiversitiesMenu,
            visibleCategories,
            modifiersSpread,
            activeCategory,
            preload
        } = this.props;

        const {
            assetPath,
            onEmojiClick,
            emojiResolution,
            disableDiversityPicker
        } = this.context;

        const noSearchResults = filter && Object.keys(filter).length === 0;

        return (
            <Section noSearchResults={noSearchResults}>
                <DiversityPicker index={diversityPicker}
                    assetPath={assetPath}
                    emojiResolution={emojiResolution}
                    onEmojiClick={onEmojiClick}
                    close={closeDiversitiesMenu}
                    disable={disableDiversityPicker}/>
                <Scroller innerRef={(scroller) => this._scroller = scroller}><div/></Scroller>
                <EmojiName innerRef={(emojiName) => this._emojiName = emojiName}></EmojiName>
                <EmojiList filter={filter}
                    onScroll={this.onScroll}
                    seenCategories={visibleCategories}
                    modifiersSpread={modifiersSpread}
                    preload={preload}
                    activeCategory={activeCategory}
                    _emojiName={this._emojiName}
                    ref={(list) => this._list = (list ? list._list : null)}/>
            </Section>
        );
    }
}

export default WrapperSection;

WrapperSection.propTypes = {
    filter: PropTypes.object,
    diversityPicker: PropTypes.number,
    closeDiversitiesMenu: PropTypes.func,
    suppressModifiers: PropTypes.func,
    setSeenCategory: PropTypes.func,
    setActiveCategory: PropTypes.func,
    visibleCategories: PropTypes.object,
    modifiersSpread: PropTypes.bool,
    activeCategory: PropTypes.string,
    preload: PropTypes.bool
};

WrapperSection.contextTypes = {
    onEmojiClick: PropTypes.func,
    parent: PropTypes.any,
    assetPath: PropTypes.string,
    emojiResolution: PropTypes.number,
    disableDiversityPicker: PropTypes.bool
};