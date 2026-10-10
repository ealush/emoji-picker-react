import * as React from 'react';

import { Preview as PreviewView } from '../components/footer/Preview';
import { useSingletonClaim } from '../hooks/useRegisterRegion';

import { filterPrimitiveProps } from './nativeProps';
import { useRootScope } from './scope';
import type { PreviewProps } from './types';

// Public Preview primitive.
//
// Managed preview region. Additional controls are supplied as children;
// omit Preview itself to omit the preview region.
export const Preview = /* @__PURE__ */ React.forwardRef<
  HTMLDivElement,
  PreviewProps
>(function Preview(props, forwardedRef) {
  const inScope = useRootScope('Preview');
  useSingletonClaim('preview');
  const { children, ...rest } = props;
  const nativeProps = filterPrimitiveProps(rest as Record<string, unknown>, [
    'role',
  ]);

  if (!inScope) {
    return null;
  }

  return (
    <div
      {...(nativeProps as React.HTMLAttributes<HTMLDivElement>)}
      ref={forwardedRef}
      data-epr-part="preview"
    >
      <PreviewView>{children}</PreviewView>
    </div>
  );
});
