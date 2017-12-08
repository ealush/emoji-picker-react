import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bgImage, unifiedWithModifier } from './helpers';
import { OPEN_DIVERSITIES_TIMEOUT} from '../constants';
import './style.scss';

class Emoji extends Component {

    constructor(props) {
        super(props);

        this.emoji = props.emoji;
        this.hasDiversities = this.emoji.hasOwnProperty('diversities');

        this.onClick = this.onClick.bind(this);
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {

        const visibilityChanged = nextProps.hidden !== this.props.hidden,
            categoryVisibilityChanged = nextProps.categorySeen !== this.props.categorySeen,
            hasDiversities = this.hasDiversities,
            activeModifierChanged = hasDiversities && nextContext.activeModifier !== this.context.activeModifier;

        return visibilityChanged || categoryVisibilityChanged || activeModifierChanged;
    }

    onClick(e) {
        const { emoji } = this.props;
        const onEmojiClick = this.context.onEmojiClick;

        e.preventDefault();
        onEmojiClick && onEmojiClick(emoji.unified, emoji);
    }

    onMouseEnter() {
        if (this.context.parent._emojiName) {
            this.context.parent._emojiName.textContent = this.emoji.name;
        }

        if (!this.hasDiversities || this.props.disableDiversityPicker) {
            return;
        }

        this.onMouseEnterTimeout = setTimeout(() => {
            this.context.openDiversitiesMenu(this.props.member);
        }, OPEN_DIVERSITIES_TIMEOUT);
    }

    onMouseLeave(e) {

        clearTimeout(this.onMouseEnterTimeout);

        if (e.relatedTarget && e.relatedTarget.classList && e.relatedTarget.classList.contains('emoji')) {
            return;
        }

        if (this.context.parent._emojiName) {
            this.context.parent._emojiName.textContent = '';
        }
    }

    onMouseDown() {

        clearTimeout(this.onMouseEnterTimeout);

        if (!this.hasDiversities || this.props.disableDiversityPicker) {
            return;
        }

        this.timeCounter = Date.now();

        this.diversitiesTimeout = setTimeout(() => {
            delete this.diversitiesTimeout;
            this.context.openDiversitiesMenu(this.props.member);
        }, OPEN_DIVERSITIES_TIMEOUT);
    }

    onMouseUp(e) {

        const counter = this.timeCounter;
        clearTimeout(this.diversitiesTimeout);
        delete this.timeCounter;

        if (!(counter && (Date.now() - counter) >= OPEN_DIVERSITIES_TIMEOUT)) {
            return this.onClick(e);
        }
    }

    render() {
        const { emoji, hidden, categorySeen } = this.props;
        const { activeModifier, assetPath, emojiResolution } = this.context;
        let unified = emoji.unified;

        if (!categorySeen || hidden) {
            const hiddenClass = hidden ? ' hidden' : '';
            return <div className={`emoji${hiddenClass}`}/>;
        }

        unified = unifiedWithModifier(emoji, activeModifier);

        const style = bgImage({ unified, assetPath, emojiResolution }),
            className = `emoji${this.hasDiversities ? ' has-diversities' : ''}`;
        style.order = emoji.order;

        return (
            <a href="#!"
                className={className}
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}
                tabIndex={emoji.order}
                style={style}/>
        );
    }
}

Emoji.propTypes = {
    emoji: PropTypes.object.isRequired,
    hidden: PropTypes.bool,
    categorySeen: PropTypes.bool,
    member: PropTypes.number.isRequired,
    disableDiversityPicker: PropTypes.bool
};

Emoji.contextTypes = {
    onEmojiClick: PropTypes.func,
    parent: PropTypes.any,
    assetPath: PropTypes.string,
    activeModifier: PropTypes.string,
    emojiResolution: PropTypes.number,
    _emojiName: PropTypes.object,
    openDiversitiesMenu: PropTypes.func,
    disableDiversityPicker: PropTypes.bool
};

export default Emoji;