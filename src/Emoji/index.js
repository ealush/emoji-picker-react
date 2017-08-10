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

    shouldComponentUpdate(nextProps) {
        const visibilityChanged = nextProps.hidden !== this.props.hidden,
            categoryVisibilityChanged = nextProps.categorySeen !== this.props.categorySeen,
            hasDiversities = this.hasDiversities,
            activeModifierChanged = hasDiversities && nextProps.emojiProps.activeModifier !== this.props.emojiProps.activeModifier;

        return visibilityChanged || categoryVisibilityChanged || activeModifierChanged;
    }

    onClick(e) {
        const { emojiProps, emoji } = this.props;
        const onEmojiClick = emojiProps.onEmojiClick;

        e.preventDefault();
        onEmojiClick && onEmojiClick(emoji.unified, emoji);
    }

    onMouseEnter() {
        if (this.props.emojiProps._emojiName) {
            this.props.emojiProps._emojiName.textContent = this.emoji.name;
        }
    }

    onMouseLeave(e) {

        if (e.relatedTarget && e.relatedTarget.classList && e.relatedTarget.classList.contains('emoji')) {
            return;
        }

        if (this.props.emojiProps._emojiName) {
            this.props.emojiProps._emojiName.textContent = '';
        }
    }

    onMouseDown() {

        if (!this.hasDiversities) {
            return;
        }

        this.timeCounter = Date.now();

        this.diversitiesTimeout = setTimeout(() => {
            delete this.diversitiesTimeout;
            this.props.emojiProps.openDiversitiesMenu(this.props.member);
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
        const { emoji, hidden, categorySeen, emojiProps } = this.props;
        const { activeModifier, assetPath, emojiResolution } = emojiProps;
        let unified = emoji.unified;

        if (!categorySeen || hidden) {
            const hiddenClass = hidden ? ' hidden' : '';
            return <div className={`emoji${hiddenClass}`}/>;
        }

        unified = unifiedWithModifier(emoji, activeModifier);

        const style = bgImage({ unified, assetPath, emojiResolution });
        style.order = emoji.order;

        return (
            <a href="#!"
                className="emoji"
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
    hidden: PropTypes.string,
    categorySeen: PropTypes.boolean,
    emojiProps: {
        activeModifier: PropTypes.string,
        _emojiName: PropTypes.element,
        openDiversitiesMenu: PropTypes.func.isRequired
    },
    member: PropTypes.number.isRequired

};

export default Emoji;