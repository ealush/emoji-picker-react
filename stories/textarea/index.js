import React, { Component } from 'react';
import PropTypes from 'prop-types';
import EmojiPicker from '../../src';
import JSEMOJI from 'emoji-js';
import SmileyFace from './SmileyFace';
import CharCount from './CharCount';
import './style.scss';

class EmojiTextarea extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value || '',
            pickerOpen: props.pickerOpen || false
        };

        this.emojiConvertor = new JSEMOJI();
        this.emojiConvertor.supports_css = false;
        this.emojiConvertor.allow_native = false;
        this.emojiConvertor.replace_mode = 'unified';
        this.emojiConvertor.img_set = 'emojione';
        this.emojiConvertor.img_sets.emojione.path = 'https://cdn.jsdelivr.net/emojione/assets/3.0/png/32/';

        this.onChange = this.onChange.bind(this);
        this.onTriggerClick = this.onTriggerClick.bind(this);
        this.onEmojiClick = this.onEmojiClick.bind(this);
        this.isAnOutsideClick = this.isAnOutsideClick.bind(this);
        this.onPickerkeypress = this.onPickerkeypress.bind(this);
        this.closePicker = this.closePicker.bind(this);
    }

    componentDidUpdate() {
        if (this.state.pickerOpen) {
            setTimeout(() => {
                window.addEventListener('click', this.isAnOutsideClick);
                window.addEventListener('keyup', this.onPickerkeypress);
            });
        }
    }

    onChange(e) {
        this.setState({
            value: e.target.value
        });
    }

    isAnOutsideClick(e) {
        const shouldClose = !this._picker || !this._picker._picker.contains(e.target);

        if (shouldClose) {
            return this.closePicker();
        }
        e.preventDefault();
        return false;
    }

    onPickerkeypress(e) {
        e.preventDefault();
        if (e.keyCode === 27 || e.which === 27 || e.key === 'Escape' || e.code === 'Escape') {
            this.closePicker();
        }
    }

    closePicker() {
        this.setState({
            pickerOpen: false
        });
        window.removeEventListener('click', this.isAnOutsideClick);
        window.removeEventListener('keyup', this.onPickerkeypress);
    }

    onTriggerClick(e) {
        if (!e.target.classList.contains('picker-trigger')) {
            return;
        }

        this.setState({
            pickerOpen: !this.state.pickerOpen
        });

    }

    onEmojiClick(code, emoji) {
        const value = this.state.value,
            selection = this._ta.selectionStart,
            shortcode = `:${emoji.name}:`,
            v1 = value.slice(0, selection),
            v2 = value.slice(selection);


        this.setState({
            value: `${v1}${shortcode}${v2}`
        }, () => {
            this._ta.selectionStart = selection + shortcode.length;
        });

        if (this.props.autoClose) {
            this.closePicker();
        }
    }

    render() {
        const curr = this.state.value.length,
            pickerOpen = this.state.pickerOpen,
            htmlValue = {__html: this.emojiConvertor.replace_colons(this.state.value).replace(/\n/gi, '<br>')};

        return (
            <div className="emoji-textarea">
                <div className="content-preview">
                    <span dangerouslySetInnerHTML={htmlValue}/>
                </div>
                <div className="textarea-wrapper">
                    <textarea ref={(_ta) => this._ta = _ta} name="emoji-ta" id="emoji-ta" cols="30" rows="10" onChange={this.onChange} value={this.state.value}/>
                    <footer>
                        <CharCount curr={curr} max={1500}/>
                        <SmileyFace onClick={this.onTriggerClick}/>
                        {pickerOpen && <EmojiPicker width={310} height={260} onEmojiClick={this.onEmojiClick} ref={(picker) => this._picker = picker}/>}
                    </footer>
                </div>
            </div>
        );
    }
}

EmojiTextarea.propTypes = {
    value: PropTypes.string,
    pickerOpen: PropTypes.bool,
    autoClose: PropTypes.bool
};

export default EmojiTextarea;