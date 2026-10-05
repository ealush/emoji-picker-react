import * as React from 'react';
import { cx } from 'shipstyles';

import { stylesheet } from '../Stylesheet/stylesheet';
import { useLabels } from '../config/useConfig';
import { useIsEmojiDataLoading } from '../hooks/useResolvedEmojiData';

import { useDefaultAppearance } from './appearance';
import { filterPrimitiveProps } from './nativeProps';
import { useRootScope } from './scope';
import type { LoadingProps } from './types';

// Public Loading primitive: renders only while Root's emoji dataset is
// loading (an `emojiData` loader, or the lazily loaded default dataset in
// a primitives-only bundle). Without children it shows `labels.loading`.
export const Loading = /* @__PURE__ */ React.forwardRef<
  HTMLDivElement,
  LoadingProps
>(function Loading(props, forwardedRef) {
  const appearance = useDefaultAppearance();
  const inScope = useRootScope('Loading');
  const { children, className, ...rest } = props;
  const nativeProps = filterPrimitiveProps(rest as Record<string, unknown>, [
    'role',
  ]);
  const loading = useIsEmojiDataLoading();
  const labels = useLabels();

  if (!inScope || !loading) {
    return null;
  }

  return (
    <div
      {...(nativeProps as React.HTMLAttributes<HTMLDivElement>)}
      ref={forwardedRef}
      role="status"
      data-epr-part="loading"
      className={cx(styles.geometry, appearance && styles.loading, className)}
    >
      {children ?? labels.loading}
    </div>
  );
});

const styles = /* @__PURE__ */ (() =>
  stylesheet.create({
    geometry: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--epr-horizontal-padding)',
      minHeight: 'var(--epr-emoji-fullsize)',
    },
    loading: {
      '.': 'epr-loading',
      color: 'var(--epr-text-color)',
      fontSize: 'var(--epr-preview-text-size)',
    },
  }))();
