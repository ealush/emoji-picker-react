import * as React from 'react';
import { cx } from 'shipstyles';

import { stylesheet } from '../Stylesheet/stylesheet';
import { useSkinTonePickerRef } from '../components/context/ElementRefContext';
import {
  SkinTonePicker,
  SkinTonePickerDirection,
} from '../components/header/SkinTonePicker/SkinTonePicker';
import { useRegisterRegion } from '../hooks/useRegisterRegion';

import { filterPrimitiveProps } from './nativeProps';
import { useRootScope } from './scope';
import type { SkinToneProps } from './types';

// Place the shared skin-tone control anywhere inside Root. Presence and
// orientation belong to this part; Search and Preview never insert it.
export const SkinTone = /* @__PURE__ */ React.forwardRef<
  HTMLDivElement,
  SkinToneProps
>(function SkinTone(props, forwardedRef) {
  const inScope = useRootScope('SkinTone');
  const { orientation = 'horizontal', className, ...rest } = props;
  const nativeProps = filterPrimitiveProps(rest as Record<string, unknown>, [
    'role',
  ]);
  const SkinTonePickerRef = useSkinTonePickerRef();
  useRegisterRegion('preview-skin-tone', SkinTonePickerRef);

  if (!inScope) return null;

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
});

const ITEM_SIZE = 28;

const styles = /* @__PURE__ */ (() =>
  stylesheet.create({
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
      insetInlineEnd: '0',
    },
  }))();
