// `emoji-picker-react/locales`: pick the bundled dataset that matches a
// locale (by default the browser's), loaded on demand.
//
// Each dataset is a separate dynamic import of the package's own
// `data/emojis-*` subpath, kept external at build time, so a bundler
// emits one chunk per locale and an application downloads only the one
// it picks. The datasets also translate the interface (`labels`), so the
// whole picker follows the locale.
import type { EmojiDataLoader } from './hooks/useResolvedEmojiData';

/** A bundled dataset's locale, e.g. `'es'`, `'zh-hant'`. */
export type EmojiDataLocale =
  | 'bn'
  | 'da'
  | 'de'
  | 'en'
  | 'en-gb'
  | 'es'
  | 'es-mx'
  | 'et'
  | 'fi'
  | 'fr'
  | 'hi'
  | 'hu'
  | 'it'
  | 'ja'
  | 'ko'
  | 'lt'
  | 'ms'
  | 'nb'
  | 'nl'
  | 'pl'
  | 'pt'
  | 'ru'
  | 'sv'
  | 'th'
  | 'uk'
  | 'vi'
  | 'zh'
  | 'zh-hant';

// Explicitly typed, so the published declarations never reference the
// datasets themselves.
const loaders: Record<EmojiDataLocale, EmojiDataLoader> = {
  bn: () => import('emoji-picker-react/data/emojis-bn'),
  da: () => import('emoji-picker-react/data/emojis-da'),
  de: () => import('emoji-picker-react/data/emojis-de'),
  en: () => import('emoji-picker-react/data/emojis-en'),
  'en-gb': () => import('emoji-picker-react/data/emojis-en-gb'),
  es: () => import('emoji-picker-react/data/emojis-es'),
  'es-mx': () => import('emoji-picker-react/data/emojis-es-mx'),
  et: () => import('emoji-picker-react/data/emojis-et'),
  fi: () => import('emoji-picker-react/data/emojis-fi'),
  fr: () => import('emoji-picker-react/data/emojis-fr'),
  hi: () => import('emoji-picker-react/data/emojis-hi'),
  hu: () => import('emoji-picker-react/data/emojis-hu'),
  it: () => import('emoji-picker-react/data/emojis-it'),
  ja: () => import('emoji-picker-react/data/emojis-ja'),
  ko: () => import('emoji-picker-react/data/emojis-ko'),
  lt: () => import('emoji-picker-react/data/emojis-lt'),
  ms: () => import('emoji-picker-react/data/emojis-ms'),
  nb: () => import('emoji-picker-react/data/emojis-nb'),
  nl: () => import('emoji-picker-react/data/emojis-nl'),
  pl: () => import('emoji-picker-react/data/emojis-pl'),
  pt: () => import('emoji-picker-react/data/emojis-pt'),
  ru: () => import('emoji-picker-react/data/emojis-ru'),
  sv: () => import('emoji-picker-react/data/emojis-sv'),
  th: () => import('emoji-picker-react/data/emojis-th'),
  uk: () => import('emoji-picker-react/data/emojis-uk'),
  vi: () => import('emoji-picker-react/data/emojis-vi'),
  zh: () => import('emoji-picker-react/data/emojis-zh'),
  'zh-hant': () => import('emoji-picker-react/data/emojis-zh-hant'),
};

/** Every locale a bundled dataset covers. */
export const EMOJI_DATA_LOCALES = Object.keys(loaders) as EmojiDataLocale[];

function isEmojiDataLocale(value: string): value is EmojiDataLocale {
  return Object.prototype.hasOwnProperty.call(loaders, value);
}

// Tags whose dataset is not found by exact match or by language alone.
function alias(tag: string, language: string): EmojiDataLocale | undefined {
  if (language === 'zh') {
    return /-(hant|tw|hk|mo)(-|$)/.test(tag) ? 'zh-hant' : 'zh';
  }
  if (language === 'no' || language === 'nn') return 'nb';
  if (language === 'es' && /-(419|us)(-|$)/.test(tag)) return 'es-mx';
  return undefined;
}

function browserLocales(): readonly string[] {
  if (typeof navigator === 'undefined') return [];
  return navigator.languages?.length
    ? navigator.languages
    : navigator.language
      ? [navigator.language]
      : [];
}

/**
 * The bundled dataset for the first matching locale, in preference
 * order: exact tag (`es-MX`), a known alias (`zh-TW` → `zh-hant`,
 * `no` → `nb`), then the language alone (`fr-CA` → `fr`). English when
 * nothing matches. Omitted: the browser's languages.
 */
export function matchEmojiDataLocale(
  locales: string | readonly string[] = browserLocales(),
): EmojiDataLocale {
  for (const raw of typeof locales === 'string' ? [locales] : locales) {
    const tag = String(raw).trim().toLowerCase().replace(/_/g, '-');
    const language = tag.split('-')[0];
    const match = isEmojiDataLocale(tag)
      ? tag
      : (alias(tag, language) ??
        (isEmojiDataLocale(language) ? language : undefined));
    if (match) return match;
  }
  return 'en';
}

/**
 * An `emojiData` loader for the matching bundled dataset (see
 * `matchEmojiDataLocale`). The loader for a dataset is always the same
 * function, so calling this during render does not reload the picker.
 *
 * ```tsx
 * <EmojiPicker emojiData={emojiDataForLocale()} />
 * <EmojiPicker emojiData={emojiDataForLocale(user.locale)} />
 * ```
 */
export function emojiDataForLocale(
  locales?: string | readonly string[],
): EmojiDataLoader {
  return loaders[matchEmojiDataLocale(locales)];
}
