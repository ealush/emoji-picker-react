import * as React from 'react';

import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';

type Claim = { update: () => void; detached: () => boolean };

// Root node (a document or shadow root) → nonce and CSS text → mounted
// claims, in mount order. The first claim renders the style element; the
// rest render nothing. A page with a picker per message otherwise repeats
// the full library sheet once per picker.
const claimsByRoot = new WeakMap<Node, Record<string, Claim[]>>();

/**
 * Renders `css` once per document or shadow root. Every instance renders
 * the element during SSR and its first client render, so hydration matches
 * the server markup; duplicates drop right after the first paint.
 * When the owner unmounts, the next instance renders the element in the
 * same commit. A different nonce or layer gets its own element: a style
 * allowed by one nonce must not stand in for another under CSP.
 */
export function DedupedStyle({ css, nonce }: { css: string; nonce?: string }) {
  const styleRef = React.useRef<HTMLStyleElement>(null);
  const rootRef = React.useRef<Node | undefined>(undefined);
  const [owner, setOwner] = React.useState(true);

  const syncRef = React.useRef<(() => void) | undefined>(undefined);

  // Register in the commit that mounts the element, so ownership is known
  // before any later picker mounts. A sibling's ownership changes only on
  // unmount (below) and after paint: a state update during layout effects
  // would flush every pending passive effect into the mount, delaying the
  // first paint of the whole picker.
  useIsomorphicLayoutEffect(() => {
    const style = styleRef.current;
    const root = (rootRef.current =
      rootRef.current || (style ? style.getRootNode() : undefined));
    if (!root) {
      return;
    }
    const byKey = claimsByRoot.get(root) || {};
    claimsByRoot.set(root, byKey);
    const key = nonce + css;
    const claims = (byKey[key] = byKey[key] || []);
    const claim: Claim = {
      update: () => setOwner(claims[0] === claim),
      detached: () => !!styleRef.current && !styleRef.current.isConnected,
    };
    // An owner whose element left the document without unmounting (its
    // container was removed by hand) cannot style anything: it yields.
    const sync = (syncRef.current = () => {
      claims.sort((a, b) => +a.detached() - +b.detached());
      claims.forEach((each) => each.update());
    });
    claims.push(claim);

    return () => {
      syncRef.current = undefined;
      claims.splice(claims.indexOf(claim), 1);
      // The next picker takes over in this same commit: no unstyled frame.
      if (claims.length) {
        sync();
      } else {
        delete byKey[key];
      }
    };
  }, [css, nonce]);

  React.useEffect(() => {
    if (syncRef.current) syncRef.current();
  }, [css, nonce]);

  return owner ? (
    <style
      ref={styleRef}
      nonce={nonce}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: css }}
    />
  ) : null;
}
