"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreviewBody = exports.Preview = void 0;
var flairup_1 = require("flairup");
var React = require("react");
var react_1 = require("react");
var stylesheet_1 = require("../../Stylesheet/stylesheet");
var useConfig_1 = require("../../config/useConfig");
var emojiSelectors_1 = require("../../dataUtils/emojiSelectors");
var useEmojiPreviewEvents_1 = require("../../hooks/useEmojiPreviewEvents");
var useShouldShowSkinTonePicker_1 = require("../../hooks/useShouldShowSkinTonePicker");
var Flex_1 = require("../Layout/Flex");
var Space_1 = require("../Layout/Space");
var PickerContext_1 = require("../context/PickerContext");
var ViewOnlyEmoji_1 = require("../emoji/ViewOnlyEmoji");
var SkinTonePicker_1 = require("../header/SkinTonePicker/SkinTonePicker");
function Preview() {
    var previewConfig = useConfig_1.usePreviewConfig();
    var isSkinToneInPreview = useShouldShowSkinTonePicker_1.useIsSkinToneInPreview();
    var reactionsOpen = PickerContext_1.useReactionsModeState()[0];
    if (!previewConfig.showPreview) {
        return null;
    }
    return (React.createElement(Flex_1.default, { className: flairup_1.cx(styles.preview, stylesheet_1.commonInteractionStyles.hiddenOnReactions, reactionsOpen && styles.hideOnReactions) },
        React.createElement(PreviewBody, null),
        React.createElement(Space_1.default, null),
        isSkinToneInPreview ? React.createElement(SkinTonePicker_1.SkinTonePickerMenu, null) : null));
}
exports.Preview = Preview;
function PreviewBody() {
    var _a;
    var previewConfig = useConfig_1.usePreviewConfig();
    var _b = react_1.useState(null), previewEmoji = _b[0], setPreviewEmoji = _b[1];
    var emojiStyle = useConfig_1.useEmojiStyleConfig();
    var variationPickerEmoji = PickerContext_1.useEmojiVariationPickerState()[0];
    var getEmojiUrl = useConfig_1.useGetEmojiUrlConfig();
    useEmojiPreviewEvents_1.useEmojiPreviewEvents(previewConfig.showPreview, setPreviewEmoji);
    var emoji = emojiSelectors_1.emojiByUnified((_a = previewEmoji === null || previewEmoji === void 0 ? void 0 : previewEmoji.unified) !== null && _a !== void 0 ? _a : previewEmoji === null || previewEmoji === void 0 ? void 0 : previewEmoji.originalUnified);
    var show = emoji != null && previewEmoji != null;
    return React.createElement(PreviewContent, null);
    function PreviewContent() {
        var defaultEmoji = variationPickerEmoji !== null && variationPickerEmoji !== void 0 ? variationPickerEmoji : emojiSelectors_1.emojiByUnified(previewConfig.defaultEmoji);
        if (!defaultEmoji) {
            return null;
        }
        var defaultText = variationPickerEmoji
            ? emojiSelectors_1.emojiName(variationPickerEmoji)
            : previewConfig.defaultCaption;
        return (React.createElement(React.Fragment, null,
            React.createElement("div", null, show ? (React.createElement(ViewOnlyEmoji_1.ViewOnlyEmoji, { unified: previewEmoji === null || previewEmoji === void 0 ? void 0 : previewEmoji.unified, emoji: emoji, emojiStyle: emojiStyle, size: 45, getEmojiUrl: getEmojiUrl, className: flairup_1.cx(styles.emoji) })) : defaultEmoji ? (React.createElement(ViewOnlyEmoji_1.ViewOnlyEmoji, { unified: emojiSelectors_1.emojiUnified(defaultEmoji), emoji: defaultEmoji, emojiStyle: emojiStyle, size: 45, getEmojiUrl: getEmojiUrl, className: flairup_1.cx(styles.emoji) })) : null),
            React.createElement("div", { className: flairup_1.cx(styles.label) },
                ":",
                show ? emojiSelectors_1.emojiName(emoji) : defaultText,
                ":")));
    }
}
exports.PreviewBody = PreviewBody;
var styles = stylesheet_1.stylesheet.create({
    preview: {
        alignItems: 'center',
        borderTop: '1px solid var(--epr-preview-border-color)',
        height: 'var(--epr-preview-height)',
        padding: '0 var(--epr-horizontal-padding)',
        position: 'relative',
        zIndex: 'var(--epr-preview-z-index)'
    },
    label: {
        color: 'var(--epr-preview-text-color)',
        fontFamily: 'monospace',
        fontSize: 'var(--epr-preview-text-size)',
        padding: 'var(--epr-preview-text-padding)',
    },
    emoji: {
        padding: '0'
    },
    hideOnReactions: {
        opacity: '0',
        transition: 'opacity 0.5s ease-in-out'
    }
});
//# sourceMappingURL=Preview.js.map