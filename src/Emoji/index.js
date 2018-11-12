import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bgImage, unifiedWithModifier } from './helpers';
import { OPEN_DIVERSITIES_TIMEOUT} from '../constants';
import './style.scss';
import { EmojiPickerContext } from "../context/index";

class Emoji extends Component {

    constructor(props) {
        super(props);

        this.emoji = props.emoji;
        this.hasDiversities = this.emoji.hasOwnProperty('diversities');

        this.onClick = this.onClick.bind(this);
        this.emojiChosen = this.emojiChosen.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.buildStyle = this.buildStyle.bind(this);
        this.buildClassName = this.buildClassName.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {

        const visibilityChanged = nextProps.hidden !== this.props.hidden,
            categoryVisibilityChanged = nextProps.categorySeen !== this.props.categorySeen,
            hasDiversities = this.hasDiversities,
            activeModifierChanged = hasDiversities;

        return visibilityChanged || categoryVisibilityChanged || activeModifierChanged;
    }

    onClick(e) {
        e.preventDefault();
    }

    emojiChosen(context, e) {
        const { emoji } = this.props;
        const onEmojiClick = context.onEmojiClick;

        onEmojiClick && onEmojiClick(emoji.unified, emoji, e);

        if (!e.defaultPrevented) { e.preventDefault(); }
    }

    onMouseEnter(context) {
        if (this.props._emojiName) {
            this.props._emojiName.textContent = this.emoji.name;
        }

        if (!this.hasDiversities || this.props.disableDiversityPicker) {
            return;
        }

        this.onMouseEnterTimeout = setTimeout(() => {
            context.openDiversitiesMenu(this.props.member);
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

    onMouseDown(context) {

        clearTimeout(this.onMouseEnterTimeout);

        if (!this.hasDiversities || this.props.disableDiversityPicker) {
            return;
        }

        this.timeCounter = Date.now();

        this.diversitiesTimeout = setTimeout(() => {
            delete this.diversitiesTimeout;
            context.openDiversitiesMenu(this.props.member);
        }, OPEN_DIVERSITIES_TIMEOUT);
    }

    onMouseUp(context, e) {

        const counter = this.timeCounter;
        clearTimeout(this.diversitiesTimeout);
        delete this.timeCounter;

        if (!(counter && (Date.now() - counter) >= OPEN_DIVERSITIES_TIMEOUT)) {
            return this.emojiChosen(context, e);
        }
    }

    buildClassName() {
        const { hidden, categorySeen } = this.props;
        const shownClass = (categorySeen && !hidden) ? ' shown' : '';
        const className = `emoji${this.hasDiversities ? ' has-diversities' : ''}${shownClass}`;
        return className;
    }

    buildStyle(context) {
        const { emoji } = this.props;
        const { activeModifier, assetPath, emojiResolution } = context;
        let unified = emoji.unified;
        unified = unifiedWithModifier(emoji, activeModifier);
        const style = bgImage({ unified, assetPath, emojiResolution });
        style.order = emoji.order;
        return style;
    }

    render() {
        const { emoji } = this.props;

        return (
            <EmojiPickerContext.Consumer>
                {context => (
                    <a className={this.buildClassName()}
                        onClick={this.onClick}
                        onMouseEnter={this.onMouseEnter.bind(this, context)}
                        onMouseLeave={this.onMouseLeave}
                        onMouseDown={this.onMouseDown.bind(this, context)}
                        onMouseUp={this.onMouseUp.bind(this, context)}
                        tabIndex={emoji.order}
                        style={this.buildStyle(context)} />
                )}
            </EmojiPickerContext.Consumer>
        );
    }
}

Emoji.propTypes = {
    emoji: PropTypes.object.isRequired,
    hidden: PropTypes.bool,
    categorySeen: PropTypes.bool,
    member: PropTypes.number.isRequired,
    disableDiversityPicker: PropTypes.bool,
    _emojiName: PropTypes.object
};

export default Emoji;