import * as React from 'react';
import { EmojiVariationPicker } from '../body/EmojiVariationPicker';
import Flex from '../Layout/Flex';
import Relative from '../Layout/Relative';
import './Header.css';
import { Search } from './Search';
import { SkinTonePicker } from './SkinTonePicker';

export function Header() {
  return (
    <Relative className="epr-header">
      <Flex>
        <Search />
        <SkinTonePicker />
      </Flex>
      <EmojiVariationPicker />
    </Relative>
  );
}
