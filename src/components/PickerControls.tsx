import styles from "@/styles/PickerControls.module.css";
import {
  EmojiStyle,
  PickerProps,
  SkinTonePickerLocation,
  SuggestionMode,
  Theme,
} from "emoji-picker-react";
import * as React from "react";
import { customEmojis } from "./customEmojis";

export function PickerControls({
  pickerProps,
  updateState,
  reset,
}: {
  pickerProps: PickerProps;
  updateState: <K extends keyof PickerProps>(
    key: K,
    value: PickerProps[K]
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
    }[]
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
    skinTonePickerLocation: SkinTonePickerLocation
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
