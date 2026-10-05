import * as React from 'react';
import { cx } from 'shipstyles';

import { useReactionsModeState } from '../components/context/PickerContext';
import { useSingletonClaim } from '../hooks/useRegisterRegion';

import { filterPrimitiveProps, useMergedRefs } from './nativeProps';
import { useRootScope } from './scope';
import { structuralStyles } from './structuralStyles';

export type PanelProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'role' | 'hidden' | 'inert' | 'dangerouslySetInnerHTML'
>;

/** One full-picker panel; Root owns hidden/inert presence in reactions mode. */
const PanelImpl = /* @__PURE__ */ React.forwardRef<HTMLDivElement, PanelProps>(
  function Panel(allProps: PanelProps, ref) {
    const { children, className, style, ...props } = allProps;
    const inScope = useRootScope('Panel');
    useSingletonClaim('panel');
    const [hidden] = useReactionsModeState();
    const setInert = React.useCallback(
      (node: HTMLDivElement | null) => {
        if (!node) return;
        if (hidden) node.setAttribute('inert', '');
        else node.removeAttribute('inert');
      },
      [hidden],
    );
    const mergedRef = useMergedRefs(ref, setInert);
    if (!inScope) return null;
    return (
      <div
        {...filterPrimitiveProps(props, ['role', 'hidden', 'inert'])}
        ref={mergedRef}
        data-epr-part="panel"
        hidden={hidden}
        className={cx(structuralStyles.panel, className)}
        style={{ ...style, ...(hidden && { display: 'none' }) }}
      >
        {children}
      </div>
    );
  },
);
export const Panel = /* @__PURE__ */ React.memo(PanelImpl);
