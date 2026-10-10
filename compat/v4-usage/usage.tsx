import * as React from 'react';

import EmojiPicker, {
  Categories,
  CategoryConfig,
  CategoryIcons,
  Emoji,
  EmojiClickData,
  EmojiStyle,
  EmojiStyleValue,
  PickerProps,
  Props,
  SkinTonePickerLocation,
  SkinTones,
  SuggestionMode,
  SuggestionModeValue,
  Theme,
  ThemeValue,
  emojiByUnified,
} from 'emoji-picker-react';
import {
  getEmojiByUnified,
  searchEmojis,
} from 'emoji-picker-react/data';
import type {
  EmojiData,
  EmojiDataOptions,
  EmojiInfo,
} from 'emoji-picker-react/data';
import es from 'emoji-picker-react/data/emojis-es';
import esLegacy from 'emoji-picker-react/dist/data/emojis-es';
import * as Primitives from 'emoji-picker-react/primitives';

// Representative v4 consumer usage. This file
// must compile against the packed v5 declarations under both node16 and
// bundler module resolution. It is type-checked by `npm run check:compat`
// after `npm run build`; it never executes.

const categoryIcons: CategoryIcons = {
  [Categories.SMILEYS_PEOPLE]: <span>😄</span>,
};

const categories: Array<Categories | CategoryConfig> = [
  Categories.SMILEYS_PEOPLE,
  { category: Categories.CUSTOM, group: 'team', name: 'Team' },
];

function handleEmojiClick(
  emoji: EmojiClickData,
  _event: MouseEvent,
  api?: { collapseToReactions: () => void },
) {
  const url: string = emoji.getImageUrl(EmojiStyle.TWITTER);
  const unified: string = emoji.unifiedWithoutSkinTone;
  if (url && unified && api) {
    api.collapseToReactions();
  }
}

const classicProps: Props = {
  theme: Theme.DARK,
  emojiStyle: EmojiStyle.APPLE,
  suggestedEmojisMode: SuggestionMode.FREQUENT,
  defaultSkinTone: SkinTones.NEUTRAL,
  skinTonePickerLocation: SkinTonePickerLocation.SEARCH,
  open: true,
  emojiVersion: '14.0',
  lazyLoadEmojis: false,
  autoFocusSearch: true,
  width: 350,
  height: 450,
  style: { borderColor: 'red' },
  className: 'my-picker',
  onEmojiClick: handleEmojiClick,
  onReactionClick: handleEmojiClick,
  onSkinToneChange: () => {},
  searchDisabled: false,
  searchPlaceholder: 'Search',
  searchPlaceHolder: 'Search',
  searchClearButtonLabel: 'Clear',
  categories,
  customEmojis: [{ id: 'party', names: ['party'], imgUrl: 'https://x/y.png' }],
  hiddenEmojis: ['1f600'],
  previewConfig: { showPreview: true },
  getEmojiUrl: (unified: string) => `https://x/${unified}.png`,
  categoryIcons,
  nonce: 'abc',
  reactionsDefaultOpen: false,
  reactions: ['1f600'],
  allowExpandReactions: true,
};

const literalProps: PickerProps = {
  theme: 'dark',
  emojiStyle: 'apple',
  suggestedEmojisMode: 'recent',
};

const themeValue: ThemeValue = 'auto';
const styleValue: EmojiStyleValue = EmojiStyle.GOOGLE;
const modeValue: SuggestionModeValue = SuggestionMode.RECENT;

export function ClassicPicker() {
  return <EmojiPicker {...classicProps} onEmojiClick={handleEmojiClick} />;
}

export function LiteralPicker() {
  return (
    <EmojiPicker theme="light" emojiStyle="twitter" onEmojiClick={handleEmojiClick} />
  );
}

export function V5Additions() {
  const [search, setSearch] = React.useState('');
  return (
    <>
      <EmojiPicker
        searchValue={search}
        defaultSearchValue="party"
        onSearchChange={setSearch}
        searchLabel="Buscar un emoji"
        suggestedEmojis={['1F601', '1f603']}
        onReactionsModeChange={(open) => {
          const _isOpen: boolean = open;
          void _isOpen;
        }}
      />
      <Primitives.Root
        searchValue={search}
        onSearchChange={setSearch}
        id="composed"
      >
        <Primitives.Search
          inputProps={{ 'aria-label': 'Search emojis', name: 'emoji-search' }}
        />
        <Primitives.CategoryNav className="nav" />
        <Primitives.Viewport>
          <Primitives.List />
        </Primitives.Viewport>
        <Primitives.Preview />
      </Primitives.Root>
      <span>
        {themeValue} {styleValue} {modeValue} {literalProps.theme}
      </span>
    </>
  );
}

export function StandaloneEmoji() {
  return (
    <>
      <Emoji unified="1f600" />
      <Emoji
        unified="1f600"
        emojiStyle={EmojiStyle.APPLE}
        size={32}
        lazyLoad
        getEmojiUrl={(unified) => `https://x/${unified}.png`}
      />
      <Emoji unified="1f600" emojiStyle="native" emojiUrl="https://x/1f600.png" />
    </>
  );
}

export function LegacyLookup() {
  const found = emojiByUnified('1f600');
  const names: string[] | undefined = found?.n;
  const addedIn: string | undefined = found?.a;
  return (
    <span>
      {(names ?? []).join(',')} {addedIn}
    </span>
  );
}

export function DataApi({ localeData }: { localeData: EmojiData }) {
  const info: EmojiInfo | undefined = getEmojiByUnified('1F600');
  const unified: string | undefined = info?.unified;
  const options: EmojiDataOptions = { emojiData: localeData };
  const results: readonly EmojiInfo[] = searchEmojis('smile', options);
  const count: number = results.length;
  return (
    <span>
      {unified} {count}
    </span>
  );
}

export function LocaleData() {
  const dataset: EmojiData = es;
  const legacy: EmojiData = esLegacy;
  return <DataApi localeData={dataset.categories ? legacy : dataset} />;
}
