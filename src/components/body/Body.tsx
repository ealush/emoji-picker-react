import { cx } from 'flairup';
import * as React from 'react';

import { ClassNames } from '../../DomUtils/classNames';
import {
  commonInteractionStyles,
  stylesheet
} from '../../Stylesheet/stylesheet';
import { MOUSE_EVENT_SOURCE } from '../../config/useConfig';
import { useOnMouseMove } from '../../hooks/useDisallowMouseMove';
import { useMouseDownHandlers } from '../../hooks/useMouseDownHandlers';
import { useOnScroll } from '../../hooks/useOnScroll';
import { useBodyRef } from '../context/ElementRefContext';

import { EmojiList } from './EmojiList';
import { EmojiVariationPicker } from './EmojiVariationPicker';

export function Body() {
  const BodyRef = useBodyRef();
  useOnScroll(BodyRef);
  useMouseDownHandlers(BodyRef, MOUSE_EVENT_SOURCE.PICKER);
  useOnMouseMove();

  return (
    <div
      className={cx(styles.body, commonInteractionStyles.hiddenOnReactions)}
      ref={BodyRef}
    >
      <EmojiVariationPicker />
      <EmojiList />
    </div>
  );
}

const styles = stylesheet.create({
  body: {
    '.': ClassNames.scrollBody,
    flex: '1',
    overflowY: 'scroll',
    overflowX: 'hidden',
    position: 'relative'
  }
});
