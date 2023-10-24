import Picker, {
  SkinTonePickerLocation,
  SuggestionMode,
  Theme,
} from "emoji-picker-react";
import { EmojiStyle, PickerProps } from "emoji-picker-react";
import React, { useState } from "react";
import { PickerControls } from "./PickerControls";

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
      <Picker key={now} {...pickerProps} />
      <PickerControls pickerProps={pickerProps} updateState={updateState} />
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
