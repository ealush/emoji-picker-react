import * as React from 'react';

import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';

type Claim = { update: () => void; detached: () => boolean };

// Root node (a document or shadow root) → nonce and CSS text → mounted
// claims, in mount order. The first claim renders the style element; the rest render
// nothing. A page with a picker per message otherwise repeats the full
// library sheet once per picker.
const claimsByRoot = new WeakMap<Node, Map<string, Claim[]>>();

function claimsFor(root: Node, key: string): Claim[] {
  let byCss = claimsByRoot.get(root);
  if (!byCss) {
    byCss = new Map();
    claimsByRoot.set(root, byCss);
  }
  let claims = byCss.get(key);
  if (!claims) {
    claims = [];
    byCss.set(key, claims);
  }
  return claims;
}

/**
 * Renders `css` once per document or shadow root. Every instance renders
 * the element during SSR and its first client render, so hydration matches
 * the server markup; duplicates drop in a layout effect, before paint.
 * When the owner unmounts, the next instance renders the element in the
 * same commit. A different nonce or layer gets its own element: a style
 * allowed by one nonce must not stand in for another under CSP.
 */
export function DedupedStyle({ css, nonce }: { css: string; nonce?: string }) {
  const styleRef = React.useRef<HTMLStyleElement>(null);
  const rootRef = React.useRef<Node | null>(null);
  const [owner, setOwner] = React.useState(true);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current ?? styleRef.current?.getRootNode() ?? null;
    if (!root) {
      return;
    }
    rootRef.current = root;
    const key = `${nonce ?? ''}\n${css}`;
    const claims = claimsFor(root, key);
    const claim: Claim = {
      update: () => setOwner(claims[0] === claim),
      detached: () => styleRef.current?.isConnected === false,
    };
    // An owner whose element left the document without unmounting (its
    // container was removed by hand) cannot style anything: yield.
    const stale = claims.filter((each) => each.detached());
    claims.splice(
      0,
      claims.length,
      ...claims.filter((each) => !each.detached()),
      claim,
      ...stale,
    );
    claims.forEach((each) => each.update());

    return () => {
      claims.splice(claims.indexOf(claim), 1);
      if (claims.length) {
        claims.forEach((each) => each.update());
      } else {
        claimsByRoot.get(root)?.delete(key);
      }
    };
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
