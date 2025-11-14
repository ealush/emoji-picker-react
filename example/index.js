"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_dom_1 = require("react-dom");
var index_1 = require("../src/index");
var App = function () {
    var _a = React.useState(''), emojis = _a[0], setEmojis = _a[1];
    var _b = React.useState(''), filterString = _b[0], setFilterString = _b[1];
    return (React.createElement("div", null,
        React.createElement("h2", null,
            "Emojis: ",
            emojis),
        React.createElement("input", { type: "text", value: filterString, onChange: function (e) { return setFilterString(e.target.value); } }),
        React.createElement(index_1.default, { filterString: filterString, onEmojiClick: function (e) { return setEmojis(emojis + e.emoji); } })));
};
var container = document.getElementById('root');
var root = react_dom_1.createRoot(container);
root.render(React.createElement(App, null));
//# sourceMappingURL=index.js.map