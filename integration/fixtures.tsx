import * as React from 'react';

import EmojiPicker, {
  Categories,
  EmojiClickData,
  EmojiStyle,
  SkinTones,
  Theme,
} from '../src';
import { EmojiData } from '../src/types/exposedTypes';

/**
 * Shared deterministic dataset for every consumer fixture.
 * Small on purpose: keeps assertions literal and fast, and avoids network
 * fetches. Real apps use the full bundled dataset; the integration boundary
 * (props in, callbacks out, host state updates) is identical.
 */
export const fixtureEmojiData: EmojiData = {
  categories: {
    [Categories.SUGGESTED]: {
      category: Categories.SUGGESTED,
      name: 'Frequently Used',
    },
    [Categories.SMILEYS_PEOPLE]: {
      category: Categories.SMILEYS_PEOPLE,
      name: 'Smileys & People',
    },
    [Categories.ANIMALS_NATURE]: {
      category: Categories.ANIMALS_NATURE,
      name: 'Animals & Nature',
    },
    [Categories.CUSTOM]: {
      category: Categories.CUSTOM,
      name: 'Custom Emojis',
    },
  },
  emojis: {
    [Categories.SUGGESTED]: [],
    [Categories.CUSTOM]: [],
    [Categories.SMILEYS_PEOPLE]: [
      { n: ['face', 'grinning face'], u: '1f600', a: '1' },
      { n: ['face', 'grinning face with big eyes'], u: '1f603', a: '0.6' },
      { n: ['face', 'smiling face with smiling eyes'], u: '1f60a', a: '0.6' },
    ],
    [Categories.ANIMALS_NATURE]: [{ n: ['cat'], u: '1f431', a: '0.6' }],
  },
};

export const baseCategories = [
  Categories.SMILEYS_PEOPLE,
  Categories.ANIMALS_NATURE,
] as Array<Categories>;

/**
 * Deterministic stand-in image for the team custom emoji: a data-URI SVG
 * that always loads with no network. A remote URL that 404s (like the
 * previous example.com placeholder) is *correctly* hidden by the picker
 * via the failed-image tracker -- real browsers fire img error events
 * jsdom never does -- so fixtures must use a loadable image. The
 * integration boundary (custom list, search, isCustom payload) is
 * unaffected by which loadable image is used.
 */
export function deterministicCustomImageUrl(): string {
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72"><rect width="72" height="72" rx="16" fill="#7c5cbf"/><circle cx="26" cy="30" r="9" fill="#fff"/><circle cx="46" cy="30" r="9" fill="#fff"/><circle cx="26" cy="30" r="4" fill="#222"/><circle cx="46" cy="30" r="4" fill="#222"/></svg>`,
    )
  );
}

/** Shared team custom emoji, mirrors the ClassDojo custom-emoji pattern. */
export const teamCustomEmojis = [
  {
    names: ['Panda'],
    imgUrl: deterministicCustomImageUrl(),
    id: 'panda',
  },
];

/**
 * 1. NextChat composer (ChatGPTNextWeb/NextChat).
 * Pattern: chat textarea + toggle button; picker mounts on demand, selected
 * emoji is inserted at the cursor, picker closes on select.
 */
