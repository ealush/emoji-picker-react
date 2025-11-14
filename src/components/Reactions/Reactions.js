"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reactions = void 0;
var flairup_1 = require("flairup");
var React = require("react");
var stylesheet_1 = require("../../Stylesheet/stylesheet");
var useConfig_1 = require("../../config/useConfig");
var emojiSelectors_1 = require("../../dataUtils/emojiSelectors");
var useMouseDownHandlers_1 = require("../../hooks/useMouseDownHandlers");
var ElementRefContext_1 = require("../context/ElementRefContext");
var PickerContext_1 = require("../context/PickerContext");
var Emoji_1 = require("../emoji/Emoji");
var BtnPlus_1 = require("./BtnPlus");
function Reactions() {
    var reactionsOpen = PickerContext_1.useReactionsModeState()[0];
    var ReactionsRef = ElementRefContext_1.useReactionsRef();
    var reactions = useConfig_1.useReactionsConfig();
    useMouseDownHandlers_1.useMouseDownHandlers(ReactionsRef, useConfig_1.MOUSE_EVENT_SOURCE.REACTIONS);
    var emojiStyle = useConfig_1.useEmojiStyleConfig();
    var allowExpandReactions = useConfig_1.useAllowExpandReactions();
    var getEmojiUrl = useConfig_1.useGetEmojiUrlConfig();
    if (!reactionsOpen) {
        return null;
    }
    return (React.createElement("ul", { className: flairup_1.cx(styles.list, !reactionsOpen && stylesheet_1.commonStyles.hidden), ref: ReactionsRef },
        reactions.map(function (reaction) { return (React.createElement("li", { key: reaction },
            React.createElement(Emoji_1.ClickableEmoji, { emoji: emojiSelectors_1.emojiByUnified(reaction), emojiStyle: emojiStyle, unified: reaction, showVariations: false, className: flairup_1.cx(styles.emojiButton), noBackground: true, getEmojiUrl: getEmojiUrl }))); }),
        allowExpandReactions ? (React.createElement("li", null,
            React.createElement(BtnPlus_1.BtnPlus, null))) : null));
}
exports.Reactions = Reactions;
var styles = stylesheet_1.stylesheet.create({
    list: {
        listStyle: 'none',
        margin: '0',
        padding: '0 5px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%'
    },
    emojiButton: {
        ':hover': {
            transform: 'scale(1.2)'
        },
        ':focus': {
            transform: 'scale(1.2)'
        },
        ':active': {
            transform: 'scale(1.1)'
        },
        transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.5)'
    }
});
//# sourceMappingURL=Reactions.js.map