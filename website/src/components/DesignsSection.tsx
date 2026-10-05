'use client';

import { useEffect, useRef, useState } from 'react';

import styles from '@/styles/DesignsSection.module.css';

import { DESIGN_EXAMPLES } from './designs';

// GitHub Pages serves the site from this subpath; public assets need the
// prefix (next.config.js basePath applies to routes, not raw fetches).
const BASE = '/emoji-picker-react';

type SourceFile = { name: string; content: string };

function RecipeSource({ id }: { id: string }) {
  const [files, setFiles] = useState<SourceFile[] | null>(null);
  const [name, setName] = useState('emoji-picker.tsx');
  const [status, setStatus] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${BASE}/recipes/${id}.json`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Source unavailable');
        return response.json();
      })
      .then((result) => setFiles(result.files))
      .catch((error) => {
        if (!controller.signal.aborted) setStatus(error.message);
      });
    return () => controller.abort();
  }, [id]);
  const file = files?.find((file) => file.name === name);
  return (
    <div className={styles.sourcePanel}>
      <div className={styles.sourceActions}>
        <label>
          Source file{' '}
          <select
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setStatus('');
            }}
          >
            {(files ?? [{ name: 'emoji-picker.tsx' }]).map((file) => (
              <option key={file.name}>{file.name}</option>
            ))}
          </select>
        </label>
        <button
          disabled={!file}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(file!.content);
              setStatus('Copied');
            } catch {
              setStatus('Copy unavailable. Select the source or download it.');
            }
          }}
        >
          Copy
        </button>
        {file && (
          <a
            download={file.name}
            href={`data:text/plain;charset=utf-8,${encodeURIComponent(file.content)}`}
          >
            Download file
          </a>
        )}
      </div>
      <p role="status">{status || (!files ? 'Loading source…' : '')}</p>
      <pre tabIndex={0} aria-label={`${name} source`}>
        <code>{file?.content}</code>
      </pre>
    </div>
  );
}

/**
 * Live, in-context design examples: the same picker composed and styled
 * for real product surfaces — chat, comments, dialogs, editors, mobile.
 * Each one is a Storybook recipe (stories/recipes) available in plain CSS,
 * CSS Modules, Emotion, styled-components, MUI, Tailwind and shadcn/ui.
 * The selector is a thumbnail carousel: scroll, page with the arrows, or
 * use the arrow keys on a focused card.
 */
export function DesignsSection() {
  const [showSource, setShowSource] = useState(false);
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const example = DESIGN_EXAMPLES[index];
  const { Example } = example;

  // Keep the selected card in view when selection changes by keyboard.
  useEffect(() => {
    cardRefs.current[index]?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'smooth',
    });
  }, [index]);

  function page(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' });
  }

  function select(next: number, focus = false) {
    const clamped = (next + DESIGN_EXAMPLES.length) % DESIGN_EXAMPLES.length;
    setIndex(clamped);
    if (focus) cardRefs.current[clamped]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const keys: Record<string, () => void> = {
      ArrowRight: () => select(index + 1, true),
      ArrowLeft: () => select(index - 1, true),
      Home: () => select(0, true),
      End: () => select(DESIGN_EXAMPLES.length - 1, true),
    };
    const handler = keys[event.key];
    if (handler) {
      event.preventDefault();
      handler();
    }
  }

  return (
    <section
      id="designs"
      className={styles.designsSection}
      aria-labelledby="designs-title"
    >
      <div className={styles.designsContent}>
        <h2 id="designs-title" className={styles.sectionTitle}>
          Bring your own style system
        </h2>
        <p className={styles.sectionSubtitle}>
          Plug and play by default — or make it yours. Theme it with{' '}
          <code>--epr-*</code> variables, or go <code>unstyled</code> and
          compose the parts yourself, styled with whatever your app already
          uses: CSS, CSS Modules, Emotion, styled-components, MUI, Tailwind or
          shadcn/ui. Every design below is the same picker — try them.
        </p>

        <div className={styles.carousel}>
          <button
            type="button"
            className={styles.arrow}
            aria-label="Scroll designs left"
            onClick={() => page(-1)}
          >
            ‹
          </button>
          <div
            ref={trackRef}
            className={styles.track}
            role="tablist"
            aria-label="Design examples"
            onKeyDown={onKeyDown}
          >
            {DESIGN_EXAMPLES.map((design, i) => (
              <button
                key={design.id}
                ref={(node) => {
                  cardRefs.current[i] = node;
                }}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-controls="design-stage"
                tabIndex={i === index ? 0 : -1}
                className={styles.card}
                onClick={() => select(i)}
              >
                <img
                  className={styles.thumb}
                  src={`${BASE}/designs/${design.id}.png`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <span className={styles.cardTitle}>{design.title}</span>
                <span className={styles.cardKind}>{design.kind}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className={styles.arrow}
            aria-label="Scroll designs right"
            onClick={() => page(1)}
          >
            ›
          </button>
        </div>

        <p className={styles.meta}>
          <span className={styles.counter}>
            {index + 1} / {DESIGN_EXAMPLES.length}
          </span>
          <span>{example.description}</span>
        </p>
        <div id="design-stage" className={styles.designStage} role="tabpanel">
          <Example key={example.id} className={example.rootClass} />
        </div>
        <button
          type="button"
          className={styles.codeButton}
          aria-expanded={showSource}
          onClick={() => setShowSource((value) => !value)}
        >
          {showSource ? 'Hide source' : 'Get the code'}
        </button>
        {showSource && <RecipeSource key={example.id} id={example.id} />}
      </div>
    </section>
  );
}
