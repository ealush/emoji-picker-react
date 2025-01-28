import { EmojiStyle } from '../types/public';

const CDN: Partial<Record<EmojiStyle, string>> = {
  apple: 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/',
  facebook:
    'https://cdn.jsdelivr.net/npm/emoji-datasource-facebook/img/facebook/64/',
  twitter:
    'https://cdn.jsdelivr.net/npm/emoji-datasource-twitter/img/twitter/64/',
  google: 'https://cdn.jsdelivr.net/npm/emoji-datasource-google/img/google/64/'
};

export const cdnUrl = (emojiStyle: EmojiStyle): string =>
  CDN[emojiStyle]! ?? CDN.apple;
