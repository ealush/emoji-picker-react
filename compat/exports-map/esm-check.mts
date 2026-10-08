import Picker from 'emoji-picker-react';
import * as Primitives from 'emoji-picker-react/primitives';
import { searchEmojis } from 'emoji-picker-react/data';
import type { EmojiData } from 'emoji-picker-react/data';
import es from 'emoji-picker-react/data/emojis-es';
import fr from 'emoji-picker-react/data/emojis-fr';
import esLegacy from 'emoji-picker-react/dist/data/emojis-es';

const a: EmojiData = es;
const b: EmojiData = fr;
const c: EmojiData = esLegacy;
void Picker;
void Primitives;
void searchEmojis;
void a;
void b;
void c;

// Design-system options survive the installed package declaration bundle.
import * as React from 'react';
const Input = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
    variant: 'quiet';
    size: 'sm';
  }
>(() => null);
const customInput: Primitives.SearchInputProps<typeof Input> = {
  as: Input,
  variant: 'quiet',
  size: 'sm',
};
const inputValue: Primitives.SearchInputProps<typeof Input> = {
  as: Input,
  variant: 'quiet',
  size: 'sm',
  // @ts-expect-error Root owns the search value, also for a custom input.
  value: 'face',
};
void customInput;
void inputValue;
