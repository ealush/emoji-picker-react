import styles from "@/styles/PickerControls.module.css";
import {
  Categories,
  EmojiStyle,
  PickerProps,
  SkinTonePickerLocation,
  SkinTones,
  SuggestionMode,
  Theme,
} from "emoji-picker-react";
import * as React from "react";
import emojiDataBn from "emoji-picker-react/dist/data/emojis-bn.json";
import emojiDataDa from "emoji-picker-react/dist/data/emojis-da.json";
import emojiDataDe from "emoji-picker-react/dist/data/emojis-de.json";
import emojiDataEn from "emoji-picker-react/dist/data/emojis-en.json";
import emojiDataEnGb from "emoji-picker-react/dist/data/emojis-en-gb.json";
import emojiDataEs from "emoji-picker-react/dist/data/emojis-es.json";
import emojiDataEsMx from "emoji-picker-react/dist/data/emojis-es-mx.json";
import emojiDataEt from "emoji-picker-react/dist/data/emojis-et.json";
import emojiDataFi from "emoji-picker-react/dist/data/emojis-fi.json";
import emojiDataFr from "emoji-picker-react/dist/data/emojis-fr.json";
import emojiDataHi from "emoji-picker-react/dist/data/emojis-hi.json";
import emojiDataHu from "emoji-picker-react/dist/data/emojis-hu.json";
import emojiDataIt from "emoji-picker-react/dist/data/emojis-it.json";
import emojiDataJa from "emoji-picker-react/dist/data/emojis-ja.json";
import emojiDataKo from "emoji-picker-react/dist/data/emojis-ko.json";
import emojiDataLt from "emoji-picker-react/dist/data/emojis-lt.json";
import emojiDataMs from "emoji-picker-react/dist/data/emojis-ms.json";
import emojiDataNb from "emoji-picker-react/dist/data/emojis-nb.json";
import emojiDataNl from "emoji-picker-react/dist/data/emojis-nl.json";
import emojiDataPl from "emoji-picker-react/dist/data/emojis-pl.json";
import emojiDataPt from "emoji-picker-react/dist/data/emojis-pt.json";
import emojiDataRu from "emoji-picker-react/dist/data/emojis-ru.json";
import emojiDataSv from "emoji-picker-react/dist/data/emojis-sv.json";
import emojiDataTh from "emoji-picker-react/dist/data/emojis-th.json";
import emojiDataUk from "emoji-picker-react/dist/data/emojis-uk.json";
import emojiDataZh from "emoji-picker-react/dist/data/emojis-zh.json";
import emojiDataZhHant from "emoji-picker-react/dist/data/emojis-zh-hant.json";
import { customEmojis } from "./customEmojis";

const languages: Record<string, any> = {
  bn: emojiDataBn,
  da: emojiDataDa,
  de: emojiDataDe,
  en: emojiDataEn,
  "en-gb": emojiDataEnGb,
  es: emojiDataEs,
  "es-mx": emojiDataEsMx,
  et: emojiDataEt,
  fi: emojiDataFi,
  fr: emojiDataFr,
  hi: emojiDataHi,
  hu: emojiDataHu,
  it: emojiDataIt,
  ja: emojiDataJa,
  ko: emojiDataKo,
  lt: emojiDataLt,
  ms: emojiDataMs,
  nb: emojiDataNb,
  nl: emojiDataNl,
  pl: emojiDataPl,
  pt: emojiDataPt,
  ru: emojiDataRu,
  sv: emojiDataSv,
  th: emojiDataTh,
  uk: emojiDataUk,
  zh: emojiDataZh,
  "zh-hant": emojiDataZhHant,
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
        <SelectTheme
          theme={pickerProps.theme}
          setTheme={(theme) => updateState("theme", theme)}
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
  emojiStyle?: EmojiStyle;
  setEmojiStyle: (emojiStyle: EmojiStyle) => void;
}) {
  return (
    <Label text="Emoji Style">
      <select
        value={emojiStyle}
        onChange={(e) => setEmojiStyle(e.target.value as EmojiStyle)}
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

function SelectTheme({
  theme,
  setTheme,
}: {
  theme?: Theme;
  setTheme: (theme: Theme) => void;
}) {
  return (
    <Label text="Theme">
      <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
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
  suggestionMode?: SuggestionMode;
  setSuggestionMode: (suggestionMode: SuggestionMode) => void;
}) {
  return (
    <Label text="Suggestions">
      <select
        value={suggestionMode}
        onChange={(e) => setSuggestionMode(e.target.value as SuggestionMode)}
      >
        <option value={SuggestionMode.RECENT}>Recent</option>
        <option value={SuggestionMode.FREQUENT}>Frequent</option>
      </select>
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
  setEmojiData: (emojiData: any) => void;
}) {
  return (
    <Label text="Language">
      <select
        onChange={(e) => {
          const lang = e.target.value;
          setEmojiData(languages[lang]);
        }}
      >
        <option value="">Default (en)</option>
        {Object.keys(languages).map((lang) => (
          <option key={lang} value={lang}>
            {lang}
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
