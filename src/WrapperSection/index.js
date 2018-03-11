import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { debounce, throttle } from 'throttle-debounce';
import DiversityPicker from '../DiversityPicker';
import EmojiList from '../EmojiList';
import './style.scss';
import {
    clearTransform,
    getProximity,
    getScrollbarWidth,
    adjustScrollbar,
    hitAnotherCategory,
    isFirefoxOnMac,
    getOffsets,
    headerTransform
} from './helpers';
import { HIDE_SCROLL_DEBOUNCE } from '../constants';

const isFFMac = isFirefoxOnMac();

class WrapperSection extends Component {

    constructor(props) {
        super(props);

        this.onScroll = throttle(16, this.onScroll.bind(this));
        this.hideScrollIndicator = debounce(HIDE_SCROLL_DEBOUNCE, this.hideScrollIndicator.bind(this));

        this._emojiName = null;
    }

    componentDidMount() {
        this.headerHeight = this._list.querySelector('.category-name').clientHeight;
        this.scrollbarWidth = getScrollbarWidth();
        this.hideNativeScrollbar();
        const positions = getOffsets(this._list);
        this.offsets = positions.offsets;
        this.scrollHeight = positions.scrollHeight;
        this.listHeight = positions.listHeight;
        this.listWidth = positions.listWidth;
        this._categories = this._list.children;
    }

    componentDidUpdate() {
        const positions = getOffsets(this._list);
        this.offsets = positions.offsets;
        this.scrollHeight = positions.scrollHeight;
    }

    onScroll() {

        const scrollTop = this._list.scrollTop,
            active = this.props.activeCategory,
            _active = this._categories[active];

        if (!isFFMac && !(this.scrollHeight <= this.listHeight)) {
            adjustScrollbar(this.scrollHeight, scrollTop, this.listHeight, this._scroller);
            this.hideScrollIndicator();
            this._scroller.classList.add('shown');
        }

        this.props.suppressModifiers();
        this.props.closeDiversitiesMenu();

        this.proximity = getProximity(this.offsets, scrollTop, this.listHeight, this.headerHeight);

        const {
            proximityIndex, // closest category index
            activeCategory, // currently visible category
            inViewPort // partially visible, not active
        } = this.proximity;

        if (this.props.filter) {
            this.props.setSeenInSearch(inViewPort);
            return this.transformed = clearTransform(this.transformed);
        }

        this.props.setSeenCategory(activeCategory, inViewPort);

        // this block deals is for most cases - we're not near a title change
        if (typeof proximityIndex !== 'number') {
            if (activeCategory !== active) {
                this.props.setActiveCategory({ index: activeCategory });
            }
            return this.transformed = clearTransform(this.transformed);
        }
        const distance =  -(scrollTop - this.offsets[proximityIndex]),
            _activeName = _active.firstElementChild, // active category name
            currentIsFirst = proximityIndex === 0, // is this the first category?
            currentIsActive = proximityIndex === active, // is the current category the active one
            scrollDirection = hitAnotherCategory({ distance, currentIsActive, currentIsFirst });

        if (this.props.delayedCategory === proximityIndex || scrollDirection === 'next') {
            this.props.setActiveCategory({ index: proximityIndex});
        } else if (scrollDirection === 'prev') {
            this.props.setActiveCategory({ index: active -1 });
        }

        if (!currentIsActive) {
            this.transformed = clearTransform(this.transformed, active);

            // push the active title up or down
            _activeName.setAttribute('style', headerTransform(distance, this.headerHeight));
            this.transformed.push({ index: active, element: _activeName });
        }
    }

    hideScrollIndicator() {
        this._scroller.classList.remove('shown');
    }

    hideNativeScrollbar() {
        if (!isFFMac && this.scrollbarWidth > 0) {
            return this._list.style.width = `${this._list.offsetWidth + this.scrollbarWidth}px`;
        }
    }

    scrollToCategoryByIndex(index) {
        this._list.scrollTop = this.offsets[index];
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
            preload
        } = this.props;

        const {
            assetPath,
            onEmojiClick,
            emojiResolution,
            disableDiversityPicker
        } = this.context;

        const wrapperClassName = `wrapper${filter && Object.keys(filter).length === 0 ? ' no-results icn-magnifier' : ''}`;

        return (
            <section className={wrapperClassName}>
                <DiversityPicker index={diversityPicker}
                    assetPath={assetPath}
                    emojiResolution={emojiResolution}
                    onEmojiClick={onEmojiClick}
                    close={closeDiversitiesMenu}
                    disable={disableDiversityPicker}/>
                <div className="scroller" ref={(scroller) => this._scroller = scroller}><div/></div>
                <span className="emoji-name" ref={(emojiName) => this._emojiName = emojiName}></span>
                <EmojiList filter={filter}
                    onScroll={this.onScroll}
                    seenCategories={visibleCategories}
                    modifiersSpread={modifiersSpread}
                    preload={preload}
                    _emojiName={this._emojiName}
                    ref={(list) => this._list = (list ? list._list : null)}/>
            </section>
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
    setSeenInSearch: PropTypes.func,
    setActiveCategory: PropTypes.func,
    visibleCategories: PropTypes.object,
    modifiersSpread: PropTypes.bool,
    activeCategory: PropTypes.number,
    delayedCategory: PropTypes.number,
    preload: PropTypes.bool
};

WrapperSection.contextTypes = {
    onEmojiClick: PropTypes.func,
    parent: PropTypes.any,
    assetPath: PropTypes.string,
    activeModifier: PropTypes.string,
    emojiResolution: PropTypes.number,
    disableDiversityPicker: PropTypes.bool
};