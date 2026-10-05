import styles from "@/styles/PickerControls.module.css";
import {
  Categories,
  EmojiStyle,
  type EmojiStyleValue,
  PickerProps,
  SkinTonePickerLocation,
  SkinTones,
  SuggestionMode,
  type SuggestionModeValue,
  type ThemeValue,
} from "emoji-picker-react";
import * as React from "react";
import { customEmojis } from "./customEmojis";

// Locale datasets are code-split: each one loads on demand through the
// `emojiData` loader form, so the demo bundle ships only the English data.
// Loaders are hoisted (module scope): a new function identity reloads.
const languages: Record<string, { name: string; load: PickerProps["emojiData"] }> = {
  bn: { name: "Bengali", load: () => import("emoji-picker-react/data/emojis-bn") },
  da: { name: "Danish", load: () => import("emoji-picker-react/data/emojis-da") },
  de: { name: "German", load: () => import("emoji-picker-react/data/emojis-de") },
  "en-gb": { name: "English (GB)", load: () => import("emoji-picker-react/data/emojis-en-gb") },
  es: { name: "Spanish", load: () => import("emoji-picker-react/data/emojis-es") },
  "es-mx": { name: "Spanish (Mexico)", load: () => import("emoji-picker-react/data/emojis-es-mx") },
  et: { name: "Estonian", load: () => import("emoji-picker-react/data/emojis-et") },
  fi: { name: "Finnish", load: () => import("emoji-picker-react/data/emojis-fi") },
  fr: { name: "French", load: () => import("emoji-picker-react/data/emojis-fr") },
  hi: { name: "Hindi", load: () => import("emoji-picker-react/data/emojis-hi") },
  hu: { name: "Hungarian", load: () => import("emoji-picker-react/data/emojis-hu") },
  it: { name: "Italian", load: () => import("emoji-picker-react/data/emojis-it") },
  ja: { name: "Japanese", load: () => import("emoji-picker-react/data/emojis-ja") },
  ko: { name: "Korean", load: () => import("emoji-picker-react/data/emojis-ko") },
  lt: { name: "Lithuanian", load: () => import("emoji-picker-react/data/emojis-lt") },
  ms: { name: "Malay", load: () => import("emoji-picker-react/data/emojis-ms") },
  nb: { name: "Norwegian Bokmål", load: () => import("emoji-picker-react/data/emojis-nb") },
  nl: { name: "Dutch", load: () => import("emoji-picker-react/data/emojis-nl") },
  pl: { name: "Polish", load: () => import("emoji-picker-react/data/emojis-pl") },
  pt: { name: "Portuguese", load: () => import("emoji-picker-react/data/emojis-pt") },
  ru: { name: "Russian", load: () => import("emoji-picker-react/data/emojis-ru") },
  sv: { name: "Swedish", load: () => import("emoji-picker-react/data/emojis-sv") },
  th: { name: "Thai", load: () => import("emoji-picker-react/data/emojis-th") },
  uk: { name: "Ukrainian", load: () => import("emoji-picker-react/data/emojis-uk") },
  vi: { name: "Vietnamese", load: () => import("emoji-picker-react/data/emojis-vi") },
  zh: { name: "Chinese (Simplified)", load: () => import("emoji-picker-react/data/emojis-zh") },
  "zh-hant": { name: "Chinese (Traditional)", load: () => import("emoji-picker-react/data/emojis-zh-hant") },
};

