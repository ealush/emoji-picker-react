(window.webpackJsonp = window.webpackJsonp || []).push([
  [0],
  {
    272: function (module, exports, __webpack_require__) {
      __webpack_require__(273),
        __webpack_require__(445),
        (module.exports = __webpack_require__(446));
    },
    347: function (module, exports) {},
    446: function (module, __webpack_exports__, __webpack_require__) {
      'use strict';
      __webpack_require__.r(__webpack_exports__),
        function (module) {
          __webpack_require__(35),
            __webpack_require__(20),
            __webpack_require__(36),
            __webpack_require__(27),
            __webpack_require__(37);
          var _storybook_react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(
              271
            ),
            req = __webpack_require__(640);
          Object(_storybook_react__WEBPACK_IMPORTED_MODULE_5__.configure)(
            function loadStories() {
              req.keys().forEach(function (filename) {
                return req(filename);
              });
            },
            module
          );
        }.call(this, __webpack_require__(447)(module));
    },
    640: function (module, exports, __webpack_require__) {
      var map = { './index.stories.js': 641 };
      function webpackContext(req) {
        var id = webpackContextResolve(req);
        return __webpack_require__(id);
      }
      function webpackContextResolve(req) {
        if (!__webpack_require__.o(map, req)) {
          var e = new Error("Cannot find module '" + req + "'");
          throw ((e.code = 'MODULE_NOT_FOUND'), e);
        }
        return map[req];
      }
      (webpackContext.keys = function webpackContextKeys() {
        return Object.keys(map);
      }),
        (webpackContext.resolve = webpackContextResolve),
        (module.exports = webpackContext),
        (webpackContext.id = 640);
    },
    641: function (module, exports) {
      throw new Error(
        "Module build failed (from ./node_modules/babel-loader/lib/index.js):\nSyntaxError: C:\\git\\emoji-picker-react\\stories\\index.stories.js: Identifier 'storiesOf' has already been declared. (4:9)\n\n[0m [90m 2 |[39m [36mimport[39m [33mReact[39m[33m,[39m { useState } [36mfrom[39m [32m'react'[39m[33m;[39m[0m\n[0m [90m 3 |[39m[0m\n[0m[31m[1m>[22m[39m[90m 4 |[39m [36mimport[39m { storiesOf } [36mfrom[39m [32m'@storybook/react'[39m[33m;[39m[0m\n[0m [90m   |[39m          [31m[1m^[22m[39m[0m\n[0m [90m 5 |[39m [36mimport[39m [33mEmojiPicker[39m[33m,[39m { [33mSKIN_TONE_MEDIUM_DARK[39m } [36mfrom[39m [32m'../src'[39m[33m;[39m[0m\n[0m [90m 6 |[39m[0m\n[0m [90m 7 |[39m [36mconst[39m [33mCDN_URL[39m [33m=[39m[0m\n    at Object._raise (C:\\git\\emoji-picker-react\\node_modules\\@babel\\parser\\lib\\index.js:541:17)\n    at Object.raiseWithData (C:\\git\\emoji-picker-react\\node_modules\\@babel\\parser\\lib\\index.js:534:17)\n    at Object.raise (C:\\git\\emoji-picker-react\\node_modules\\@babel\\parser\\lib\\index.js:495:17)\n    at FlowScopeHandler.checkRedeclarationInScope (C:\\git\\emoji-picker-react\\node_modules\\@babel\\parser\\lib\\index.js:1688:12)\n    at FlowScopeHandler.declareName (C:\\git\\emoji-picker-react\\node_modules\\@babel\\parser\\lib\\index.js:1654:12)\n    at FlowScopeHandler.declareName (C:\\git\\emoji-picker-react\\node_modules\\@babel\\parser\\lib\\index.js:1770:11)\n    at Object.checkLVal (C:\\git\\emoji-picker-react\\node_modules\\@babel\\parser\\lib\\index.js:11086:24)\n    at Object.checkLVal (C:\\git\\emoji-picker-react\\node_modules\\@babel\\parser\\lib\\index.js:5710:20)\n    at Object.parseImportSpecifier (C:\\git\\emoji-picker-react\\node_modules\\@babel\\parser\\lib\\index.js:5990:10)\n    at Object.parseNamedImportSpecifiers (C:\\git\\emoji-picker-react\\node_modules\\@babel\\parser\\lib\\index.js:14983:36)\n    at Object.parseImport (C:\\git\\emoji-picker-react\\node_modules\\@babel\\parser\\lib\\index.js:14814:39)\n    at Object.parseStatementContent (C:\\git\\emoji-picker-react\\node_modules\\@babel\\parser\\lib\\index.js:13454:27)\n    at Object.parseStatement (C:\\git\\emoji-picker-react\\node_modules\\@babel\\parser\\lib\\index.js:13352:17)\n    at Object.parseStatement (C:\\git\\emoji-picker-react\\node_modules\\@babel\\parser\\lib\\index.js:5307:24)\n    at Object.parseBlockOrModuleBlockBody (C:\\git\\emoji-picker-react\\node_modules\\@babel\\parser\\lib\\index.js:13941:25)\n    at Object.parseBlockBody (C:\\git\\emoji-picker-react\\node_modules\\@babel\\parser\\lib\\index.js:13932:10)"
      );
    },
  },
  [[272, 1, 2]],
]);
//# sourceMappingURL=main.82508a6a95f65b90b09d.bundle.js.map
