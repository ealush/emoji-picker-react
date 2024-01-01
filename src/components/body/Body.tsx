import { cx } from 'flairup';
import * as React from 'react';

import { ClassNames } from '../../DomUtils/classNames';
import { sheet } from '../../DomUtils/stylesheet';
import { useOnMouseMove } from '../../hooks/useDisallowMouseMove';
import { useMouseDownHandlers } from '../../hooks/useMouseDownHandlers';
import { useOnScroll } from '../../hooks/useOnScroll';
import { useBodyRef } from '../context/ElementRefContext';

import { EmojiList } from './EmojiList';
import { EmojiVariationPicker } from './EmojiVariationPicker';

const styles = sheet.create({
  scrollBody: {
    '.': ClassNames.scrollBody,
    position: 'relative',
    flex: 1,
    overflowY: 'scroll',
    overflowX: 'hidden'
  }
});

export function Body() {
  const BodyRef = useBodyRef();
  useOnScroll(BodyRef);
  useMouseDownHandlers(BodyRef);
  useOnMouseMove();

  return (
    <div className={cx(styles.scrollBody)} ref={BodyRef}>
      <EmojiVariationPicker />
      <EmojiList />
    </div>
  );
}
