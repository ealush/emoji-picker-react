import React, { Component } from 'react';
import { bgImage, memberWithModifier } from './helpers';
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
        const { emojiProps, member, emoji } = this.props;
        const onEmojiClick = emojiProps.onEmojiClick;

        e.preventDefault();
        onEmojiClick && onEmojiClick(member, emoji);
    }

    onMouseEnter() {
        this.props.emojiProps.onEmojiHover(this.emoji.shortname);
    }

    onMouseLeave(e) {

        if (e.relatedTarget && e.relatedTarget.classList && e.relatedTarget.classList.contains('emoji')) {
            return;
        }

        this.props.emojiProps.onEmojiHover(null);
    }

    onMouseDown() {

        if (!this.hasDiversities) {
            return;
        }

        const emoji = Object.assign({ member: this.props.member }, this.emoji);

        this.timeCounter = Date.now();

        this.diversitiesTimeout = setTimeout(() => {
            delete this.diversitiesTimeout;
            this.props.emojiProps.openDiversitiesMenu(emoji);
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
        let member = this.props.member;

        if (emoji.hasOwnProperty('diversity') && emoji.diversity !== member) {
            return null;
        }

        const style = {
            order: emoji.order
        };

        if (!categorySeen || hidden) {
            const hiddenClass = hidden ? ' hidden' : '';
            return <div className={`emoji${hiddenClass}`} style={style}/>;
        }

        member = memberWithModifier(emoji, member, activeModifier);

        Object.assign(style, bgImage({ member, assetPath, emojiResolution }));

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

export default Emoji;