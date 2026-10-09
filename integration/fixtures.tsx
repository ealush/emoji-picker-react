import * as React from 'react';

import EmojiPicker, {
  Categories,
  Emoji,
  EmojiClickData,
  EmojiStyle,
  SkinTonePickerLocation,
  SkinTones,
  SuggestionMode,
  Theme,
} from '../src';
import { EmojiData } from '../src/types/exposedTypes';

/**
 * Real-consumer fixtures. Each one reproduces the consumer's actual
 * integration code: the props, callback handling and open/close behavior
 * are copied from the upstream file named in its doc comment (read
 * 2026-10-04). Only these substitutions are made, and each is listed:
 *
 * - a small deterministic dataset instead of the full bundle (passed as
 *   `emojiData`), unless the consumer itself passes a dataset;
 * - host chrome (popover, dialog, dropdown) reduced to plain elements when
 *   the host library is not installed here;
 * - remote image URLs keep their real shape; tests intercept them.
 */

/**
 * Shared deterministic dataset. Small on purpose: keeps assertions literal
 * and fast. Includes the emojis consumers actually reference (Cherry's
 * stored recents 🧠 📁, Wire's default reactions).
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
    [Categories.OBJECTS]: {
      category: Categories.OBJECTS,
      name: 'Objects',
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
      {
        n: ['thumbsup', 'thumbs up sign'],
        u: '1f44d',
        v: ['1f44d-1f3fb', '1f44d-1f3fd', '1f44d-1f3ff'],
        a: '0.6',
      },
      { n: ['brain'], u: '1f9e0', a: '5' },
      { n: ['heart', 'red heart'], u: '2764-fe0f', a: '0.6' },
    ],
    [Categories.ANIMALS_NATURE]: [{ n: ['cat', 'cat face'], u: '1f431', a: '0.6' }],
    [Categories.OBJECTS]: [{ n: ['file folder'], u: '1f4c1', a: '0.6' }],
  },
};

export const baseCategories = [
  Categories.SMILEYS_PEOPLE,
  Categories.ANIMALS_NATURE,
  Categories.OBJECTS,
] as Array<Categories>;

/**
 * Deterministic stand-in image for custom emojis: a data-URI SVG that
 * always loads. A remote URL that 404s is correctly hidden by the picker's
 * failed-image tracker in real browsers (jsdom never fires the error).
 */
export function deterministicCustomImageUrl(): string {
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72"><rect width="72" height="72" rx="16" fill="#7c5cbf"/><circle cx="26" cy="30" r="9" fill="#fff"/><circle cx="46" cy="30" r="9" fill="#fff"/><circle cx="26" cy="30" r="4" fill="#222"/><circle cx="46" cy="30" r="4" fill="#222"/></svg>`,
    )
  );
}

/** Shared team custom emoji (ClassDojo fork pattern). */
export const teamCustomEmojis = [
  {
    names: ['Panda'],
    imgUrl: deterministicCustomImageUrl(),
    id: 'panda',
  },
];

// ---------------------------------------------------------------------------
// 1. NextChat (ChatGPTNextWeb/NextChat, app/components/emoji.tsx)
// ---------------------------------------------------------------------------

/** Verbatim from NextChat: its own CDN for every image style. */
export function nextChatEmojiUrl(unified: string, style: string) {
  return `https://fastly.jsdelivr.net/npm/emoji-datasource-apple/img/${style}/64/${unified}.png`;
}

/**
 * NextChat's mask/avatar settings: `AvatarPicker` (width 100%,
 * lazyLoadEmojis, theme AUTO, custom getEmojiUrl, stores `e.unified`) in a
 * popover, and `EmojiAvatar` (`<Emoji unified size getEmojiUrl>`) showing
 * the stored avatar. No emojiStyle is passed anywhere: v4 rendered Apple
 * images from NextChat's CDN, and v5 must keep doing so.
 * Substitution: popover reduced to a div; small dataset.
 */
