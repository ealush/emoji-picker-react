import { EmojiStyle } from "../types/exposedTypes";

import ConfigSingleton from "./configSingleton";

const CDN_PATH_APPLE =
  '/npm/emoji-datasource-apple/img/apple/64/';
const CDN_PATH_FACEBOOK =
  '/npm/emoji-datasource-facebook/img/facebook/64/';
const CDN_PATH_TWITTER =
  '/npm/emoji-datasource-twitter/img/twitter/64/';
const CDN_PATH_GOOGLE =
  '/npm/emoji-datasource-google/img/google/64/';

export function cdnUrl(emojiStyle: EmojiStyle): string {
  const CDN_HOST = ConfigSingleton.cdnHost();
  switch (emojiStyle) {
    case EmojiStyle.TWITTER:
      return CDN_HOST + CDN_PATH_TWITTER;
    case EmojiStyle.GOOGLE:
      return CDN_HOST +CDN_PATH_GOOGLE;
    case EmojiStyle.FACEBOOK:
      return CDN_HOST +CDN_PATH_FACEBOOK;
    case EmojiStyle.APPLE:
    default:
      return CDN_HOST +CDN_PATH_APPLE;
  }
}
