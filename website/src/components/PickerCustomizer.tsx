"use client";

import Picker from "emoji-picker-react";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/PickerCustomizer.module.css";

// The class the generated CSS targets. Tokens are declared by the library
// at zero specificity, so one class on `className` is all an override needs.
const PICKER_CLASS = "my-picker";

type Variable = { label: string; name: string; value: string };
type Group = { title: string; items: Variable[] };

const GROUPS: Group[] = [
  {
    title: "General",
    items: [
      { label: "Font family", name: "--epr-font-family", value: "sans-serif" },
      { label: "Emoji size", name: "--epr-emoji-size", value: "30px" },
      { label: "Emoji padding", name: "--epr-emoji-padding", value: "5px" },
      { label: "Background", name: "--epr-bg-color", value: "#ffffff" },
      { label: "Text", name: "--epr-text-color", value: "#6b6b6b" },
      { label: "Border", name: "--epr-picker-border-color", value: "#e7e7e7" },
      {
        label: "Border radius",
        name: "--epr-picker-border-radius",
        value: "8px",
      },
      {
        label: "Horizontal padding",
        name: "--epr-horizontal-padding",
        value: "10px",
      },
      { label: "Highlight", name: "--epr-highlight-color", value: "#007aeb" },
      {
        label: "Hover background",
        name: "--epr-hover-bg-color",
        value: "#e5f0fa",
      },
      {
        label: "Focus background",
        name: "--epr-focus-bg-color",
        value: "#e0f0ff",
      },
    ],
  },
  {
    title: "Search",
    items: [
      {
        label: "Background",
        name: "--epr-search-input-bg-color",
        value: "#f6f6f6",
      },
      {
        label: "Background (active)",
        name: "--epr-search-input-bg-color-active",
        value: "var(--epr-search-input-bg-color)",
      },
      {
        label: "Text",
        name: "--epr-search-input-text-color",
        value: "var(--epr-text-color)",
      },
      {
        label: "Placeholder",
        name: "--epr-search-input-placeholder-color",
        value: "var(--epr-text-color)",
      },
      {
        label: "Border",
        name: "--epr-search-border-color",
        value: "var(--epr-search-input-bg-color)",
      },
      {
        label: "Border (active)",
        name: "--epr-search-border-color-active",
        value: "var(--epr-highlight-color)",
      },
      {
        label: "Border radius",
        name: "--epr-search-input-border-radius",
        value: "8px",
      },
      { label: "Height", name: "--epr-search-input-height", value: "40px" },
    ],
  },
  {
    title: "Category navigation",
    items: [
      {
        label: "Button size",
        name: "--epr-category-navigation-button-size",
        value: "30px",
      },
      {
        label: "Active icon",
        name: "--epr-category-icon-active-color",
        value: "#3371b7",
      },
      {
        label: "Inactive icon",
        name: "--epr-category-icon-inactive-color",
        value: "#868686",
      },
    ],
  },
  {
    title: "Category labels",
    items: [
      {
        label: "Background",
        name: "--epr-category-label-bg-color",
        value: "#ffffffe6",
      },
      {
        label: "Text",
        name: "--epr-category-label-text-color",
        value: "var(--epr-text-color)",
      },
      { label: "Height", name: "--epr-category-label-height", value: "40px" },
    ],
  },
  {
    title: "Preview",
    items: [
      { label: "Height", name: "--epr-preview-height", value: "70px" },
      { label: "Emoji size", name: "--epr-preview-emoji-size", value: "45px" },
      { label: "Text size", name: "--epr-preview-text-size", value: "14px" },
      {
        label: "Text",
        name: "--epr-preview-text-color",
        value: "var(--epr-text-color)",
      },
    ],
  },
  {
    title: "Skin tones",
    items: [
      {
        label: "Menu background",
        name: "--epr-skin-tone-picker-menu-color",
        value: "#ffffff95",
      },
      { label: "Swatch size", name: "--epr-skin-tone-size", value: "15px" },
    ],
  },
  {
    title: "Dark mode",
    items: [
      { label: "Background", name: "--epr-dark-bg-color", value: "#222222" },
      {
        label: "Border",
        name: "--epr-dark-picker-border-color",
        value: "#151617",
      },
      {
        label: "Text",
        name: "--epr-dark-text-color",
        value: "var(--epr-highlight-color)",
      },
      {
        label: "Search background",
        name: "--epr-dark-search-input-bg-color",
        value: "#333333",
      },
      {
        label: "Hover background",
        name: "--epr-dark-hover-bg-color",
        value: "#363636f6",
      },
    ],
  },
];

