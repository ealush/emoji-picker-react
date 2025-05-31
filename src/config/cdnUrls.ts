import { EmojiStyle } from '../types/exposedTypes';

// Local paths mirroring the CDN structure
//const LOCAL_URL_APPLE = '/emoji-datasource-apple/img/apple/64/';
//const LOCAL_URL_FACEBOOK = '/emoji-datasource-facebook/img/facebook/64/';
//const LOCAL_URL_TWITTER = '/emoji-datasource-twitter/img/twitter/64/';
//const LOCAL_URL_GOOGLE = '/emoji-datasource-google/img/google/64/';

// Local paths mirroring the CDN structure
const LOCAL_URL_APPLE = '/emoji/apple-emoji/64/';
const LOCAL_URL_FACEBOOK = '/emoji/facebook-emoji/64/';
const LOCAL_URL_TWITTER = '/emoji/twitter-emoji/64/';
const LOCAL_URL_GOOGLE = '/emoji/google-emoji/64/';

export function cdnUrl(emojiStyle: EmojiStyle): string {
  switch (emojiStyle) {
    case EmojiStyle.TWITTER:
      return LOCAL_URL_TWITTER;
    case EmojiStyle.GOOGLE:
      return LOCAL_URL_GOOGLE;
    case EmojiStyle.FACEBOOK:
      return LOCAL_URL_FACEBOOK;
    case EmojiStyle.APPLE:
    default:
      return LOCAL_URL_TWITTER;
  }
}

//import { EmojiStyle } from '../types/exposedTypes';

/*
const CDN_URL_APPLE =
  'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/';
const CDN_URL_FACEBOOK =
  'https://cdn.jsdelivr.net/npm/emoji-datasource-facebook/img/facebook/64/';
const CDN_URL_TWITTER =
  'https://cdn.jsdelivr.net/npm/emoji-datasource-twitter/img/twitter/64/';
const CDN_URL_GOOGLE =
  'https://cdn.jsdelivr.net/npm/emoji-datasource-google/img/google/64/';

export function cdnUrl(emojiStyle: EmojiStyle): string {
  switch (emojiStyle) {
    case EmojiStyle.TWITTER:
      return CDN_URL_TWITTER;
    case EmojiStyle.GOOGLE:
      return CDN_URL_GOOGLE;
    case EmojiStyle.FACEBOOK:
      return CDN_URL_FACEBOOK;
    case EmojiStyle.APPLE:
    default:
      return CDN_URL_APPLE;
  }
}
*/

//const LOCAL_URL = '/twitter-emoji/64/';

//export function cdnUrl(emojiStyle: EmojiStyle): string {
  //return LOCAL_URL; // Always use local path
//}

//export function cdnUrl(): string {
  //return LOCAL_URL;
//}
