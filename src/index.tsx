import { HTMLAttributes, ReactChild } from 'react';
import * as React from 'react';
import EmojiPickerMain from 'EmojiPickerMain';

export interface Props extends HTMLAttributes<HTMLDivElement> {
  /** custom content, defaults to 'the snozzberries taste like snozzberries' */
  children?: ReactChild;
}

// Please do not use types off of a default export module or else Storybook Docs will suffer.
// see: https://github.com/storybookjs/storybook/issues/9556
/**
 * A custom Thing component. Neat!
 */

export function Picker() {
  return (
    <EmojiPickerMain>
      <Header />
      <EmojiList />
    </EmojiPickerMain>
  );
}