const DEFAULTS: Record<string, string> = Object.fromEntries(
  GROUPS.flatMap((group) => group.items.map((item) => [item.name, item.value])),
);

type Preset = {
  name: string;
  swatches: string[];
  values: Record<string, string>;
};

// Starting points: each sets a handful of variables. Everything else stays
// at its default, so the generated CSS stays as short as the design needs.
const PRESETS: Preset[] = [
  { name: "Default", swatches: ["#ffffff", "#007aeb", "#e5f0fa"], values: {} },
  {
    name: "Indigo",
    swatches: ["#ffffff", "#4f46e5", "#eef2ff"],
    values: {
      "--epr-highlight-color": "#4f46e5",
      "--epr-dark-text-color": "#c7d2fe",
      "--epr-search-input-text-color": "#4f46e5",
      "--epr-search-input-placeholder-color": "#4f46e5",
      "--epr-hover-bg-color": "#eef2ff",
      "--epr-focus-bg-color": "#e0e7ff",
      "--epr-category-icon-active-color": "#4f46e5",
      "--epr-search-input-bg-color": "#f5f3ff",
      "--epr-picker-border-color": "#e0e7ff",
      "--epr-picker-border-radius": "16px",
    },
  },
  {
    name: "Forest",
    swatches: ["#f4f7f2", "#2f6f4e", "#dcebe0"],
    values: {
      "--epr-bg-color": "#f4f7f2",
      "--epr-category-label-bg-color": "#f4f7f2e6",
      "--epr-text-color": "#3d5a47",
      "--epr-highlight-color": "#2f6f4e",
      "--epr-hover-bg-color": "#dcebe0",
      "--epr-focus-bg-color": "#cfe3d5",
      "--epr-search-input-bg-color": "#e7efe8",
      "--epr-picker-border-color": "#cfe3d5",
      "--epr-category-icon-active-color": "#2f6f4e",
      "--epr-category-icon-inactive-color": "#8aa893",
    },
  },
  {
    name: "Candy",
    swatches: ["#fff4f8", "#e11d74", "#fde2ee"],
    values: {
      "--epr-bg-color": "#fff4f8",
      "--epr-category-label-bg-color": "#fff4f8e6",
      "--epr-text-color": "#8a2a56",
      "--epr-highlight-color": "#e11d74",
      "--epr-hover-bg-color": "#fde2ee",
      "--epr-focus-bg-color": "#fbcfe0",
      "--epr-search-input-bg-color": "#fde2ee",
      "--epr-search-border-color": "#f9b8d2",
      "--epr-picker-border-color": "#f9b8d2",
      "--epr-picker-border-radius": "20px",
      "--epr-category-icon-active-color": "#e11d74",
      "--epr-category-icon-inactive-color": "#d08aa8",
      "--epr-emoji-size": "26px",
    },
  },
  {
    name: "Mono",
    swatches: ["#ffffff", "#111111", "#f2f2f2"],
    values: {
      "--epr-text-color": "#555555",
      "--epr-highlight-color": "#111111",
      "--epr-hover-bg-color": "#f2f2f2",
      "--epr-focus-bg-color": "#e8e8e8",
      "--epr-search-input-bg-color": "#ffffff",
      "--epr-search-border-color": "#dddddd",
      "--epr-search-border-color-active": "#111111",
      "--epr-picker-border-color": "#dddddd",
      "--epr-picker-border-radius": "4px",
      "--epr-search-input-border-radius": "4px",
      "--epr-category-icon-active-color": "#111111",
      "--epr-category-icon-inactive-color": "#a3a3a3",
      "--epr-font-family": "ui-monospace, SFMono-Regular, Menlo, monospace",
    },
  },
];

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