export function NextChatAvatarSettings({
  onAvatar,
  getEmojiUrl = nextChatEmojiUrl,
}: {
  onAvatar?: (unified: string) => void;
  getEmojiUrl?: (unified: string, style: string) => string;
}) {
  const [avatar, setAvatar] = React.useState('1f603');
  const [showPicker, setShowPicker] = React.useState(false);
  return (
    <div data-testid="nextchat-settings">
      <button
        data-testid="nextchat-avatar"
        aria-label="Change avatar"
        onClick={() => setShowPicker((open) => !open)}
      >
        <Emoji unified={avatar} size={18} getEmojiUrl={getEmojiUrl} />
      </button>
      {showPicker && (
        <div data-testid="nextchat-popover" style={{ width: 360 }}>
          <EmojiPicker
            emojiData={fixtureEmojiData}
            width={'100%'}
            lazyLoadEmojis
            theme={Theme.AUTO}
            getEmojiUrl={getEmojiUrl}
            onEmojiClick={(e) => {
              setAvatar(e.unified);
              onAvatar?.(e.unified);
              setShowPicker(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Cherry Studio (CherryHQ/cherry-studio,
//    src/renderer/components/EmojiPicker/EmojiPickerContent.tsx)
// ---------------------------------------------------------------------------

const CHERRY_PICKER_STYLE = {
  '--epr-bg-color': '#ffffff',
  '--epr-picker-border-color': 'transparent',
  '--epr-picker-border-radius': '10px',
  '--epr-highlight-color': '#4f46e5',
  '--epr-hover-bg-color': '#eef2ff',
  '--epr-hover-bg-color-reduced-opacity': '#eef2ff',
} as React.CSSProperties;

/**
 * Cherry's picker: its own dataset (converted from emoji-picker-element-
 * data), categories with translated names, native style, recents kept by
 * the app as the inserted characters and passed as `suggestedEmojis` (the
 * API of Cherry's v4 patch), RECENT mode, no preview, no skin tones, CSS
 * variables through `style`, 100% of a 320x352 popover.
 * Substitutions: small dataset; theme tokens resolved to literal colors;
 * category icons omitted (lucide-react not installed).
 */
export function CherryStudioPicker({
  onInsert,
  initialRecent = ['🧠', '📁'],
  hiddenEmojis = [],
  pickerStyle = CHERRY_PICKER_STYLE,
}: {
  onInsert?: (emoji: string) => void;
  initialRecent?: string[];
  hiddenEmojis?: string[];
  // The gallery can omit the upstream palette's literal light colors.
  pickerStyle?: React.CSSProperties;
}) {
  const [text, setText] = React.useState('');
  const [recent, setRecent] = React.useState(initialRecent);
  const pushRecent = (emoji: string) =>
    setRecent((previous) =>
      [emoji, ...previous.filter((item) => item !== emoji)].slice(0, 24),
    );
  const categories = [
    { category: Categories.SUGGESTED, name: 'Recently used' },
    { category: Categories.SMILEYS_PEOPLE, name: 'Smileys & people' },
    { category: Categories.ANIMALS_NATURE, name: 'Animals & nature' },
    { category: Categories.OBJECTS, name: 'Objects' },
  ];
  return (
    <div data-testid="cherry-input">
      <input
        data-testid="cherry-text"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <div data-testid="cherry-popover" style={{ width: 320, height: 352 }}>
        <EmojiPicker
          autoFocusSearch
          categories={categories}
          className="cherry-emoji-picker-react"
          emojiData={fixtureEmojiData}
          emojiStyle={EmojiStyle.NATIVE}
          height="100%"
          hiddenEmojis={hiddenEmojis}
          previewConfig={{ showPreview: false }}
          searchClearButtonLabel="Clear"
          searchDisabled={false}
          searchPlaceholder="Search emoji"
          skinTonesDisabled
          style={pickerStyle}
          suggestedEmojis={recent}
          suggestedEmojisMode={SuggestionMode.RECENT}
          theme={Theme.AUTO}
          width="100%"
          onEmojiClick={(emoji: EmojiClickData) => {
            pushRecent(emoji.emoji);
            setText((previous) => previous + emoji.emoji);
            onInsert?.(emoji.emoji);
          }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Wire (wireapp/wire-webapp)
// ---------------------------------------------------------------------------

export type WireEmojiPickerSelection = {
  readonly emoji: string;
  readonly activeSkinTone: string;
};

/**
 * Verbatim adapter (components/emojiPicker/emojiPickerAdapter.tsx) used for
 * message reactions: native style, the legacy `searchPlaceHolder` spelling,
 * a caller default skin tone, and `activeSkinTone` read off the payload.
 */
export function WireEmojiPickerAdapter({
  onEmojiClick,
  searchPlaceholder,
  defaultSkinTone,
}: {
  onEmojiClick: (selection: WireEmojiPickerSelection) => void;
  searchPlaceholder: string;
  defaultSkinTone: SkinTones;
}) {
  return (
    <EmojiPicker
      emojiData={fixtureEmojiData}
      emojiStyle={EmojiStyle.NATIVE}
      onEmojiClick={(emojiClickData: EmojiClickData) =>
        onEmojiClick({
          emoji: emojiClickData.emoji,
          activeSkinTone: emojiClickData.activeSkinTone,
        })
      }
      searchPlaceHolder={searchPlaceholder}
      defaultSkinTone={defaultSkinTone}
    />
  );
}

/** Wire's message reaction surface around the adapter. */
export function WireMessageReactions({
  onReaction,
}: {
  onReaction?: (selection: WireEmojiPickerSelection) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [reactions, setReactions] = React.useState<string[]>([]);
  return (
    <div data-testid="wire-message">
      <p>Ship it on Friday?</p>
      <div data-testid="wire-reactions">{reactions.join(' ')}</div>
      <button data-testid="wire-react" onClick={() => setOpen((o) => !o)}>
        react
      </button>
      {open && (
        <WireEmojiPickerAdapter
          searchPlaceholder="Search Emoji"
          defaultSkinTone={SkinTones.MEDIUM}
          onEmojiClick={(selection) => {
            setReactions((previous) => [...previous, selection.emoji]);
            onReaction?.(selection);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

const WIRE_DEFAULT_EMOJI_LIST = ['👍', '🎉', '❤️', '😂', '😮', '👏', '🤔', '😢'];
const WIRE_LS_KEY = 'epr_suggested';

/**
 * Wire's calling reactions bar (calling/VideoControls/EmojisBar.tsx): it
 * reads the picker's own `epr_suggested` localStorage entries to put recent
 * picks first, so the key and `{unified, original, count}` shape are a
 * real contract. Native picker in a dialog; picking sends and closes; a
 * mousedown outside closes. Reproduced verbatim except the translation
 * helper and styles.
 */
export function WireCallReactionsBar({
  onEmojiClick,
}: {
  onEmojiClick?: (emoji: string) => void;
}) {
  const barRef = React.useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [sent, setSent] = React.useState<string[]>([]);
  const send = (emoji: string) => {
    setSent((previous) => [...previous, emoji]);
    onEmojiClick?.(emoji);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const recentEmojis: { unified: string; original: string; count: number }[] =
    JSON.parse(localStorage.getItem(WIRE_LS_KEY) ?? '[]');
  const recentTopEmojis = [...recentEmojis]
    .sort((a, b) => b.count - a.count)
    .map((emoji) => String.fromCodePoint(parseInt(emoji.unified, 16)))
    .concat(WIRE_DEFAULT_EMOJI_LIST)
    .filter((emoji, index, all) => all.indexOf(emoji) === index)
    .slice(0, 8);

  return (
    <div data-testid="wire-call">
      <div data-testid="wire-call-sent">{sent.join(' ')}</div>
      <div ref={barRef}>
        {showEmojiPicker ? (
          <div role="dialog" aria-label="Pick a reaction">
            <EmojiPicker
              emojiData={fixtureEmojiData}
              emojiStyle={EmojiStyle.NATIVE}
              onEmojiClick={(emojiData) => {
                send(emojiData.emoji);
                setShowEmojiPicker(false);
              }}
            />
          </div>
        ) : (
          <div role="toolbar" aria-label="Reactions" data-testid="wire-call-bar">
            {recentTopEmojis.map((emoji) => (
              <button
                key={emoji}
                aria-label={`React with ${emoji}`}
                onClick={() => send(emoji)}
              >
                {emoji}
              </button>
            ))}
            <button
              aria-label="More reactions"
              data-testid="wire-call-more"
              onClick={(event) => {
                event.stopPropagation();
                setShowEmojiPicker((previous) => !previous);
              }}
            >
              …
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. LangWatch (langwatch/langwatch, optimization_studio/.../EmojiPickerModal.tsx)
// ---------------------------------------------------------------------------

// Verbatim: enum values as string casts so no enum is imported eagerly
// (an eager import crashed app boot), and a deferred default import.
const EMOJI_STYLE_NATIVE = 'native' as EmojiStyle;
const SKIN_TONE_PREVIEW = 'PREVIEW' as SkinTonePickerLocation;
const LazyPicker = React.lazy(() =>
  import('../src').then((mod) => ({ default: mod.default })),
);

/**
 * LangWatch's workflow-icon modal: `next/dynamic(() =>
 * import('emoji-picker-react').then(mod => mod.default), { ssr: false })`
 * inside a Chakra modal; picking sets the icon and closes.
 * Substitutions: React.lazy for next/dynamic; Chakra modal reduced to a
 * dialog; small dataset.
 */
export function LangWatchModal({
  onChange,
}: {
  onChange?: (emoji: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [icon, setIcon] = React.useState('');
  return (
    <div data-testid="langwatch">
      <button data-testid="langwatch-open" onClick={() => setOpen(true)}>
        Workflow icon {icon}
      </button>
      <div data-testid="langwatch-result">{icon}</div>
      {open && (
        <div role="dialog" aria-label="Workflow Icon" data-testid="langwatch-dialog">
          <React.Suspense fallback={<div>Loading emoji picker...</div>}>
            <LazyPicker
              emojiData={fixtureEmojiData}
              emojiStyle={EMOJI_STYLE_NATIVE}
              skinTonePickerLocation={SKIN_TONE_PREVIEW}
              onEmojiClick={(emojiData: EmojiClickData) => {
                setIcon(emojiData.emoji);
                onChange?.(emojiData.emoji);
                setOpen(false);
              }}
            />
          </React.Suspense>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. Botonic (hubtype/botonic, botonic-react/src/webchat/input-panel/
//    opened-emoji-picker.tsx)
// ---------------------------------------------------------------------------

/**
 * Botonic's opened picker: full width, 19rem tall, no preview, lazy
 * images, no search autofocus; a click outside closes it
 * (useComponentVisible). Botonic can render the whole webchat in a shadow
 * root, which the visual spec covers.
 */
export function BotonicComposer({
  onEmojiClick,
}: {
  onEmojiClick?: (emoji: EmojiClickData) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.composedPath()[0] as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [open]);
  return (
    <div data-testid="botonic-webchat" style={{ width: 360 }}>
      <div data-testid="botonic-message">{message}</div>
      <button data-testid="botonic-toggle" onClick={() => setOpen(true)}>
        emoji
      </button>
      <div ref={containerRef}>
        {open && (
          <div role="dialog" aria-label="Emoji picker">
            <EmojiPicker
              emojiData={fixtureEmojiData}
              width="100%"
              height="19rem"
              previewConfig={{ showPreview: false }}
              lazyLoadEmojis={true}
              onEmojiClick={(emoji) => {
                setMessage((previous) => previous + emoji.emoji);
                onEmojiClick?.(emoji);
              }}
              autoFocusSearch={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. Fileverse (@fileverse/ui, AvatarSelector; the package bundles the
//    picker into its own dist and re-exports EmojiPicker)
// ---------------------------------------------------------------------------

/**
 * AvatarSelector: tabs for Emoji / Upload, the picker native, 340px tall,
 * no preview, with important-utility classes on the root, passing the full
 * EmojiClickData to `handleEmojiClick`.
 * Substitution: Radix tabs reduced to buttons; Tailwind classes replaced by
 * the equivalent inline style.
 */
export function FileverseAvatarSelector({
  handleEmojiClick,
}: {
  handleEmojiClick?: (emoji: EmojiClickData) => void;
}) {
  const [tab, setTab] = React.useState<'emojiPicker' | 'upload'>('emojiPicker');
  const [avatar, setAvatar] = React.useState('');
  return (
    <div data-testid="fileverse-avatar" style={{ width: 350 }}>
      <div role="tablist" aria-label="Avatar source">
        <button
          role="tab"
          aria-selected={tab === 'emojiPicker'}
          onClick={() => setTab('emojiPicker')}
        >
          Emoji
        </button>
        <button
          role="tab"
          aria-selected={tab === 'upload'}
          onClick={() => setTab('upload')}
        >
          Upload
        </button>
        <span data-testid="fileverse-current">{avatar}</span>
      </div>
      {tab === 'emojiPicker' ? (
        <EmojiPicker
          emojiData={fixtureEmojiData}
          previewConfig={{ showPreview: false }}
          height={340}
          className="fileverse-avatar-picker"
          style={{ border: 'none', borderRadius: 0 }}
          emojiStyle={EmojiStyle.NATIVE}
          onEmojiClick={(emoji) => {
            setAvatar(emoji.emoji);
            handleEmojiClick?.(emoji);
          }}
        />
      ) : (
        <input type="file" aria-label="Upload avatar" />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 7. json-joy (@jsonjoy.com/ui, packages/ui/src/4-card/Fields/components/
//    ArgChar.tsx)
// ---------------------------------------------------------------------------

const stopPointer = (event: React.SyntheticEvent) => event.stopPropagation();

/**
 * ArgChar's popup: theme follows the app's light/dark flag, 400x420, skin
 * tone control in the preview, wrapped in a ClickAway that stops pointer
 * propagation; picking sets the character and closes the popup.
 */
export function JsonJoyInputChar({
  light = true,
  onSelect,
}: {
  light?: boolean;
  onSelect?: (emoji: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [char, setChar] = React.useState('');
  return (
    <div data-testid="jsonjoy-editor">
      <input data-testid="jsonjoy-text" value={char} readOnly aria-label="Character" />
      <button data-testid="jsonjoy-toggle" onClick={() => setOpen((o) => !o)}>
        😀
      </button>
      {open && (
        <div
          data-testid="jsonjoy-popup"
          onMouseDown={stopPointer}
          onMouseUp={stopPointer}
          onClick={stopPointer}
        >
          <EmojiPicker
            emojiData={fixtureEmojiData}
            theme={light ? Theme.LIGHT : Theme.DARK}
            height={420}
            width={400}
            skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
            onEmojiClick={(data: EmojiClickData) => {
              setChar(data.emoji);
              onSelect?.(data.emoji);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 8. Medusa (@medusajs/admin-ui, ui/src/components/molecules/emoji-picker)
// ---------------------------------------------------------------------------

/**
 * Medusa's notes emoji button: a Radix dropdown holding the picker with
 * NEUTRAL default tone, native style, skin tones disabled, and the legacy
 * `searchPlaceHolder` spelling; picks append to the note.
 * Substitution: Radix DropdownMenu (not installed) reduced to a toggled
 * panel.
 */
export function MedusaNotesPicker({
  onEmojiClick,
}: {
  onEmojiClick?: (emoji: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [note, setNote] = React.useState('');
  return (
    <div data-testid="medusa-admin">
      <textarea
        data-testid="medusa-note"
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      <button
        data-testid="medusa-toggle"
        aria-label="Add emoji"
        onClick={() => setOpen((o) => !o)}
      >
        🙂
      </button>
      {open && (
        <div data-testid="medusa-dropdown">
          <EmojiPicker
            emojiData={fixtureEmojiData}
            onEmojiClick={(emojiData) => {
              setNote((previous) => previous + emojiData.emoji);
              onEmojiClick?.(emojiData.emoji);
              setOpen(false);
            }}
            defaultSkinTone={SkinTones.NEUTRAL}
            emojiStyle={EmojiStyle.NATIVE}
            skinTonesDisabled
            searchPlaceHolder={'Search Emoji...'}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 9. Push Chat (private; observed in the app.push.org bundle)
// ---------------------------------------------------------------------------

/**
 * Push Chat's typebar passes the v3-era `pickerStyle` prop, removed in
 * later v4. Its source is private, so this reproduces only what the live
 * bundle shows: the picker in the composer with a style object. v5 drops
 * the unknown prop (no DOM leak) and `style` is the migration. The legacy
 * contract test also uses a conspicuous background to prove style forwarding;
 * the browsable fixture uses the managed automatic color scheme.
 */
export function PushChatTypebar({
  onSelect,
  legacyPickerStyle = false,
}: {
  onSelect?: (emoji: EmojiClickData) => void;
  legacyPickerStyle?: boolean;
}) {
  const [draft, setDraft] = React.useState('');
  const legacy = legacyPickerStyle
    ? ({ pickerStyle: { width: '100%' } } as object)
    : {};
  return (
    <div data-testid="push-typebar">
      <div data-testid="push-draft">{draft}</div>
      <EmojiPicker
        emojiData={fixtureEmojiData}
        colorScheme={Theme.AUTO}
        style={
          legacyPickerStyle ? { backgroundColor: 'rgb(1, 2, 3)' } : undefined
        }
        {...legacy}
        onEmojiClick={(emoji) => {
          setDraft((previous) => previous + emoji.emoji);
          onSelect?.(emoji);
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 10. ClassDojo (private fork @classdojo/emoji-picker-react)
// ---------------------------------------------------------------------------

/**
 * ClassDojo maintains a private fork with a custom emoji list and its own
 * search-result UI. The fork's source is not public, so this exercises the
 * upstream capability it would migrate to: custom emojis participating in
 * search and selection.
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

// ---------------------------------------------------------------------------
// 11. Prezly (@prezly/slate-editor, extensions/callout/components/
//     CalloutElement.tsx)
// ---------------------------------------------------------------------------

/**
 * The callout block's icon picker: a popper anchored to the icon button,
 * closed by a click outside (react-overlays useRootClose), Apple images,
 * RECENT suggestions, no preview, no skin tones, 275x350, plus a "No icon"
 * checkbox. Picking sets the callout icon and closes.
 * Substitutions: Popper/useRootClose reduced to a positioned div and a
 * document listener; the Slate element reduced to a div.
 */
export function PrezlyCalloutIcon({
  onPick,
}: {
  onPick?: (icon: string | null) => void;
}) {
  const [icon, setIcon] = React.useState<string | null>('💡');
  const [open, setOpen] = React.useState(false);
  const pickerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', close, true);
    return () => document.removeEventListener('click', close, true);
  }, [open]);
  const pick = (next: string | null) => {
    setIcon(next);
    onPick?.(next);
    setOpen(false);
  };
  return (
    <div data-testid="prezly-callout" style={{ position: 'relative', width: 320 }}>
      <button
        data-testid="prezly-icon"
        aria-label="Callout icon"
        onClick={() => setOpen((o) => !o)}
      >
        {icon ?? '∅'}
      </button>
      <p>Write something here...</p>
      {open && (
        <div ref={pickerRef} data-testid="prezly-popper">
          <EmojiPicker
            emojiData={fixtureEmojiData}
            onEmojiClick={({ emoji }) => pick(emoji)}
            previewConfig={{ showPreview: false }}
            skinTonesDisabled={true}
            suggestedEmojisMode={SuggestionMode.RECENT}
            emojiStyle={EmojiStyle.APPLE}
            width={275}
            height={350}
          />
          <label>
            <input
              type="checkbox"
              onInput={() => pick(null)}
              disabled={icon === null}
              checked={icon === null}
              readOnly
            />
            No icon
          </label>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 12. Signal (signalapp/Signal-Desktop, sticker-creator/src/components/
//     EmojiPicker.tsx) -- uses the fork @indutny/emoji-picker-react
// ---------------------------------------------------------------------------

/**
 * Signal's sticker creator depends on a fork, not this package. This is
 * its exact usage run against upstream, i.e. the migration it would make:
 * skin tones off, theme AUTO, native, translated category names, no
 * preview, and the fork's `searchPlaceHolder` spelling (which upstream
 * still accepts).
 */
export function SignalStickerEmojiPicker({
  onEmojiClick,
}: {
  onEmojiClick?: (clickData: EmojiClickData) => void;
}) {
  const [picked, setPicked] = React.useState('');
  const emojiCategories = [
    Categories.SMILEYS_PEOPLE,
    Categories.ANIMALS_NATURE,
    Categories.OBJECTS,
  ].map((category) => ({ category, name: `Category: ${category}` }));
  return (
    <div data-testid="signal-sticker">
      <div data-testid="signal-picked">{picked}</div>
      <EmojiPicker
        emojiData={fixtureEmojiData}
        skinTonesDisabled
        theme={Theme.AUTO}
        emojiStyle={EmojiStyle.NATIVE}
        onEmojiClick={(clickData) => {
          setPicked(clickData.emoji);
          onEmojiClick?.(clickData);
        }}
        searchPlaceHolder="Search emoji"
        categories={emojiCategories}
        previewConfig={{ showPreview: false }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 13. Postiz (gitroomhq/postiz-app, apps/frontend/src/components/new-launch/
//     editor.tsx)
// ---------------------------------------------------------------------------

/**
 * Postiz's post composer keeps the picker mounted and toggles it with the
 * `open` prop; the theme is the app's stored mode string cast to Theme
 * (falling back to DARK); picking inserts the text and closes.
 * Substitution: the rich editor reduced to a textarea.
 */
export function PostizComposer({
  onInsert,
  mode,
}: {
  onInsert?: (emoji: string) => void;
  mode?: string;
}) {
  const [emojiPickerOpen, setEmojiPickerOpen] = React.useState(false);
  const [value, setValue] = React.useState('');
  const addText = (emoji: string) => {
    setValue((previous) => previous + emoji);
    onInsert?.(emoji);
  };
  return (
    <div data-testid="postiz-editor">
      <textarea
        data-testid="postiz-text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <div
        role="button"
        tabIndex={0}
        data-testid="postiz-toggle"
        aria-label="Insert Emoji"
        onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
      >
        🙂
      </div>
      <div style={{ position: 'relative' }}>
        <EmojiPicker
          emojiData={fixtureEmojiData}
          height={400}
          theme={(mode as Theme) || Theme.DARK}
          onEmojiClick={(e) => {
            addText(e.emoji);
            setEmojiPickerOpen(false);
          }}
          open={emojiPickerOpen}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 14. Edifice (@edifice.io/react, editor/components/EditorToolbar/
//     EditorToolbar.Emoji.js; also @cgi-learning-hub/edifice-react)
// ---------------------------------------------------------------------------

/**
 * Edifice's rich-text toolbar: a dropdown with the picker at 316x400, no
 * preview, search disabled, and translated categories with Recently used
 * first; picking inserts at the editor selection (Tiptap
 * `insertContentAt(selection, emoji.emoji)`).
 * Substitutions: Tiptap reduced to a textarea with its selection; dropdown
 * reduced to a toggled panel.
 */
export function EdificeEditorToolbar({
  onInsert,
}: {
  onInsert?: (emoji: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('Hello world');
  const editorRef = React.useRef<HTMLTextAreaElement>(null);
  const insertAtSelection = (emoji: string) => {
    const editor = editorRef.current;
    const start = editor?.selectionStart ?? value.length;
    const end = editor?.selectionEnd ?? value.length;
    setValue((previous) => previous.slice(0, start) + emoji + previous.slice(end));
    onInsert?.(emoji);
  };
  return (
    <div data-testid="edifice-editor">
      <button
        data-testid="edifice-toggle"
        aria-label="Emojis"
        onClick={() => setOpen((o) => !o)}
      >
        🙂
      </button>
      <textarea
        data-testid="edifice-text"
        ref={editorRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      {open && (
        <div data-testid="edifice-dropdown">
          <EmojiPicker
            emojiData={fixtureEmojiData}
            height={400}
            width={316}
            onEmojiClick={(emoji) => insertAtSelection(emoji.emoji)}
            previewConfig={{ showPreview: false }}
            searchDisabled
            categories={[
              { category: Categories.SUGGESTED, name: 'Récemment utilisés' },
              { category: Categories.SMILEYS_PEOPLE, name: 'Personnes' },
              { category: Categories.ANIMALS_NATURE, name: 'Animaux et nature' },
              { category: Categories.OBJECTS, name: 'Objets' },
            ]}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 15. RealtimeX live chat (@realtimexsco/live-chat, dist/index.mjs)
// ---------------------------------------------------------------------------

/**
 * The message reaction popover: reactions mode first with expansion
 * allowed, 300x360, theme from the app's dark flag, and only
 * `onEmojiClick` -- reaction clicks reach it through the documented
 * fallback (no `onReactionClick`). Picking reacts and closes.
 * Substitution: Radix popover reduced to a toggled panel.
 */
export function LiveChatReactionPicker({
  isDark = false,
  onReactionClick,
}: {
  isDark?: boolean;
  onReactionClick?: (emoji: EmojiClickData) => void;
}) {
  const [isReactionOpen, setIsReactionOpen] = React.useState(false);
  const [reactions, setReactions] = React.useState<string[]>([]);
  return (
    <div data-testid="livechat-message">
      <p>Deploy is green ✅</p>
      <div data-testid="livechat-reactions">{reactions.join(' ')}</div>
      <button data-testid="livechat-react" onClick={() => setIsReactionOpen((o) => !o)}>
        react
      </button>
      {isReactionOpen && (
        <div data-testid="livechat-popover">
          <EmojiPicker
            emojiData={fixtureEmojiData}
            reactions={['1f44d', '2764-fe0f', '1f603']}
            theme={isDark ? Theme.DARK : Theme.LIGHT}
            onEmojiClick={(emojiData) => {
              setReactions((previous) => [...previous, emojiData.emoji]);
              onReactionClick?.(emojiData);
              setIsReactionOpen(false);
            }}
            width={300}
            height={360}
            reactionsDefaultOpen={true}
            allowExpandReactions={true}
          />
        </div>
      )}
    </div>
  );
}
