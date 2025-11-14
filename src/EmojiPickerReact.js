"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var stylesheet_1 = require("./Stylesheet/stylesheet");
var Reactions_1 = require("./components/Reactions/Reactions");
var Body_1 = require("./components/body/Body");
var ElementRefContext_1 = require("./components/context/ElementRefContext");
var PickerConfigContext_1 = require("./components/context/PickerConfigContext");
var PickerContext_1 = require("./components/context/PickerContext");
var Preview_1 = require("./components/footer/Preview");
var Header_1 = require("./components/header/Header");
var PickerMain_1 = require("./components/main/PickerMain");
var compareConfig_1 = require("./config/compareConfig");
var useConfig_1 = require("./config/useConfig");
function EmojiPicker(props) {
    return (React.createElement(ElementRefContext_1.ElementRefContextProvider, null,
        React.createElement(stylesheet_1.PickerStyleTag, null),
        React.createElement(PickerConfigContext_1.PickerConfigProvider, __assign({}, props),
            React.createElement(ContentControl, null))));
}
function ContentControl() {
    var reactionsDefaultOpen = PickerContext_1.useReactionsModeState()[0];
    var allowExpandReactions = useConfig_1.useAllowExpandReactions();
    var _a = React.useState(!reactionsDefaultOpen), renderAll = _a[0], setRenderAll = _a[1];
    var isOpen = useConfig_1.useOpenConfig();
    React.useEffect(function () {
        if (reactionsDefaultOpen && !allowExpandReactions) {
            return;
        }
        if (!renderAll) {
            setRenderAll(true);
        }
    }, [renderAll, allowExpandReactions, reactionsDefaultOpen]);
    if (!isOpen) {
        return null;
    }
    return (React.createElement(PickerMain_1.default, null,
        React.createElement(Reactions_1.Reactions, null),
        React.createElement(ExpandedPickerContent, { renderAll: renderAll })));
}
function ExpandedPickerContent(_a) {
    var renderAll = _a.renderAll;
    if (!renderAll) {
        return null;
    }
    return (React.createElement(React.Fragment, null,
        React.createElement(Header_1.Header, null),
        React.createElement(Body_1.Body, null),
        React.createElement(Preview_1.Preview, null)));
}
exports.default = React.memo(EmojiPicker, compareConfig_1.compareConfig);
//# sourceMappingURL=EmojiPickerReact.js.map