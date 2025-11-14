"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Body = void 0;
var flairup_1 = require("flairup");
var React = require("react");
var classNames_1 = require("../../DomUtils/classNames");
var stylesheet_1 = require("../../Stylesheet/stylesheet");
var useConfig_1 = require("../../config/useConfig");
var useDisallowMouseMove_1 = require("../../hooks/useDisallowMouseMove");
var useMouseDownHandlers_1 = require("../../hooks/useMouseDownHandlers");
var useOnScroll_1 = require("../../hooks/useOnScroll");
var ElementRefContext_1 = require("../context/ElementRefContext");
var EmojiList_1 = require("./EmojiList");
var EmojiVariationPicker_1 = require("./EmojiVariationPicker");
function Body() {
    var BodyRef = ElementRefContext_1.useBodyRef();
    var scrollTop = useOnScroll_1.useOnScroll(BodyRef);
    useMouseDownHandlers_1.useMouseDownHandlers(BodyRef, useConfig_1.MOUSE_EVENT_SOURCE.PICKER);
    useDisallowMouseMove_1.useOnMouseMove();
    return (React.createElement("div", { className: flairup_1.cx(styles.body, stylesheet_1.commonInteractionStyles.hiddenOnReactions), ref: BodyRef },
        React.createElement(EmojiVariationPicker_1.EmojiVariationPicker, null),
        React.createElement(EmojiList_1.EmojiList, { scrollTop: scrollTop })));
}
exports.Body = Body;
var styles = stylesheet_1.stylesheet.create({
    body: {
        '.': classNames_1.ClassNames.scrollBody,
        flex: '1',
        overflowY: 'scroll',
        overflowX: 'hidden',
        position: 'relative'
    }
});
//# sourceMappingURL=Body.js.map