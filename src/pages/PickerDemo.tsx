import Picker, {
  SkinTonePickerLocation,
  SuggestionMode,
  Theme,
} from "emoji-picker-react";
import { EmojiStyle, PickerProps } from "emoji-picker-react";
import React, { useState } from "react";
import styles from "@/styles/PickerDemo.module.css";

const DEFAULT_SKIN_TONES_DISABLED = false;
const DEFAULT_SEARCH_DISABLED = false;
const DEFAULT_EMOJI_STYLE = EmojiStyle.NATIVE;
const DEFAULT_THEME = Theme.LIGHT;
const DEFAULT_SUGGESTED_EMOJIS_MODE = SuggestionMode.RECENT;
const DEFAULT_HEIGHT = 450;
const DEFAULT_WIDTH = 350;
const DEFAULT_SKIN_TONE_PICKER_LOCATION = SkinTonePickerLocation.SEARCH;

export default function PickerDemo() {
  const [pickerProps, setPickerProps] = useState<PickerProps>({
    skinTonesDisabled: DEFAULT_SKIN_TONES_DISABLED,
    searchDisabled: DEFAULT_SEARCH_DISABLED,
    searchPlaceholder: "Search emojis",
    emojiStyle: DEFAULT_EMOJI_STYLE,
    theme: DEFAULT_THEME,
    suggestedEmojisMode: DEFAULT_SUGGESTED_EMOJIS_MODE,
    height: DEFAULT_HEIGHT,
    width: DEFAULT_WIDTH,
    skinTonePickerLocation: DEFAULT_SKIN_TONE_PICKER_LOCATION,
  } as PickerProps);
  const [now, setNow] = useState(Date.now());

  return (
    <div>
      <Picker
        key={now}
        autoFocusSearch={false}
        skinTonesDisabled={pickerProps.skinTonesDisabled}
        searchDisabled={pickerProps.searchDisabled}
        searchPlaceholder={pickerProps.searchPlaceholder}
        emojiStyle={pickerProps.emojiStyle}
        theme={pickerProps.theme}
        suggestedEmojisMode={pickerProps.suggestedEmojisMode}
        height={pickerProps.height}
        width={pickerProps.width}
        skinTonePickerLocation={pickerProps.skinTonePickerLocation}
      />
      <div>
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
      </div>
    </div>
  );

  function updateState<K extends keyof PickerProps>(
    key: K,
    value: PickerProps[K]
  ) {
    setNow(Date.now());
    setPickerProps({ ...pickerProps, [key]: value });
  }
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
