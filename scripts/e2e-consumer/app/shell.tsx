import * as React from 'react';

import type { EmojiClickData } from 'emoji-picker-react';

// Page chrome shared by the ESM (Vite) and CommonJS (require) consumers:
// a caption naming the scenario, the selection log the specs assert on, and
// the packed artifact the page was built from, so a recording is
// self-describing.

export type PackManifest = {
  version: string;
  tarball: string;
  packedBytes: number;
  unpackedBytes: number;
  files: number;
};

export function nonceFromDocument(): string | undefined {
  const content = document
    .querySelector<HTMLMetaElement>('meta[name="csp-nonce"]')
    ?.getAttribute('content');
  return content && content !== '__CSP_NONCE__' ? content : undefined;
}

function megabytes(bytes: number): string {
  return `${(bytes / 1e6).toFixed(1)} MB`;
}

export function useSelectionLog() {
  const [picked, setPicked] = React.useState<EmojiClickData[]>([]);
  const onPick = React.useCallback((emoji: EmojiClickData) => {
    setPicked((previous) => [emoji, ...previous].slice(0, 6));
  }, []);
  return { picked, onPick };
}

export function Shell({
  title,
  detail,
  picked,
  aside,
  children,
}: {
  title: string;
  detail: string;
  picked: EmojiClickData[];
  /** Replaces the selection log (a page that reports selections itself). */
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [manifest, setManifest] = React.useState<PackManifest | null>(null);
  React.useEffect(() => {
    fetch('./e2e-manifest.json')
      .then((response) => response.json())
      .then(setManifest, () => setManifest(null));
  }, []);

  const latest = picked[0];
  return (
    <main>
      <header>
        <h1>{title}</h1>
        <p>{detail}</p>
      </header>
      <section aria-label="Picker">{children}</section>
      <aside>
        {aside ?? (
          <>
            <h2>Selected</h2>
            <output data-testid="selected">
              {latest
                ? `${latest.emoji} U+${latest.unified.toUpperCase()}`
                : '—'}
            </output>
            <ol data-testid="history">
              {picked.map((emoji, index) => (
                <li key={index}>
                  {emoji.emoji} <code>{emoji.unified}</code>
                </li>
              ))}
            </ol>
          </>
        )}
      </aside>
      <footer data-testid="artifact">
        {manifest
          ? `Installed from ${manifest.tarball}: ${megabytes(
              manifest.packedBytes,
            )} packed, ${megabytes(manifest.unpackedBytes)} unpacked, ${
              manifest.files
            } files. Served under a strict CSP (nonce, no unsafe-inline, no third-party origins).`
          : 'Loading artifact details…'}
      </footer>
    </main>
  );
}
