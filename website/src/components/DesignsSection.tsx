'use client';

import { useEffect, useRef, useState } from 'react';

import styles from '@/styles/DesignsSection.module.css';
import { writeToClipboard } from '@/lib/clipboard';

import { DESIGN_EXAMPLES } from './designs';
import { GalleryStage } from './GalleryPicker';

// GitHub Pages serves the site from this subpath; public assets need the
// prefix (next.config.js basePath applies to routes, not raw fetches).
const BASE = '/emoji-picker-react';

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'instant'
    : 'smooth';
}

type SourceFile = { name: string; content: string };

function readSourceFiles(result: unknown): SourceFile[] {
  const files = (result as { files?: unknown } | null)?.files;
  if (
    !Array.isArray(files) ||
    !files.length ||
    !files.every(
      (file) =>
        file &&
        typeof file.name === 'string' &&
        file.name.length > 0 &&
        typeof file.content === 'string',
    ) ||
    new Set(files.map((file) => file.name)).size !== files.length
  )
    throw new Error('Source unavailable');
  return files;
}

function RecipeSource({ id }: { id: string }) {
  const [files, setFiles] = useState<SourceFile[] | null>(null);
  const [name, setName] = useState('emoji-picker.tsx');
  const [status, setStatus] = useState('');
  const [failed, setFailed] = useState(false);
  const [request, setRequest] = useState(0);
  const copyAttempt = useRef(0);
  useEffect(() => {
    const controller = new AbortController();
    setFiles(null);
    setStatus('');
    setFailed(false);
    fetch(`${BASE}/recipes/${id}.json`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Source unavailable');
        return response.json();
      })
      .then(readSourceFiles)
      .then((nextFiles) => {
        if (controller.signal.aborted) return;
        setFiles(nextFiles);
        setName(
          nextFiles.some((file) => file.name === 'emoji-picker.tsx')
            ? 'emoji-picker.tsx'
            : nextFiles[0].name,
        );
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setFailed(true);
        setStatus('Source unavailable');
      });
    return () => {
      controller.abort();
      copyAttempt.current++;
    };
  }, [id, request]);
  const file = files?.find((file) => file.name === name);
  async function copy(content: string, message: string) {
    const attempt = ++copyAttempt.current;
    setStatus('');
    try {
      await writeToClipboard(content);
      if (attempt === copyAttempt.current) setStatus(message);
    } catch {
      if (attempt === copyAttempt.current)
        setStatus('Copy unavailable. Select the source or download it.');
    }
  }
  const prompt =
    files &&
    [
      `Implement the emoji-picker-react v5 picker "${id}" in my application.`,
      'First inspect my installed package version and framework. These files require v5; do not assume npm latest is v5. If v5 is unavailable, explain the required preview/local setup before changing dependencies.',
      'Use the following actual picker files as the implementation reference. Implement ONLY the emoji picker composition they describe: the picker parts, their arrangement, and the picker/panel styles. Do not rebuild any surrounding demo UI — no chat windows, messages, toolbars, dialogs, phones, or other app chrome; none is included below. Follow README.md for CSS imports and the PickerExample className. Wire onEmojiClick to insert the chosen emoji into my app; preserve managed search, keyboard navigation, focus restoration, selection, and accessibility.',
      'This is the plain CSS implementation. If my app uses another style system, translate its appearance without inventing library APIs or changing structural behavior. Report setup steps, changed files and verification instructions.',
      ...files.map((source) => `\n--- ${source.name} ---\n${source.content}`),
    ].join('\n\n');
  return (
    <div className={styles.sourcePanel}>
      <div className={styles.sourceActions}>
        <label className={styles.sourceField}>
          <span className={styles.sourceFieldLabel}>Source file</span>
          <select
            className={styles.sourceSelect}
            value={name}
            disabled={!files}
            onChange={(event) => {
              copyAttempt.current++;
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
          type="button"
          className={styles.actionButton}
          disabled={!file}
          onClick={() => file && copy(file.content, `Copied ${file.name}`)}
        >
          Copy
        </button>
        <button
          type="button"
          className={styles.actionButton}
          disabled={!prompt}
          onClick={() => prompt && copy(prompt, 'Copied implementation prompt')}
        >
          Copy implementation prompt
        </button>
        {file && (
          <a
            className={styles.actionButton}
            download={file.name}
            href={`data:text/plain;charset=utf-8,${encodeURIComponent(file.content)}`}
          >
            Download file
          </a>
        )}
        {failed && (
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => setRequest((value) => value + 1)}
          >
            Retry source
          </button>
        )}
      </div>
      <p role="status" className={styles.sourceStatus}>
        {status || (!files ? 'Loading source…' : '')}
      </p>
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
 *
 * Rendered inside the playground's Designs tab; the section wrapper below
 * keeps the standalone `#designs` anchor available.
 */
export function DesignsGallery() {
  const [showSource, setShowSource] = useState(false);
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const example = DESIGN_EXAMPLES[index];
  const { Example } = example;

  // Keep the selected card in view when selection changes by keyboard.
  const previousIndex = useRef(index);
  useEffect(() => {
    if (previousIndex.current === index) return;
    previousIndex.current = index;
    cardRefs.current[index]?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: scrollBehavior(),
    });
  }, [index]);

  function page(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * track.clientWidth * 0.8,
      behavior: scrollBehavior(),
    });
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
    <div className={styles.galleryEmbed}>
      <p className={styles.sectionSubtitle}>
        The same picker, composed and styled for real product surfaces. Theme
        it with <code>--epr-*</code> variables, or go <code>unstyled</code>{' '}
        and compose the parts yourself — every custom design example below
        is available in plain CSS, CSS Modules, Emotion, styled-components,
        MUI, Tailwind and shadcn/ui.
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
            aria-label="Custom design examples"
            onKeyDown={onKeyDown}
          >
            {DESIGN_EXAMPLES.map((design, i) => (
              <button
                key={design.id}
                id={`design-tab-${design.id}`}
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
        <GalleryStage
          key={`stage-${example.id}`}
          className={styles.designStage}
          labelledBy={`design-tab-${example.id}`}
        >
          <Example className={example.rootClass} />
        </GalleryStage>
        <button
          type="button"
          className={styles.codeButton}
          aria-expanded={showSource}
          onClick={() => setShowSource((value) => !value)}
        >
          {showSource ? 'Hide source' : 'Get the code'}
        </button>
        {showSource && (
          <RecipeSource key={`source-${example.id}`} id={example.id} />
        )}
    </div>
  );
}

export function DesignsSection() {
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
        <DesignsGallery />
      </div>
    </section>
  );
}
