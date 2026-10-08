import { useState } from 'react';

import { BatteriesIncluded } from './examples/BatteriesIncluded';
import { Composed } from './examples/Composed';
import { DataApi } from './examples/DataApi';
import { Unstyled } from './examples/Unstyled';

const EXAMPLES = [
  {
    id: 'batteries',
    title: 'Batteries included',
    summary:
      'One component, no CSS import. Theme the built-in look with colorScheme and --epr-* variables.',
    Example: BatteriesIncluded,
  },
  {
    id: 'unstyled',
    title: 'Unstyled',
    summary:
      'The supplied layout and behavior with every decorative style removed. Your CSS styles the [data-epr-part] selectors.',
    Example: Unstyled,
  },
  {
    id: 'composed',
    title: 'Composed',
    summary:
      'Your own layout from emoji-picker-react/primitives: your input, cells, headers, preview and controls. The engine keeps keyboard, ARIA and virtualization.',
    Example: Composed,
  },
  {
    id: 'data',
    title: 'Data API',
    summary:
      'Framework-free search and lookup from emoji-picker-react/data, usable on the server or in a worker.',
    Example: DataApi,
  },
] as const;

type ExampleId = (typeof EXAMPLES)[number]['id'];

export function App() {
  const [selected, setSelected] = useState<ExampleId>('batteries');
  const [log, setLog] = useState<string[]>([]);
  const example = EXAMPLES.find((entry) => entry.id === selected)!;
  const { Example } = example;

  function record(message: string) {
    setLog((entries) => [message, ...entries].slice(0, 8));
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>emoji-picker-react</h1>
        <p>
          Batteries included, or bring your own design. Every tab below is the
          same engine.
        </p>
        <nav className="app-tabs" aria-label="Examples">
          {EXAMPLES.map((entry) => (
            <button
              key={entry.id}
              type="button"
              aria-pressed={entry.id === selected}
              onClick={() => setSelected(entry.id)}
            >
              {entry.title}
            </button>
          ))}
        </nav>
        <p className="app-summary">{example.summary}</p>
      </header>

      <section className="app-stage" aria-label={example.title}>
        <Example key={example.id} onPick={record} />
      </section>

      <aside className="app-log" aria-label="Selections">
        <h2>Selections</h2>
        {log.length === 0 ? (
          <p>Pick an emoji to see its payload here.</p>
        ) : (
          <ol>
            {log.map((entry, index) => (
              <li key={`${index}-${entry}`}>
                <code>{entry}</code>
              </li>
            ))}
          </ol>
        )}
      </aside>
    </main>
  );
}
