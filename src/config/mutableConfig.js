"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDefineMutableConfig = exports.useMutableConfig = exports.MutableConfigContext = void 0;
var react_1 = require("react");
exports.MutableConfigContext = react_1.default.createContext({});
function useMutableConfig() {
    var mutableConfig = react_1.default.useContext(exports.MutableConfigContext);
    return mutableConfig;
}
exports.useMutableConfig = useMutableConfig;
function useDefineMutableConfig(config) {
    var MutableConfigRef = react_1.default.useRef({
        onEmojiClick: config.onEmojiClick || emptyFunc,
        onReactionClick: config.onReactionClick || config.onEmojiClick,
        onSkinToneChange: config.onSkinToneChange || emptyFunc,
        filterString: config.filterString || ''
    });
    react_1.default.useEffect(function () {
        MutableConfigRef.current.onEmojiClick = config.onEmojiClick || emptyFunc;
        MutableConfigRef.current.onReactionClick =
            config.onReactionClick || config.onEmojiClick;
    }, [config.onEmojiClick, config.onReactionClick]);
    react_1.default.useEffect(function () {
        MutableConfigRef.current.onSkinToneChange =
            config.onSkinToneChange || emptyFunc;
    }, [config.onSkinToneChange]);
    react_1.default.useEffect(function () {
        MutableConfigRef.current.filterString = config.filterString || '';
    }, [config.filterString]);
    return MutableConfigRef;
}
exports.useDefineMutableConfig = useDefineMutableConfig;
function emptyFunc() { }
//# sourceMappingURL=mutableConfig.js.map