export function NextChatComposer({
  onSelect,
}: {
  onSelect?: (emoji: EmojiClickData) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSelect = (emoji: EmojiClickData) => {
    const el = inputRef.current;
    const cursor = el?.selectionStart ?? value.length;
    setValue(
      (prev) =>
        prev.slice(0, cursor) + emoji.emoji + prev.slice(cursor),
    );
    onSelect?.(emoji);
    setOpen(false);
  };

  return (
    <div data-testid="nextchat-composer">
      <textarea
        data-testid="nextchat-input"
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button data-testid="nextchat-toggle" onClick={() => setOpen((o) => !o)}>
        emoji
      </button>
      {open && (
        <div data-testid="nextchat-popover">
          <EmojiPicker
            emojiData={fixtureEmojiData}
            categories={baseCategories}
            onEmojiClick={handleSelect}
          />
        </div>
      )}
    </div>
  );
}

/**
 * 2. Cherry Studio chat input (CherryHQ/cherry-studio).
 * Pattern: always-mounted picker panel beside the input in this
 * simplified boundary; asserts the callback payload contract.
 */
export function CherryStudioInput({
  onSelect,
}: {
  onSelect?: (emoji: EmojiClickData) => void;
}) {
  const [value, setValue] = React.useState('');
  return (
    <div data-testid="cherry-input">
      <input
        data-testid="cherry-text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <EmojiPicker
        emojiData={fixtureEmojiData}
        categories={baseCategories}
        onEmojiClick={(emoji) => {
          setValue((prev) => prev + emoji.emoji);
          onSelect?.(emoji);
        }}
      />
    </div>
  );
}

/**
 * 3. Wire reactions + autocomplete (wireapp/wire-webapp, pinned 4.16.1).
 * Pattern: compact reactions row first, expandable to the full picker;
 * reaction clicks go through onReactionClick.
 */
export function WireReactions({
  onReaction,
  onEmoji,
}: {
  onReaction?: (emoji: EmojiClickData) => void;
  onEmoji?: (emoji: EmojiClickData) => void;
}) {
  const [reactions, setReactions] = React.useState<string[]>([]);
  return (
    <div data-testid="wire-message">
      <div data-testid="wire-reaction-row">{reactions.join('')}</div>
      <EmojiPicker
        emojiData={fixtureEmojiData}
        categories={baseCategories}
        reactionsDefaultOpen
        onReactionClick={(emoji) => {
          setReactions((prev) => [...prev, emoji.emoji]);
          onReaction?.(emoji);
        }}
        onEmojiClick={(emoji) => onEmoji?.(emoji)}
      />
    </div>
  );
}

/**
 * 4. LangWatch modal with lazy ESM import (langwatch/langwatch).
 * Pattern: deferred import after a prod boot crash on the ESM bundle;
 * picker loads lazily inside a modal dialog.
 */
const LazyPicker = React.lazy(() =>
  Promise.resolve({ default: EmojiPicker }),
);

export function LangWatchModal({
  onSelect,
}: {
  onSelect?: (emoji: EmojiClickData) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');
  return (
    <div data-testid="langwatch">
      <button data-testid="langwatch-open" onClick={() => setOpen(true)}>
        open
      </button>
      {/* Host draft state lives outside the modal, like the real host's
        editor content: closing the dialog must not unmount the result. */}
      <div data-testid="langwatch-result">{value}</div>
      {open && (
        <div role="dialog" aria-label="Emoji" data-testid="langwatch-dialog">
          <React.Suspense fallback={<div>Loading…</div>}>
            <LazyPicker
              emojiData={fixtureEmojiData}
              categories={baseCategories}
              onEmojiClick={(emoji) => {
                setValue((prev) => prev + emoji.emoji);
                onSelect?.(emoji);
                setOpen(false);
              }}
            />
          </React.Suspense>
          <button data-testid="langwatch-close" onClick={() => setOpen(false)}>
            close
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * 5. Botonic webchat composer (@botonic/react).
 * Pattern: themed picker with a custom search placeholder inside the
 * bot composer; picker stays open for repeated picks.
 */
export function BotonicComposer({
  onSelect,
}: {
  onSelect?: (emoji: EmojiClickData) => void;
}) {
  const [messages, setMessages] = React.useState<string[]>([]);
  return (
    <div data-testid="botonic-webchat">
      <div data-testid="botonic-messages">{messages.join(' ')}</div>
      <EmojiPicker
        emojiData={fixtureEmojiData}
        categories={baseCategories}
        theme={Theme.DARK}
        searchPlaceholder="Search emojis"
        onEmojiClick={(emoji) => {
          setMessages((prev) => [...prev, emoji.emoji]);
          onSelect?.(emoji);
        }}
      />
    </div>
  );
}

/**
 * 6. Fileverse design-system re-export (@fileverse/ui).
 * Pattern: the picker is public API of the design system; props pass
 * straight through. Highest breakage leverage: one fix covers dDocs +
 * dSheets, so the test asserts forwarding of theme, placeholder, and
 * callbacks through the wrapper.
 */
export function FileverseEmojiPicker(
  props: React.ComponentProps<typeof EmojiPicker>,
) {
  return (
    <div data-testid="fileverse-ds">
      <EmojiPicker
        emojiData={fixtureEmojiData}
        categories={baseCategories}
        {...props}
      />
    </div>
  );
}

/**
 * 7. json-joy mutxt editor (@jsonjoy.com/ui).
 * Pattern: re-exported picker types (EmojiPicker, EmojiStyle,
 * EmojiClickData) used in the mutxt editor InputChar surface.
 */
export function JsonJoyInputChar({
  onSelect,
}: {
  onSelect?: (emoji: EmojiClickData) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState('');
  return (
    <div data-testid="jsonjoy-editor">
      <div data-testid="jsonjoy-text">{text}</div>
      <button data-testid="jsonjoy-toggle" onClick={() => setOpen((o) => !o)}>
        😀
      </button>
      {open && (
        <EmojiPicker
          emojiData={fixtureEmojiData}
          categories={baseCategories}
          emojiStyle={EmojiStyle.NATIVE}
          onEmojiClick={(emoji: EmojiClickData) => {
            setText((prev) => prev + emoji.emoji);
            onSelect?.(emoji);
          }}
        />
      )}
    </div>
  );
}

/**
 * 8. Medusa legacy admin wrapper (@medusajs/admin-ui).
 * Pattern: frozen legacy v1 admin; themed wrapper in a dropdown with
 * NATIVE style, NEUTRAL default tone, custom placeholder.
 */
export function MedusaNotesPicker({
  onSelect,
}: {
  onSelect?: (emoji: EmojiClickData) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [note, setNote] = React.useState('');
  return (
    <div data-testid="medusa-admin">
      <textarea
        data-testid="medusa-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button data-testid="medusa-toggle" onClick={() => setOpen((o) => !o)}>
        add emoji
      </button>
      {open && (
        <div data-testid="medusa-dropdown">
          <EmojiPicker
            emojiData={fixtureEmojiData}
            categories={baseCategories}
            theme={Theme.LIGHT}
            emojiStyle={EmojiStyle.NATIVE}
            defaultSkinTone={SkinTones.NEUTRAL}
            searchPlaceholder="Search emoji"
            onEmojiClick={(emoji) => {
              setNote((prev) => prev + emoji.emoji);
              onSelect?.(emoji);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * 9. Push Chat migration (app.push.org, pinned 4.9.3).
 * The old `pickerStyle` prop was removed in later v4; the documented
 * migration is `style`. This fixture pins the migrated contract and the
 * test below asserts the legacy prop is inert while `style` applies.
 */
export function PushChatTypebar({
  onSelect,
}: {
  onSelect?: (emoji: EmojiClickData) => void;
}) {
  const [draft, setDraft] = React.useState('');
  return (
    <div data-testid="push-typebar">
      <div data-testid="push-draft">{draft}</div>
      <EmojiPicker
        emojiData={fixtureEmojiData}
        categories={baseCategories}
        style={{ backgroundColor: 'rgb(1, 2, 3)' }}
        onEmojiClick={(emoji) => {
          setDraft((prev) => prev + emoji.emoji);
          onSelect?.(emoji);
        }}
      />
    </div>
  );
}

/**
 * 10. ClassDojo custom emoji + search (company fork, custom emoji list
 * and search-result UI, 2.3M+ GitHub Packages downloads).
 * Pattern: customEmojis list participates in search and selection.
 */
export function ClassDojoPicker({
  onSelect,
}: {
  onSelect?: (emoji: EmojiClickData) => void;
}) {
  const [picked, setPicked] = React.useState('');
  return (
    <div data-testid="classdojo">
      <div data-testid="classdojo-picked">{picked}</div>
      <EmojiPicker
        emojiData={fixtureEmojiData}
        customEmojis={teamCustomEmojis}
        onEmojiClick={(emoji) => {
          setPicked(emoji.isCustom ? `custom:${emoji.names[0]}` : emoji.emoji);
          onSelect?.(emoji);
        }}
      />
    </div>
  );
}

/**
 * 11. Signal sticker-creator sprite sheet (signalapp/Signal-Desktop via
 * @indutny/emoji-picker-react fork; sheetX/sheetY work from PR #323).
 * Pattern: sprite-sheet style with a custom getEmojiUrl; asserts the
 * image-URL contract the sticker creator depends on.
 */
export function SignalStickerPicker({
  onSelect,
  getEmojiUrl = (unified, style) =>
    `https://example.com/sheets/${style}/${unified}.png`,
}: {
  onSelect?: (emoji: EmojiClickData) => void;
  getEmojiUrl?: (unified: string, style: string) => string;
}) {
  return (
    <div data-testid="signal-sticker">
      <EmojiPicker
        emojiData={fixtureEmojiData}
        categories={baseCategories}
        emojiStyle={EmojiStyle.APPLE}
        getEmojiUrl={getEmojiUrl}
        onEmojiClick={(emoji) => onSelect?.(emoji)}
      />
    </div>
  );
}

/**
 * Deterministic offline sprite for visual baselines: a solid-color SVG data
 * URI that loads instantly with no network. The behavioral contract test
 * keeps the production-shaped example.com URL; stories use this.
 */
export function deterministicSpriteUrl(): string {
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72"><rect width="72" height="72" fill="#ffd166"/></svg>`,
    )
  );
}