// The native color input only takes six-digit hex: expand shorthand and
// drop an alpha channel.
function toInputColor(value: string): string {
  if (!HEX.test(value)) return "#000000";
  const hex = value.slice(1);
  if (hex.length === 3)
    return `#${hex
      .split("")
      .map((c) => c + c)
      .join("")}`;
  return `#${hex.slice(0, 6)}`;
}

type Scheme = "light" | "dark" | "auto";

export function PickerCustomizer() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [scheme, setScheme] = useState<Scheme>("light");
  const [copied, setCopied] = useState<"css" | "jsx" | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyAttempt = useRef(0);
  useEffect(
    () => () => {
      copyAttempt.current++;
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  // The engine measures cell geometry on mount. Recreate only the preview
  // when a size/spacing token changes; palette edits retain its search/state.
  const geometryKey = JSON.stringify(
    Object.entries(values).filter(([name]) =>
      /(?:size|padding|height)$/.test(name),
    ),
  );

  const changed = useMemo(
    () =>
      Object.entries(values).filter(
        ([name, value]) => value.trim() !== "" && value !== DEFAULTS[name],
      ),
    [values],
  );

  const activePreset =
    PRESETS.find(
      (preset) =>
        Object.keys(preset.values).length === changed.length &&
        changed.every(([name, value]) => preset.values[name] === value),
    )?.name ?? null;

  const css = changed.length
    ? [
        `.${PICKER_CLASS} {`,
        ...changed.map(([n, v]) => `  ${n}: ${v};`),
        "}",
        "",
      ].join("\n")
    : `.${PICKER_CLASS} {\n  /* Change a variable to see it here */\n}\n`;
  const jsx = `<EmojiPicker className="${PICKER_CLASS}"${scheme === "light" ? "" : ` colorScheme="${scheme}"`} />`;

  async function copy(kind: "css" | "jsx", text: string) {
    const attempt = ++copyAttempt.current;
    if (copyTimer.current) clearTimeout(copyTimer.current);
    setCopied(null);
    try {
      await navigator.clipboard.writeText(text);
      if (attempt !== copyAttempt.current) return;
      setCopied(kind);
      setCopyStatus(`Copied ${kind.toUpperCase()}`);
      copyTimer.current = setTimeout(() => {
        setCopied(null);
        setCopyStatus("");
      }, 1500);
    } catch {
      if (attempt !== copyAttempt.current) return;
      setCopyStatus("Copy unavailable. Select the code and copy it manually.");
    }
  }

  function setValue(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function resetValue(name: string) {
    setValues((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  return (
    <div className={styles.customizer}>
      <style>{css}</style>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Theme the built-in look</h3>
          <p className={styles.hint}>
            Every change becomes one <code>--epr-*</code> variable on a class
            you pass to <code>className</code>. Variables theme the default
            picker; with <code>unstyled</code> or a bare primitives{" "}
            <code>Root</code> you style the parts directly instead.
          </p>
        </div>
      </div>

      <div className={styles.presets} role="group" aria-label="Presets">
        <span className={styles.presetsLabel}>Start from</span>
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            className={styles.preset}
            aria-pressed={activePreset === preset.name}
            onClick={() => setValues(preset.values)}
          >
            <span className={styles.swatches} aria-hidden>
              {preset.swatches.map((color) => (
                <span key={color} style={{ background: color }} />
              ))}
            </span>
            {preset.name}
          </button>
        ))}
      </div>

      <div className={styles.body}>
        <div
          className={styles.form}
          role="region"
          aria-label="Theme variables"
          tabIndex={0}
        >
          {GROUPS.map((group) => {
            const changedInGroup = group.items.filter(({ name }) =>
              changed.some(([n]) => n === name),
            ).length;
            return (
              <section key={group.title} className={styles.group}>
                <h4 className={styles.groupTitle}>
                  {group.title}
                  <span className={styles.groupCount}>
                    {changedInGroup ? `${changedInGroup} changed` : ""}
                  </span>
                </h4>
                {group.items.map((item) => {
                  const value = values[item.name] ?? item.value;
                  const isChanged = changed.some(([n]) => n === item.name);
                  const isColor = HEX.test(item.value);
                  return (
                    <div
                      key={item.name}
                      className={`${styles.row} ${isChanged ? styles.rowChanged : ""}`}
                    >
                      <label
                        className={styles.label}
                        htmlFor={`cv-${item.name}`}
                      >
                        {item.label}
                      </label>
                      <span className={styles.token} title={item.name}>
                        {item.name}
                      </span>
                      <div className={styles.control}>
                        {isColor && (
                          <span className={styles.colorWell}>
                            <span style={{ background: value }} />
                            <input
                              type="color"
                              aria-label={`${group.title} ${item.label} color`}
                              value={toInputColor(value)}
                              onChange={(event) =>
                                setValue(item.name, event.target.value)
                              }
                            />
                          </span>
                        )}
                        <input
                          id={`cv-${item.name}`}
                          className={styles.text}
                          type="text"
                          aria-label={`${group.title}: ${item.label}`}
                          value={value}
                          spellCheck={false}
                          onChange={(event) =>
                            setValue(item.name, event.target.value)
                          }
                        />
                        <button
                          type="button"
                          className={styles.reset}
                          aria-label={`Reset ${item.label}`}
                          title="Reset to default"
                          onClick={() => resetValue(item.name)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
              </section>
            );
          })}
        </div>

        <div className={styles.preview}>
          <div className={styles.previewBar}>
            <span className={styles.previewTitle}>Live preview</span>
            <div
              className={styles.segmented}
              role="group"
              aria-label="Color scheme"
            >
              {(["light", "dark", "auto"] as Scheme[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={scheme === option}
                  onClick={() => setScheme(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.stage} data-scheme={scheme}>
            <Picker
              key={geometryKey}
              className={PICKER_CLASS}
              colorScheme={scheme}
              height={380}
              width="100%"
              style={{ maxWidth: 320 }}
              columns={7}
              autoFocusSearch={false}
              previewConfig={{
                defaultEmoji: "1f3a8",
                defaultCaption: "Make it yours",
              }}
            />
          </div>
          <p
            role="status"
            aria-label="Copy status"
            className={styles.copyStatus}
          >
            {copyStatus}
          </p>
          <div className={styles.output}>
            <div className={styles.outputBlock}>
              <div className={styles.outputHeader}>
                <span>CSS</span>
                <button
                  type="button"
                  className={styles.copy}
                  onClick={() => copy("css", css)}
                >
                  {copied === "css" ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className={styles.code} tabIndex={0}>
                <code>
                  {`.${PICKER_CLASS} {\n`}
                  {changed.length === 0 ? (
                    <span className={styles.codeComment}>
                      {"  /* Change a variable to see it here */\n"}
                    </span>
                  ) : (
                    changed.map(([name, value]) => (
                      <span key={name}>
                        {"  "}
                        <span className={styles.codeVar}>{name}</span>
                        {": "}
                        <span className={styles.codeValue}>{value}</span>
                        {";\n"}
                      </span>
                    ))
                  )}
                  {"}"}
                </code>
              </pre>
            </div>
            <div className={styles.outputBlock}>
              <div className={styles.outputHeader}>
                <span>JSX</span>
                <button
                  type="button"
                  className={styles.copy}
                  onClick={() => copy("jsx", jsx)}
                >
                  {copied === "jsx" ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className={styles.code} tabIndex={0}>
                <code>{jsx}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
