import React, { Component } from 'react';
import { bgImage, memberWithModifier } from './helpers';
import './style.scss';

class Emoji extends Component {

    constructor() {
        super();

        this.onClick = this.onClick.bind(this);
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
    }

    shouldComponentUpdate(nextProps) {
        const visibilityChanged = nextProps.hidden !== this.props.hidden,
            categoryVisibilityChanged = nextProps.categorySeen !== this.props.categorySeen,
            hasDiversities = this.props.emoji.hasOwnProperty('diversities'),
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
        this.props.emojiProps.onEmojiHover(this.props.emoji.shortname);
    }

    onMouseLeave(e) {

        if (e.relatedTarget && e.relatedTarget.classList && e.relatedTarget.classList.contains('emoji')) {
            return;
        }

        this.props.emojiProps.onEmojiHover(null);
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
                tabIndex={emoji.order}
                style={style}
                onClick={this.onClick}/>
        );
    }
}

export default Emoji;