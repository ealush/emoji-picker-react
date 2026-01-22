"use client";

import Picker, {
  SkinTonePickerLocation,
  SkinTones,
  SuggestionMode,
  Theme,
} from "emoji-picker-react";
import { EmojiStyle, PickerProps } from "emoji-picker-react";
import React, { useState } from "react";
import { PickerControls } from "./PickerControls";
import styles from "@/styles/PickerDemo.module.css";

const DEFAULT_SKIN_TONES_DISABLED = false;
const DEFAULT_SEARCH_DISABLED = false;
const DEFAULT_EMOJI_STYLE = EmojiStyle.NATIVE;
const DEFAULT_THEME = Theme.AUTO;
const DEFAULT_SUGGESTED_EMOJIS_MODE = SuggestionMode.RECENT;
const DEFAULT_HEIGHT = 450;
const DEFAULT_WIDTH = 350;
const DEFAULT_SKIN_TONE_PICKER_LOCATION = SkinTonePickerLocation.SEARCH;
const DEFAULT_AUTO_FOCUS_SEARCH = false;
const DEFAULT_LAZY_LOAD_EMOJIS = false;
const DEFAULT_ALLOW_EXPAND_REACTIONS = true;
const DEFAULT_OPEN = true;
const DEFAULT_DEFAULT_SKIN_TONE = SkinTones.NEUTRAL;
const DEFAULT_EMOJI_VERSION = null;
const DEFAULT_SEARCH_CLEAR_BUTTON_LABEL = "Clear";
const DEFAULT_PREVIEW_CONFIG = {
  defaultEmoji: "1f60a",
  defaultCaption: "What's your mood?",
  showPreview: true,
};
const DEFAULT_HIDDEN_EMOJIS: string[] = [];

export default function PickerDemo() {
  const [pickerProps, setPickerProps] = useState<PickerProps>(defaultProps);
  const [now, setNow] = useState(Date.now());
  const [textareaValue, setTextareaValue] = useState("");

  return (
    <div>
      <div
        className={styles.PickerDemo}
        style={{
          height: `${pickerProps.height}px`,
        }}
      >
        <div
          style={{
            minWidth: `${pickerProps.width}px`,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Picker
            onEmojiClick={(emoji) =>
              setTextareaValue(
                (tv) =>
                  tv + (emoji?.isCustom ? `:${emoji.emoji}:` : emoji.emoji),
              )
            }
            key={now}
            {...pickerProps}
          />
        </div>
        <PickerControls
          pickerProps={pickerProps}
          updateState={updateState}
          reset={resetState}
        />
      </div>
      <div>
        <textarea
          value={textareaValue}
          onChange={(e) => setTextareaValue(e.target.value)}
          placeholder="Type anything..."
          className={styles.pickerTextarea}
        ></textarea>
      </div>
    </div>
  );

  function updateState<K extends keyof PickerProps>(
    key: K,
    value: PickerProps[K],
  ) {
    setNow(Date.now());
    setPickerProps({ ...pickerProps, [key]: value });
  }

  function resetState() {
    setNow(Date.now());
    setPickerProps(defaultProps);
  }
}

const defaultProps = {
  skinTonesDisabled: DEFAULT_SKIN_TONES_DISABLED,
  searchDisabled: DEFAULT_SEARCH_DISABLED,
  searchPlaceholder: undefined,
  emojiStyle: DEFAULT_EMOJI_STYLE,
  theme: DEFAULT_THEME,
  suggestedEmojisMode: DEFAULT_SUGGESTED_EMOJIS_MODE,
  height: DEFAULT_HEIGHT,
  width: DEFAULT_WIDTH,
  skinTonePickerLocation: DEFAULT_SKIN_TONE_PICKER_LOCATION,
  autoFocusSearch: DEFAULT_AUTO_FOCUS_SEARCH,
  lazyLoadEmojis: DEFAULT_LAZY_LOAD_EMOJIS,
  allowExpandReactions: DEFAULT_ALLOW_EXPAND_REACTIONS,
  open: DEFAULT_OPEN,
  defaultSkinTone: DEFAULT_DEFAULT_SKIN_TONE,
  emojiVersion: DEFAULT_EMOJI_VERSION,
  searchClearButtonLabel: DEFAULT_SEARCH_CLEAR_BUTTON_LABEL,
  previewConfig: DEFAULT_PREVIEW_CONFIG,
  reactionsDefaultOpen: false,
  hiddenEmojis: DEFAULT_HIDDEN_EMOJIS,
} as PickerProps;
