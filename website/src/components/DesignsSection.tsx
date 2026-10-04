'use client';

import { useEffect, useState } from 'react';

import styles from '@/styles/DesignsSection.module.css';

import { DESIGN_EXAMPLES } from './designs';

type SourceFile = { name: string; content: string };

function RecipeSource({ id }: { id: string }) {
  const [files, setFiles] = useState<SourceFile[] | null>(null);
  const [name, setName] = useState('emoji-picker.tsx');
  const [status, setStatus] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/emoji-picker-react/recipes/${id}.json`, {
      signal: controller.signal,
    })
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
 */
export function DesignsSection() {
  const [showSource, setShowSource] = useState(false);
  const [selected, setSelected] = useState(DESIGN_EXAMPLES[0].id);
  const example =
    DESIGN_EXAMPLES.find((design) => design.id === selected) ??
    DESIGN_EXAMPLES[0];
  const { Example } = example;

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
        <div
          className={styles.designTabs}
          role="tablist"
          aria-label="Design examples"
        >
          {DESIGN_EXAMPLES.map((design) => (
            <button
              key={design.id}
              type="button"
              role="tab"
              aria-selected={design.id === example.id}
              className={styles.designTab}
              onClick={() => setSelected(design.id)}
            >
              {design.title}
            </button>
          ))}
        </div>
        <p className={styles.designDescription}>{example.description}</p>
        <div className={styles.designStage} role="tabpanel">
          <Example key={example.id} className={example.rootClass} />
        </div>
        <button
          className={styles.designTab}
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
