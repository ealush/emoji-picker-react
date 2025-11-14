"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emojiStyles = void 0;
var classNames_1 = require("../../DomUtils/classNames");
var stylesheet_1 = require("../../Stylesheet/stylesheet");
exports.emojiStyles = stylesheet_1.stylesheet.create({
    external: {
        '.': classNames_1.ClassNames.external,
        fontSize: '0'
    },
    common: {
        alignSelf: 'center',
        justifySelf: 'center',
        display: 'block'
    }
});
//# sourceMappingURL=emojiStyles.js.map