export function PickerControls({
  pickerProps,
  updateState,
  reset,
}: {
  pickerProps: PickerProps;
  updateState: <K extends keyof PickerProps>(
    key: K,
    value: PickerProps[K],
  ) => void;
  reset: () => void;
}) {
  return (
    <div className={styles.pickerControls}>
      <div className={styles.controlsHeader}>
        <span className={styles.controlsTitle}>
          <SettingsIcon />
          Configuration
        </span>
        <button onClick={reset} className={styles.resetButton}>
          <ResetIcon />
          Reset
        </button>
      </div>

      <div className={styles.controlsContent}>
        {/* Appearance */}
        <div className={styles.sectionLabel}>Appearance</div>
        <SelectEmojiStyle
          emojiStyle={pickerProps.emojiStyle}
          setEmojiStyle={(emojiStyle) => updateState("emojiStyle", emojiStyle)}
        />
        <SelectColorScheme
          colorScheme={pickerProps.colorScheme}
          setColorScheme={(colorScheme) =>
            updateState("colorScheme", colorScheme)
          }
        />
        <NumberColumns
          columns={pickerProps.columns}
          setColumns={(columns) => updateState("columns", columns)}
        />
        <NumberHeight
          height={pickerProps.height}
          setHeight={(height) => updateState("height", height)}
        />
        <NumberWidth
          width={pickerProps.width}
          setWidth={(width) => updateState("width", width)}
        />

        {/* Features */}
        <div className={styles.sectionLabel}>Features</div>
        <ChkSkinTonesDisabled
          skinTonesDisabled={pickerProps.skinTonesDisabled}
          setSkinTonesDisabled={(skinTonesDisabled) =>
            updateState("skinTonesDisabled", skinTonesDisabled)
          }
        />
        <ChkSearchDisabled
          searchDisabled={pickerProps.searchDisabled}
          setSearchDisabled={(searchDisabled) =>
            updateState("searchDisabled", searchDisabled)
          }
        />
        <ChkAutoFocusSearch
          autoFocusSearch={pickerProps.autoFocusSearch}
          setAutoFocusSearch={(autoFocusSearch) =>
            updateState("autoFocusSearch", autoFocusSearch)
          }
        />
        <ChkLazyLoadEmojis
          lazyLoadEmojis={pickerProps.lazyLoadEmojis}
          setLazyLoadEmojis={(lazyLoadEmojis) =>
            updateState("lazyLoadEmojis", lazyLoadEmojis)
          }
        />
        <ChkShowPreview
          showPreview={pickerProps.previewConfig?.showPreview}
          setShowPreview={(showPreview) =>
            updateState("previewConfig", {
              ...pickerProps.previewConfig,
              showPreview,
            })
          }
        />
        <ChkCustomEmojis
          setCustomEmojis={(customEmojis) =>
            updateState("customEmojis", customEmojis)
          }
        />

        {/* Advanced */}
        <div className={styles.sectionLabel}>Advanced</div>
        <SelectLanguage
          setEmojiData={(emojiData) => updateState("emojiData", emojiData)}
        />
        <ChkCategoryIcons
          setCategoryIcons={(categoryIcons) =>
            updateState("categoryIcons", categoryIcons)
          }
        />
        <SelectSuggestionMode
          suggestionMode={pickerProps.suggestedEmojisMode}
          setSuggestionMode={(suggestionMode) =>
            updateState("suggestedEmojisMode", suggestionMode)
          }
        />
        <SelectSkinTonePickerLocation
          skinTonePickerLocation={pickerProps.skinTonePickerLocation}
          setSkinTonePickerLocation={(skinTonePickerLocation) =>
            updateState("skinTonePickerLocation", skinTonePickerLocation)
          }
        />
        <SelectDefaultSkinTone
          defaultSkinTone={pickerProps.defaultSkinTone}
          setDefaultSkinTone={(defaultSkinTone) =>
            updateState("defaultSkinTone", defaultSkinTone)
          }
        />
      </div>
    </div>
  );
}

