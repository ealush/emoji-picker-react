"use client";

import { useState } from "react";

import styles from "@/styles/DesignsSection.module.css";

import { DESIGN_EXAMPLES } from "./designs";

/**
 * Live, in-context design examples: the same picker composed and styled
 * for real product surfaces — chat, comments, dialogs, editors, mobile.
 * Each one is a Storybook recipe (stories/recipes) available in plain CSS,
 * CSS Modules, Emotion, styled-components, MUI, Tailwind and shadcn/ui.
 */
export function DesignsSection() {
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
          Fits any product, any design system
        </h2>
        <p className={styles.sectionSubtitle}>
          Ship it as-is, theme it with <code>--epr-*</code> variables, or go{" "}
          <code>unstyled</code> and compose the parts yourself. Style it with
          whatever your app already uses — CSS, CSS Modules, Emotion,
          styled-components, MUI, Tailwind or shadcn/ui.
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
      </div>
    </section>
  );
}
