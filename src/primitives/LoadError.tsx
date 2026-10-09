import * as React from 'react';

import { useLabels } from '../config/useConfig';
import { useEmojiDataState } from '../hooks/useResolvedEmojiData';

import { filterPrimitiveProps } from './nativeProps';
import { useRootScope } from './scope';
import type { LoadErrorProps } from './types';

/** Recoverable dataset failure; custom children receive error and retry. */
export const LoadError = /* @__PURE__ */ React.forwardRef<
  HTMLDivElement,
  LoadErrorProps
>(function LoadError({ children, ...props }, ref) {
  const inScope = useRootScope('LoadError');
  const { error, retry } = useEmojiDataState();
  const labels = useLabels();
  if (!inScope || !error) return null;
  return (
    <div
      {...filterPrimitiveProps(props, ['role'])}
      ref={ref}
      role="alert"
      data-epr-part="load-error"
    >
      {typeof children === 'function'
        ? children({ error, retry })
        : (children ?? (
            <>
              <p>{labels.loadingError}</p>
              <button type="button" onClick={retry}>
                {labels.retryLoading}
              </button>
            </>
          ))}
    </div>
  );
});
