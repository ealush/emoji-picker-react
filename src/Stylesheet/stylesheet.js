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
exports.darkMode = exports.commonInteractionStyles = exports.PickerStyleTag = exports.commonStyles = exports.stylesheet = void 0;
var flairup_1 = require("flairup");
var React = require("react");
var classNames_1 = require("../DomUtils/classNames");
exports.stylesheet = flairup_1.createSheet('epr', null);
var hidden = {
    display: 'none',
    opacity: '0',
    pointerEvents: 'none',
    visibility: 'hidden',
    overflow: 'hidden'
};
exports.commonStyles = exports.stylesheet.create({
    hidden: __assign({ '.': classNames_1.ClassNames.hidden }, hidden)
});
exports.PickerStyleTag = React.memo(function PickerStyleTag() {
    return (React.createElement("style", { suppressHydrationWarning: true, dangerouslySetInnerHTML: { __html: exports.stylesheet.getStyle() } }));
});
exports.commonInteractionStyles = exports.stylesheet.create({
    '.epr-main': {
        ':has(input:not(:placeholder-shown))': {
            categoryBtn: {
                ':hover': {
                    opacity: '1',
                    backgroundPositionY: 'var(--epr-category-navigation-button-size)'
                }
            },
            hiddenOnSearch: __assign({ '.': classNames_1.ClassNames.hiddenOnSearch }, hidden)
        },
        ':has(input:placeholder-shown)': {
            visibleOnSearchOnly: hidden
        }
    },
    hiddenOnReactions: {
        transition: 'all 0.5s ease-in-out'
    },
    '.epr-reactions': {
        hiddenOnReactions: {
            height: '0px',
            width: '0px',
            opacity: '0',
            pointerEvents: 'none',
            overflow: 'hidden'
        }
    },
    '.EmojiPickerReact:not(.epr-search-active)': {
        categoryBtn: {
            ':hover': {
                opacity: '1',
                backgroundPositionY: 'var(--epr-category-navigation-button-size)'
            },
            '&.epr-active': {
                opacity: '1',
                backgroundPositionY: 'var(--epr-category-navigation-button-size)'
            }
        },
        visibleOnSearchOnly: __assign({ '.': 'epr-visible-on-search-only' }, hidden)
    }
});
function darkMode(key, value) {
    var _a, _b;
    return {
        '.epr-dark-theme': (_a = {},
            _a[key] = value,
            _a),
        '.epr-auto-theme': (_b = {},
            _b[key] = {
                '@media (prefers-color-scheme: dark)': value
            },
            _b)
    };
}
exports.darkMode = darkMode;
//# sourceMappingURL=stylesheet.js.map