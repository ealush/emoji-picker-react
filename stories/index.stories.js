import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';
import EmojiPicker from '../src';
import Dist from '../dist';

import { Button, Welcome } from '@storybook/react/demo';

storiesOf('EmojiPicker', module)
  .add('EmojiPicker', () => <EmojiPicker/>);
