import * as React from 'react';

import { Preview as PreviewView } from '../components/footer/Preview';
import { usePreviewConfig } from '../config/useConfig';
import { useSingletonClaim } from '../hooks/useRegisterRegion';

import { filterPrimitiveProps } from './nativeProps';
import { useRootScope } from './scope';
import type { PreviewProps } from './types';

// Public Preview primitive (docs/v5/PRIMITIVES.md §11).
//
// Managed preview region, including the preview-position skin-tone
// control. Renders nothing when preview is disabled.
export const Preview = React.forwardRef<HTMLDivElement, PreviewProps>(
  function Preview(props, forwardedRef) {
    useRootScope('Preview');
    useSingletonClaim('preview');
    const previewConfig = usePreviewConfig();
    const nativeProps = filterPrimitiveProps(
      props as Record<string, unknown>,
      ['role'],
    );

    if (!previewConfig.showPreview) {
      return null;
    }

    return (
      <div
        {...(nativeProps as React.HTMLAttributes<HTMLDivElement>)}
        ref={forwardedRef}
        data-epr-part="preview"
      >
        <PreviewView />
      </div>
    );
  },
);
