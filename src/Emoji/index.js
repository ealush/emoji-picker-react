import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bgImage, unifiedWithModifier } from './helpers';
import { OPEN_DIVERSITIES_TIMEOUT} from '../constants';
import styles from './style.scss';

class Emoji extends Component {

    constructor(props) {
        super(props);

        this.emoji = props.emoji;
        this.hasDiversities = this.emoji.hasOwnProperty('diversities');

        this.onClick = this.onClick.bind(this);
        this.emojiChosen = this.emojiChosen.bind(this);
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
        e.preventDefault();
    }

    emojiChosen(e) {
        const { emoji, onEmojiClick } = this.props;

        onEmojiClick && onEmojiClick(emoji.unified, emoji, e);

        if (!e.defaultPrevented) { e.preventDefault(); }
    }

    onMouseEnter() {
        if (this.props._emojiName) {
            this.props._emojiName.textContent = this.emoji.name;
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

        if (this.props._emojiName) {
            this.props._emojiName.textContent = '';
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
            return this.emojiChosen(e);
        }
    }

    render() {
        const { emoji, assetPath, emojiResolution } = this.props;
        
        let unified = emoji.unified;
        
        const style = bgImage({ unified, assetPath, emojiResolution });
        style.order = emoji.order;

        return (
            <a className={styles.emoji}
                onClick={this.onClick}
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}
                tabIndex={emoji.order}
                style={style}/>
        );
    }
}

export default Emoji;