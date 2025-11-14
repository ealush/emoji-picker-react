"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePickerConfig = exports.useSetConfig = exports.PickerConfigProvider = void 0;
var React = require("react");
var compareConfig_1 = require("../../config/compareConfig");
var config_1 = require("../../config/config");
var ConfigContext = React.createContext(config_1.basePickerConfig());
function PickerConfigProvider(_a) {
    var children = _a.children, config = __rest(_a, ["children"]);
    var mergedConfig = useSetConfig(config);
    return (React.createElement(ConfigContext.Provider, { value: mergedConfig }, children));
}
exports.PickerConfigProvider = PickerConfigProvider;
function useSetConfig(config) {
    var _a;
    var _b = React.useState(function () {
        return config_1.mergeConfig(config);
    }), mergedConfig = _b[0], setMergedConfig = _b[1];
    React.useEffect(function () {
        if (compareConfig_1.compareConfig(mergedConfig, config)) {
            return;
        }
        setMergedConfig(config_1.mergeConfig(config));
    }, [
        (_a = config.customEmojis) === null || _a === void 0 ? void 0 : _a.length,
        config.open,
        config.emojiVersion,
        config.reactionsDefaultOpen,
        config.searchPlaceHolder,
        config.searchPlaceholder,
        config.defaultSkinTone,
        config.skinTonesDisabled,
        config.autoFocusSearch,
        config.emojiStyle,
        config.theme,
        config.suggestedEmojisMode,
        config.lazyLoadEmojis,
        config.className,
        config.height,
        config.width,
        config.searchDisabled,
        config.skinTonePickerLocation,
        config.allowExpandReactions,
        config.filterString,
    ]);
    return mergedConfig;
}
exports.useSetConfig = useSetConfig;
function usePickerConfig() {
    return React.useContext(ConfigContext);
}
exports.usePickerConfig = usePickerConfig;
//# sourceMappingURL=PickerConfigContext.js.map