function SettingsIcon() {
  return (
    <svg
      className={styles.controlsIcon}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function Label({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) {
  return (
    <label className={styles.label}>
      {text}
      {children}
    </label>
  );
}

function ChkSkinTonesDisabled({
  skinTonesDisabled,
  setSkinTonesDisabled,
}: {
  skinTonesDisabled?: boolean;
  setSkinTonesDisabled: (skinTonesDisabled: boolean) => void;
}) {
  return (
    <Label text="Skin Tones">
      <input
        type="checkbox"
        checked={!skinTonesDisabled}
        onChange={(e) => setSkinTonesDisabled(!e.target.checked)}
      />
    </Label>
  );
}

function ChkSearchDisabled({
  searchDisabled,
  setSearchDisabled,
}: {
  searchDisabled?: boolean;
  setSearchDisabled: (searchDisabled: boolean) => void;
}) {
  return (
    <Label text="Search">
      <input
        type="checkbox"
        checked={!searchDisabled}
        onChange={(e) => setSearchDisabled(!e.target.checked)}
      />
    </Label>
  );
}

function ChkCustomEmojis({
  setCustomEmojis,
}: {
  setCustomEmojis: (
    toggleCustomEmojis: {
      names: string[];
      imgUrl: string;
      id: string;
    }[],
  ) => void;
}) {
  const [toggleCustomEmojis, setToggleCustomEmojis] = React.useState(false);

  React.useEffect(() => {
    setCustomEmojis(toggleCustomEmojis ? customEmojis : []);
  }, [toggleCustomEmojis]);

  return (
    <Label text="Custom Emojis">
      <input
        type="checkbox"
        checked={toggleCustomEmojis}
        onChange={(e) => setToggleCustomEmojis(e.target.checked)}
      />
    </Label>
  );
}

// Custom emoji-based category icons
const customCategoryIcons = {
  [Categories.SUGGESTED]: <span style={{ fontSize: "16px" }}>🕐</span>,
  [Categories.SMILEYS_PEOPLE]: <span style={{ fontSize: "16px" }}>😊</span>,
  [Categories.ANIMALS_NATURE]: <span style={{ fontSize: "16px" }}>🐻</span>,
  [Categories.FOOD_DRINK]: <span style={{ fontSize: "16px" }}>🍔</span>,
  [Categories.TRAVEL_PLACES]: <span style={{ fontSize: "16px" }}>✈️</span>,
  [Categories.ACTIVITIES]: <span style={{ fontSize: "16px" }}>⚽</span>,
  [Categories.OBJECTS]: <span style={{ fontSize: "16px" }}>💡</span>,
  [Categories.SYMBOLS]: <span style={{ fontSize: "16px" }}>💕</span>,
  [Categories.FLAGS]: <span style={{ fontSize: "16px" }}>🏳️</span>,
};

function ChkCategoryIcons({
  setCategoryIcons,
}: {
  setCategoryIcons: (categoryIcons: Record<string, React.ReactNode>) => void;
}) {
  const [useCustomIcons, setUseCustomIcons] = React.useState(false);

  React.useEffect(() => {
    // Pass empty object instead of undefined to avoid library crash
    setCategoryIcons(useCustomIcons ? customCategoryIcons : {});
  }, [useCustomIcons]);

  return (
    <Label text="Custom Category Icons">
      <input
        type="checkbox"
        checked={useCustomIcons}
        onChange={(e) => setUseCustomIcons(e.target.checked)}
      />
    </Label>
  );
}

function SelectEmojiStyle({
  emojiStyle,
  setEmojiStyle,
}: {
  emojiStyle?: EmojiStyleValue;
  setEmojiStyle: (emojiStyle: EmojiStyleValue) => void;
}) {
  return (
    <Label text="Emoji Style">
      <select
        value={emojiStyle}
        onChange={(e) => setEmojiStyle(e.target.value as EmojiStyleValue)}
      >
        <option value={EmojiStyle.NATIVE}>Native</option>
        <option value={EmojiStyle.APPLE}>Apple</option>
        <option value={EmojiStyle.TWITTER}>Twitter</option>
        <option value={EmojiStyle.GOOGLE}>Google</option>
        <option value={EmojiStyle.FACEBOOK}>Facebook</option>
      </select>
    </Label>
  );
}

function SelectColorScheme({
  colorScheme,
  setColorScheme,
}: {
  colorScheme?: ThemeValue;
  setColorScheme: (colorScheme: ThemeValue) => void;
}) {
  return (
    <Label text="Color scheme">
      <select
        value={colorScheme}
        onChange={(e) => setColorScheme(e.target.value as ThemeValue)}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="auto">Auto</option>
      </select>
    </Label>
  );
}

function SelectSuggestionMode({
  suggestionMode,
  setSuggestionMode,
}: {
  suggestionMode?: SuggestionModeValue;
  setSuggestionMode: (suggestionMode: SuggestionModeValue) => void;
}) {
  return (
    <Label text="Suggestions">
      <select
        value={suggestionMode}
        onChange={(e) => setSuggestionMode(e.target.value as SuggestionModeValue)}
      >
        <option value={SuggestionMode.RECENT}>Recent</option>
        <option value={SuggestionMode.FREQUENT}>Frequent</option>
      </select>
    </Label>
  );
}

function NumberColumns({
  columns,
  setColumns,
}: {
  columns?: number;
  setColumns: (columns: number | undefined) => void;
}) {
  return (
    <Label text="Columns (fit width)">
      <input
        type="number"
        min={3}
        max={12}
        placeholder="auto"
        value={columns ?? ""}
        onChange={(e) =>
          setColumns(e.target.value === "" ? undefined : +e.target.value)
        }
      />
    </Label>
  );
}

function NumberHeight({
  height,
  setHeight,
}: {
  height?: number | string;
  setHeight: (height: number) => void;
}) {
  return (
    <Label text="Height (px)">
      <input
        type="number"
        min={200}
        max={600}
        value={height}
        onChange={(e) => setHeight(+e.target.value)}
      />
    </Label>
  );
}

function NumberWidth({
  width,
  setWidth,
}: {
  width?: number | string;
  setWidth: (width: number) => void;
}) {
  return (
    <Label text="Width (px)">
      <input
        type="number"
        min={200}
        max={500}
        value={width}
        onChange={(e) => setWidth(+e.target.value)}
      />
    </Label>
  );
}

function SelectSkinTonePickerLocation({
  skinTonePickerLocation,
  setSkinTonePickerLocation,
}: {
  skinTonePickerLocation?: SkinTonePickerLocation;
  setSkinTonePickerLocation: (
    skinTonePickerLocation: SkinTonePickerLocation,
  ) => void;
}) {
  return (
    <Label text="Skin Tone Location">
      <select
        value={skinTonePickerLocation}
        onChange={(e) =>
          setSkinTonePickerLocation(e.target.value as SkinTonePickerLocation)
        }
      >
        <option value={SkinTonePickerLocation.PREVIEW}>Preview</option>
        <option value={SkinTonePickerLocation.SEARCH}>Search</option>
      </select>
    </Label>
  );
}

function ChkReactions({
  reactionsDefaultOpen,
  setReactionsDefaultOpen,
}: {
  reactionsDefaultOpen?: boolean;
  setReactionsDefaultOpen: (reactionsDefaultOpen: boolean) => void;
}) {
  return (
    <Label text="Reactions Mode">
      <input
        type="checkbox"
        checked={reactionsDefaultOpen}
        onChange={(e) => setReactionsDefaultOpen(e.target.checked)}
      />
    </Label>
  );
}

function ChkAutoFocusSearch({
  autoFocusSearch,
  setAutoFocusSearch,
}: {
  autoFocusSearch?: boolean;
  setAutoFocusSearch: (autoFocusSearch: boolean) => void;
}) {
  return (
    <Label text="Auto Focus Search">
      <input
        type="checkbox"
        checked={autoFocusSearch}
        onChange={(e) => setAutoFocusSearch(e.target.checked)}
      />
    </Label>
  );
}

function ChkLazyLoadEmojis({
  lazyLoadEmojis,
  setLazyLoadEmojis,
}: {
  lazyLoadEmojis?: boolean;
  setLazyLoadEmojis: (lazyLoadEmojis: boolean) => void;
}) {
  return (
    <Label text="Lazy Load Emojis">
      <input
        type="checkbox"
        checked={lazyLoadEmojis}
        onChange={(e) => setLazyLoadEmojis(e.target.checked)}
      />
    </Label>
  );
}

function SelectDefaultSkinTone({
  defaultSkinTone,
  setDefaultSkinTone,
}: {
  defaultSkinTone?: SkinTones;
  setDefaultSkinTone: (defaultSkinTone: SkinTones) => void;
}) {
  return (
    <Label text="Default Skin Tone">
      <select
        value={defaultSkinTone}
        onChange={(e) => setDefaultSkinTone(e.target.value as SkinTones)}
      >
        <option value={SkinTones.NEUTRAL}>Neutral</option>
        <option value={SkinTones.LIGHT}>Light</option>
        <option value={SkinTones.MEDIUM_LIGHT}>Medium Light</option>
        <option value={SkinTones.MEDIUM}>Medium</option>
        <option value={SkinTones.MEDIUM_DARK}>Medium Dark</option>
        <option value={SkinTones.DARK}>Dark</option>
      </select>
    </Label>
  );
}

function SelectLanguage({
  setEmojiData,
}: {
  setEmojiData: (emojiData: PickerProps["emojiData"]) => void;
}) {
  return (
    <Label text="Language">
      <select
        onChange={(e) => setEmojiData(languages[e.target.value]?.load)}
      >
        <option value="">English (default)</option>
        {Object.entries(languages).map(([lang, { name }]) => (
          <option key={lang} value={lang}>
            {name}
          </option>
        ))}
      </select>
    </Label>
  );
}

function ChkShowPreview({
  showPreview,
  setShowPreview,
}: {
  showPreview?: boolean;
  setShowPreview: (showPreview: boolean) => void;
}) {
  return (
    <Label text="Show Preview">
      <input
        type="checkbox"
        checked={showPreview ?? true}
        onChange={(e) => setShowPreview(e.target.checked)}
      />
    </Label>
  );
}
