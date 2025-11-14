"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Header = void 0;
var flairup_1 = require("flairup");
var React = require("react");
var stylesheet_1 = require("../../Stylesheet/stylesheet");
var useConfig_1 = require("../../config/useConfig");
var Relative_1 = require("../Layout/Relative");
var CategoryNavigation_1 = require("../navigation/CategoryNavigation");
var Search_1 = require("./Search/Search");
function Header() {
    var showSearch = useConfig_1.useShowSearchConfig();
    return (React.createElement(Relative_1.default, { className: flairup_1.cx('epr-header', stylesheet_1.commonInteractionStyles.hiddenOnReactions) },
        showSearch ? React.createElement(Search_1.SearchContainer, null) : null,
        React.createElement(CategoryNavigation_1.CategoryNavigation, null)));
}
exports.Header = Header;
//# sourceMappingURL=Header.js.map