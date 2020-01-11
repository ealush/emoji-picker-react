declare module 'emoji-picker-react' {
  import React from "react";

  export const SKIN_TONE_NEUTRAL = 'neutral';
  export const SKIN_TONE_LIGHT = '1f3fb';
  export const SKIN_TONE_MEDIUM_LIGHT = '1f3fc';
  export const SKIN_TONE_MEDIUM = '1f3fe';
  export const SKIN_TONE_MEDIUM_DARK = '1f3ff';
  export const SKIN_TONE_DARK = '1f3fd';
  
  type SkinTones = SKIN_TONE_NEUTRAL | SKIN_TONE_LIGHT | SKIN_TONE_MEDIUM_LIGHT | SKIN_TONE_MEDIUM | SKIN_TONE_MEDIUM_DARK | SKIN_TONE_DARK;

  export interface IEmojiData {
    unified: string,
    originalUnified: string,
    names: Array<string>,
    emoji: string,
    activeSkinTone: SkinTones
  }

  export interface IEmojiPickerProps {
    onEmojiClick: (event: MouseEvent, data: IEmojiData) => void,
    emojiUrl?: string,
    preload?: boolean,
    skinTone?: SkinTones
  }

  const EmojiPicker: React.FC<IEmojiPickerProps> = (props: IEmojiPickerProps) => {};
  export default EmojiPicker;
}
