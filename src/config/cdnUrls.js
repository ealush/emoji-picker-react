"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cdnUrl = void 0;
var exposedTypes_1 = require("../types/exposedTypes");
var CDN_URL_APPLE = 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/';
var CDN_URL_FACEBOOK = 'https://cdn.jsdelivr.net/npm/emoji-datasource-facebook/img/facebook/64/';
var CDN_URL_TWITTER = 'https://cdn.jsdelivr.net/npm/emoji-datasource-twitter/img/twitter/64/';
var CDN_URL_GOOGLE = 'https://cdn.jsdelivr.net/npm/emoji-datasource-google/img/google/64/';
function cdnUrl(emojiStyle) {
    switch (emojiStyle) {
        case exposedTypes_1.EmojiStyle.TWITTER:
            return CDN_URL_TWITTER;
        case exposedTypes_1.EmojiStyle.GOOGLE:
            return CDN_URL_GOOGLE;
        case exposedTypes_1.EmojiStyle.FACEBOOK:
            return CDN_URL_FACEBOOK;
        case exposedTypes_1.EmojiStyle.APPLE:
        default:
            return CDN_URL_APPLE;
    }
}
exports.cdnUrl = cdnUrl;
//# sourceMappingURL=cdnUrls.js.map