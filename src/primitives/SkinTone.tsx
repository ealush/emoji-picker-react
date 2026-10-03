import * as React from 'react';
import { cx } from 'shipstyles';

import { stylesheet } from '../Stylesheet/stylesheet';
import { useSkinTonePickerRef } from '../components/context/ElementRefContext';
import {
  SkinTonePicker,
  SkinTonePickerDirection,
} from '../components/header/SkinTonePicker/SkinTonePicker';
import {
  useSkinTonePickerLocationConfig,
  useSkinTonesDisabledConfig,
} from '../config/useConfig';
import { useRegisterRegion } from '../hooks/useRegisterRegion';
import { SkinTonePickerLocation } from '../types/exposedTypes';

import { filterPrimitiveProps } from './nativeProps';
import { useRootScope } from './scope';
import type { SkinToneProps } from './types';

/* global process: readonly */

// Public SkinTone primitive: the library's skin tone control, placed
// anywhere inside Root. It is the same managed control the Search and
// Preview placements render (keyboard, focus region, onSkinToneChange), so
// only one may exist per Root: set `skinTonePickerLocation="NONE"` to turn
// the built-in placement off. Renders nothing when skin tones are disabled.
//
// `orientation` sets the axis the tones fan out along: horizontal expands to
// the start side (fits a trailing slot in a toolbar), vertical expands
// upward (fits a footer).
export const SkinTone = React.forwardRef<HTMLDivElement, SkinToneProps>(
  function SkinTone(props, forwardedRef) {
    const inScope = useRootScope('SkinTone');
    const { orientation = 'horizontal', className, ...rest } = props;
    const nativeProps = filterPrimitiveProps(
      rest as Record<string, unknown>,
      ['role'],
    );
    const disabled = useSkinTonesDisabledConfig();
    const location = useSkinTonePickerLocationConfig();
    const SkinTonePickerRef = useSkinTonePickerRef();
    useRegisterRegion('preview-skin-tone', SkinTonePickerRef, [disabled]);

    if (
      process.env.NODE_ENV !== 'production' &&
      location !== SkinTonePickerLocation.NONE
    ) {
      warnBuiltInPlacement();
    }

    if (!inScope || disabled) {
      return null;
    }

    const vertical = orientation === 'vertical';

    return (
      <div
        {...(nativeProps as React.HTMLAttributes<HTMLDivElement>)}
        ref={forwardedRef}
        className={cx(
          vertical ? styles.verticalHost : styles.horizontalHost,
          className,
        )}
      >
        {vertical ? (
          <div className={cx(styles.verticalAnchor)}>
            <SkinTonePicker direction={SkinTonePickerDirection.VERTICAL} />
          </div>
        ) : (
          <SkinTonePicker direction={SkinTonePickerDirection.HORIZONTAL} />
        )}
      </div>
    );
  },
);

let warned = false;
function warnBuiltInPlacement() {
  if (warned) {
    return;
  }
  warned = true;
  // eslint-disable-next-line no-console
  console.warn(
    '[emoji-picker-react] <SkinTone> is rendered while ' +
      'skinTonePickerLocation places the built-in control too. Set ' +
      'skinTonePickerLocation="NONE" so only one skin tone control exists.',
  );
}

const ITEM_SIZE = 28;

const styles = stylesheet.create({
  horizontalHost: {
    '.': 'epr-skin-tone-host',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  verticalHost: {
    '.': 'epr-skin-tone-host-vertical',
    position: 'relative',
    height: `${ITEM_SIZE}px`,
    width: `${ITEM_SIZE}px`,
  },
  verticalAnchor: {
    position: 'absolute',
    bottom: '0',
    right: '0',
  },
});
