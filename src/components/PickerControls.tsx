import styles from "@/styles/PickerControls.module.css";
import {
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
    <div className={styles.PickerControls}>
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
      <InputSearchPlaceholder
        searchPlaceholder={pickerProps.searchPlaceholder}
        setSearchPlaceholder={(searchPlaceholder) =>
          updateState("searchPlaceholder", searchPlaceholder)
        }
      />
      <SelectEmojiStyle
        emojiStyle={pickerProps.emojiStyle}
        setEmojiStyle={(emojiStyle) => updateState("emojiStyle", emojiStyle)}
      />
      <SelectTheme
        theme={pickerProps.theme}
        setTheme={(theme) => updateState("theme", theme)}
      />
      <SelectSuggestionMode
        suggestionMode={pickerProps.suggestedEmojisMode}
        setSuggestionMode={(suggestionMode) =>
          updateState("suggestedEmojisMode", suggestionMode)
        }
      />
      <NumberHeight
        height={pickerProps.height}
        setHeight={(height) => updateState("height", height)}
      />
      <NumberWidth
        width={pickerProps.width}
        setWidth={(width) => updateState("width", width)}
      />
      <SelectSkinTonePickerLocation
        skinTonePickerLocation={pickerProps.skinTonePickerLocation}
        setSkinTonePickerLocation={(skinTonePickerLocation) =>
          updateState("skinTonePickerLocation", skinTonePickerLocation)
        }
      />
      <ChkCustomEmojis
        setCustomEmojis={(customEmojis) =>
          updateState("customEmojis", customEmojis)
        }
      />
      <ChkReactions
        reactionsDefaultOpen={pickerProps.reactionsDefaultOpen}
        setReactionsDefaultOpen={(reactionsDefaultOpen) =>
          updateState("reactionsDefaultOpen", reactionsDefaultOpen)
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
      <ChkAllowExpandReactions
        allowExpandReactions={pickerProps.allowExpandReactions}
        setAllowExpandReactions={(allowExpandReactions) =>
          updateState("allowExpandReactions", allowExpandReactions)
        }
      />
      <ChkOpen
        open={pickerProps.open}
        setOpen={(open) => updateState("open", open)}
      />
      <InputSearchClearButtonLabel
        searchClearButtonLabel={pickerProps.searchClearButtonLabel}
        setSearchClearButtonLabel={(searchClearButtonLabel) =>
          updateState("searchClearButtonLabel", searchClearButtonLabel)
        }
      />
      <SelectDefaultSkinTone
        defaultSkinTone={pickerProps.defaultSkinTone}
        setDefaultSkinTone={(defaultSkinTone) =>
          updateState("defaultSkinTone", defaultSkinTone)
        }
      />
      <SelectEmojiVersion
        emojiVersion={pickerProps.emojiVersion}
        setEmojiVersion={(emojiVersion) =>
          updateState("emojiVersion", emojiVersion)
        }
      />
      <InputReactions
        reactions={pickerProps.reactions}
        setReactions={(reactions) => updateState("reactions", reactions)}
      />
      <InputHiddenEmojis
        hiddenEmojis={pickerProps.hiddenEmojis}
        setHiddenEmojis={(hiddenEmojis) =>
          updateState("hiddenEmojis", hiddenEmojis)
        }
      />
      <SelectLanguage
        setEmojiData={(emojiData) => updateState("emojiData", emojiData)}
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
      <InputDefaultEmoji
        defaultEmoji={pickerProps.previewConfig?.defaultEmoji}
        setDefaultEmoji={(defaultEmoji) =>
          updateState("previewConfig", {
            ...pickerProps.previewConfig,
            defaultEmoji,
          })
        }
      />
      <InputDefaultCaption
        defaultCaption={pickerProps.previewConfig?.defaultCaption}
        setDefaultCaption={(defaultCaption) =>
          updateState("previewConfig", {
            ...pickerProps.previewConfig,
            defaultCaption,
          })
        }
      />
      <div className={styles.spacer} />
      <button onClick={reset} className={styles.ButtonReset}>
        Reset
      </button>
    </div>
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
    <label className={styles.Label}>
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
    <Label text="Skin Tones Disabled">
      <input
        type="checkbox"
        checked={skinTonesDisabled}
        onChange={(e) => setSkinTonesDisabled(e.target.checked)}
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
    <Label text="Search Disabled">
      <input
        type="checkbox"
        checked={searchDisabled}
        onChange={(e) => setSearchDisabled(e.target.checked)}
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

function InputSearchPlaceholder({
  searchPlaceholder,
  setSearchPlaceholder,
}: {
  searchPlaceholder?: string;
  setSearchPlaceholder: (searchPlaceholder: string) => void;
}) {
  return (
    <Label text="Search Placeholder">
      <input
        type="text"
        value={searchPlaceholder}
        onChange={(e) => setSearchPlaceholder(e.target.value)}
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
    <Label text="Suggestion Mode">
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
    <Label text="Height">
      <input
        type="number"
        min={100}
        max={500}
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
    <Label text="Width">
      <input
        type="number"
        min={100}
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
    <Label text="Skin Tone Picker Location">
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
    <Label text="Reactions Default Open">
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

function ChkAllowExpandReactions({
  allowExpandReactions,
  setAllowExpandReactions,
}: {
  allowExpandReactions?: boolean;
  setAllowExpandReactions: (allowExpandReactions: boolean) => void;
}) {
  return (
    <Label text="Allow Expand Reactions">
      <input
        type="checkbox"
        checked={allowExpandReactions}
        onChange={(e) => setAllowExpandReactions(e.target.checked)}
      />
    </Label>
  );
}

function ChkOpen({
  open,
  setOpen,
}: {
  open?: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <Label text="Open">
      <input
        type="checkbox"
        checked={open}
        onChange={(e) => setOpen(e.target.checked)}
      />
    </Label>
  );
}

function InputSearchClearButtonLabel({
  searchClearButtonLabel,
  setSearchClearButtonLabel,
}: {
  searchClearButtonLabel?: string;
  setSearchClearButtonLabel: (searchClearButtonLabel: string) => void;
}) {
  return (
    <Label text="Search Clear Button Label">
      <input
        type="text"
        value={searchClearButtonLabel}
        onChange={(e) => setSearchClearButtonLabel(e.target.value)}
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

function SelectEmojiVersion({
  emojiVersion,
  setEmojiVersion,
}: {
  emojiVersion?: string | null;
  setEmojiVersion: (emojiVersion: string | null) => void;
}) {
  return (
    <Label text="Emoji Version">
      <select
        value={emojiVersion || ""}
        onChange={(e) => setEmojiVersion(e.target.value || null)}
      >
        <option value="">All</option>
        <option value="0.6">0.6</option>
        <option value="1.0">1.0</option>
        <option value="2.0">2.0</option>
        <option value="3.0">3.0</option>
        <option value="4.0">4.0</option>
        <option value="5.0">5.0</option>
        <option value="11.0">11.0</option>
        <option value="12.0">12.0</option>
        <option value="12.1">12.1</option>
        <option value="13.0">13.0</option>
        <option value="13.1">13.1</option>
        <option value="14.0">14.0</option>
        <option value="15.0">15.0</option>
      </select>
    </Label>
  );
}

function InputReactions({
  reactions,
  setReactions,
}: {
  reactions?: string[];
  setReactions: (reactions: string[]) => void;
}) {
  const [value, setValue] = React.useState(reactions?.join(",") || "");

  React.useEffect(() => {
    setValue(reactions?.join(",") || "");
  }, [reactions]);

  return (
    <Label text="Reactions (comma separated)">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setReactions(e.target.value.split(","));
        }}
      />
    </Label>
  );
}

function InputHiddenEmojis({
  hiddenEmojis,
  setHiddenEmojis,
}: {
  hiddenEmojis?: string[];
  setHiddenEmojis: (hiddenEmojis: string[]) => void;
}) {
  const [value, setValue] = React.useState(hiddenEmojis?.join(",") || "");

  React.useEffect(() => {
    setValue(hiddenEmojis?.join(",") || "");
  }, [hiddenEmojis]);

  return (
    <Label text="Hidden Emojis (comma separated)">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setHiddenEmojis(e.target.value.split(","));
        }}
      />
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

function InputDefaultEmoji({
  defaultEmoji,
  setDefaultEmoji,
}: {
  defaultEmoji?: string;
  setDefaultEmoji: (defaultEmoji: string) => void;
}) {
  return (
    <Label text="Preview Default Emoji">
      <input
        type="text"
        value={defaultEmoji}
        onChange={(e) => setDefaultEmoji(e.target.value)}
      />
    </Label>
  );
}

function InputDefaultCaption({
  defaultCaption,
  setDefaultCaption,
}: {
  defaultCaption?: string;
  setDefaultCaption: (defaultCaption: string) => void;
}) {
  return (
    <Label text="Preview Default Caption">
      <input
        type="text"
        value={defaultCaption}
        onChange={(e) => setDefaultCaption(e.target.value)}
      />
    </Label>
  );
}
