"use client";

import Picker, { Theme } from "emoji-picker-react";
import React, { useMemo, useState } from "react";
import styles from "@/styles/PickerCustomizer.module.css";

const variableSections = [
  {
    title: "General",
    items: [
      {
        label: "Emoji size",
        variable: "--epr-emoji-size",
        defaultValue: "30px",
      },
      {
        label: "Emoji padding",
        variable: "--epr-emoji-padding",
        defaultValue: "5px",
      },
      {
        label: "Picker background color",
        variable: "--epr-bg-color",
        defaultValue: "#fff",
      },
      {
        label: "Text color",
        variable: "--epr-text-color",
        defaultValue: "#858585",
      },
      {
        label: "Picker border color",
        variable: "--epr-picker-border-color",
        defaultValue: "#e7e7e7",
      },
      {
        label: "Picker border radius",
        variable: "--epr-picker-border-radius",
        defaultValue: "8px",
      },
      {
        label: "Horizontal padding",
        variable: "--epr-horizontal-padding",
        defaultValue: "10px",
      },
      {
        label: "Highlight color",
        variable: "--epr-highlight-color",
        defaultValue: "#007aeb",
      },
      {
        label: "Hover background color",
        variable: "--epr-hover-bg-color",
        defaultValue: "#e5f0fa",
      },
      {
        label: "Focus background color",
        variable: "--epr-focus-bg-color",
        defaultValue: "#e0f0ff",
      },
    ],
  },
  {
    title: "Search input",
    items: [
      {
        label: "Search background color",
        variable: "--epr-search-input-bg-color",
        defaultValue: "#f6f6f6",
      },
      {
        label: "Search active background color",
        variable: "--epr-search-input-bg-color-active",
        defaultValue: "var(--epr-search-input-bg-color)",
      },
      {
        label: "Search text color",
        variable: "--epr-search-input-text-color",
        defaultValue: "var(--epr-text-color)",
      },
      {
        label: "Search placeholder color",
        variable: "--epr-search-input-placeholder-color",
        defaultValue: "var(--epr-text-color)",
      },
      {
        label: "Search border color",
        variable: "--epr-search-border-color",
        defaultValue: "var(--epr-search-input-bg-color)",
      },
      {
        label: "Search border color (active)",
        variable: "--epr-search-border-color-active",
        defaultValue: "var(--epr-highlight-color)",
      },
      {
        label: "Search border radius",
        variable: "--epr-search-input-border-radius",
        defaultValue: "8px",
      },
      {
        label: "Search input height",
        variable: "--epr-search-input-height",
        defaultValue: "40px",
      },
      {
        label: "Search icon color",
        variable: "--epr-search-icon-color",
        defaultValue: "",
      },
    ],
  },
  {
    title: "Category navigation",
    items: [
      {
        label: "Category button size",
        variable: "--epr-category-navigation-button-size",
        defaultValue: "30px",
      },
      {
        label: "Active category icon color",
        variable: "--epr-category-icon-active-color",
        defaultValue: "#6aa8de",
      },
    ],
  },
  {
    title: "Category labels",
    items: [
      {
        label: "Category label background color",
        variable: "--epr-category-label-bg-color",
        defaultValue: "#ffffffe6",
      },
      {
        label: "Category label text color",
        variable: "--epr-category-label-text-color",
        defaultValue: "var(--epr-text-color)",
      },
      {
        label: "Category label height",
        variable: "--epr-category-label-height",
        defaultValue: "40px",
      },
    ],
  },
  {
    title: "Preview area",
    items: [
      {
        label: "Preview height",
        variable: "--epr-preview-height",
        defaultValue: "70px",
      },
      {
        label: "Preview text size",
        variable: "--epr-preview-text-size",
        defaultValue: "14px",
      },
      {
        label: "Preview text color",
        variable: "--epr-preview-text-color",
        defaultValue: "var(--epr-text-color)",
      },
    ],
  },
  {
    title: "Skin tone picker",
    items: [
      {
        label: "Skin tone menu color",
        variable: "--epr-skin-tone-picker-menu-color",
        defaultValue: "#ffffff95",
      },
      {
        label: "Skin tone size",
        variable: "--epr-skin-tone-size",
        defaultValue: "20px",
      },
    ],
  },
  {
    title: "Dark mode",
    items: [
      {
        label: "Dark background color",
        variable: "--epr-dark-bg-color",
        defaultValue: "#222222",
      },
      {
        label: "Dark border color",
        variable: "--epr-dark-picker-border-color",
        defaultValue: "#151617",
      },
      {
        label: "Dark text color",
        variable: "--epr-dark-text-color",
        defaultValue: "var(--epr-highlight-color)",
      },
      {
        label: "Dark search background",
        variable: "--epr-dark-search-input-bg-color",
        defaultValue: "#333333",
      },
      {
        label: "Dark hover background",
        variable: "--epr-dark-hover-bg-color",
        defaultValue: "#363636f6",
      },
    ],
  },
];

type VariableState = {
  enabled: boolean;
  value: string;
};

type VariableConfig = (typeof variableSections)[number]["items"][number];

type VariableStateMap = Record<string, VariableState>;

const initialState: VariableStateMap = variableSections
  .flatMap((section) => section.items)
  .reduce<VariableStateMap>((acc, item) => {
    acc[item.variable] = {
      value: item.defaultValue,
      enabled: false,
    };
    return acc;
  }, {});

const colorValueRegex = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

export function PickerCustomizer() {
  const [variableValues, setVariableValues] = useState<VariableStateMap>(
    initialState,
  );

  const enabledEntries = useMemo(() => {
    return Object.entries(variableValues)
      .filter(([, state]) => state.enabled)
      .map(([variable, state]) => [variable, state.value]);
  }, [variableValues]);

  const pickerStyle = useMemo(() => {
    return enabledEntries.reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  }, [enabledEntries]);

  const cssSnippet = useMemo(() => {
    return enabledEntries;
  }, [enabledEntries]);

  const cssOutputString = useMemo(() => {
    if (!enabledEntries.length) {
      return "aside.EmojiPickerReact {\n  /* Toggle variables to output CSS */\n}\n";
    }

    const lines = enabledEntries.map(
      ([variable, value]) => `  ${variable}: ${value};`,
    );
    return ["aside.EmojiPickerReact {", ...lines, "}", ""].join("\n");
  }, [enabledEntries]);

  return (
    <div className={styles.customizer}>
      <div className={styles.customizerHeader}>
        <div>
          <div className={styles.customizerTitle}>
            Customize how the picker looks
          </div>
          <div className={styles.customizerSummaryHint}>
            Toggle the variables you want to override.
          </div>
        </div>
      </div>
      <div className={styles.customizerBody}>
        <div className={styles.customizerLayout}>
          <form className={styles.customizerForm}>
            {variableSections.map((section) => (
              <details className={styles.section} key={section.title}>
                <summary className={styles.sectionSummary}>
                  <span className={styles.sectionTitle}>{section.title}</span>
                  <span className={styles.sectionHint}>
                    {section.items.length} variables
                  </span>
                </summary>
                <div className={styles.sectionGrid}>
                  {section.items.map((item) => (
                    <VariableControl
                      key={item.variable}
                      item={item}
                      state={variableValues[item.variable]}
                      onToggle={(enabled) =>
                        setVariableValues((prev) => ({
                          ...prev,
                          [item.variable]: {
                            ...prev[item.variable],
                            enabled,
                          },
                        }))
                      }
                      onChange={(value) =>
                        setVariableValues((prev) => ({
                          ...prev,
                          [item.variable]: {
                            ...prev[item.variable],
                            value,
                          },
                        }))
                      }
                    />
                  ))}
                </div>
              </details>
            ))}
          </form>

          <div className={styles.previewSection}>
            <div className={styles.previewHeader}>Live preview</div>
            <div className={styles.previewWrapper} style={pickerStyle}>
              <Picker
                theme={Theme.AUTO}
                height={360}
                width={320}
                searchDisabled={false}
                previewConfig={{
                  showPreview: true,
                  defaultEmoji: "1f60a",
                  defaultCaption: "How it feels",
                }}
              />
            </div>

            <div className={styles.outputSection}>
              <div className={styles.outputHeader}>
                <span>CSS output</span>
                <button
                  type="button"
                  className={styles.copyButton}
                  onClick={() => navigator.clipboard.writeText(cssOutputString)}
                >
                  Copy CSS
                </button>
              </div>
              <pre className={styles.outputCode}>
                <code>
                  <span className={styles.codeBrace}>
                    aside.EmojiPickerReact {"{"}
                  </span>
                  {cssSnippet.length === 0 ? (
                    <span className={styles.codeComment}>
                      {"\n"}  {"/* Toggle variables to output CSS */"}
                    </span>
                  ) : (
                    cssSnippet.map(([variable, value]) => (
                      <span className={styles.codeLine} key={variable}>
                        {"\n"}  <span className={styles.codeVariable}>{variable}</span>
                        {": "}
                        <span className={styles.codeValue}>{value}</span>;
                      </span>
                    ))
                  )}
                  {"\n"}
                  <span className={styles.codeBrace}>{"}"}</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VariableControl({
  item,
  state,
  onToggle,
  onChange,
}: {
  item: VariableConfig;
  state: VariableState;
  onToggle: (enabled: boolean) => void;
  onChange: (value: string) => void;
}) {
  const colorFallback = colorValueRegex.test(item.defaultValue)
    ? item.defaultValue
    : "#ffffff";
  const colorValue = colorValueRegex.test(state.value)
    ? state.value
    : colorFallback;

  return (
    <div className={styles.variableRow}>
      <label className={styles.variableLabel}>
        <input
          type="checkbox"
          checked={state.enabled}
          onChange={(event) => onToggle(event.target.checked)}
        />
        <span className={styles.variableName}>{item.label}</span>
        <span className={styles.variableToken}>{item.variable}</span>
      </label>
      <div className={styles.variableControls}>
        {colorValueRegex.test(item.defaultValue) && (
          <input
            type="color"
            value={colorValue}
            disabled={!state.enabled}
            onChange={(event) => onChange(event.target.value)}
            aria-label={`${item.label} color`}
          />
        )}
        <input
          type="text"
          value={state.value}
          disabled={!state.enabled}
          onChange={(event) => onChange(event.target.value)}
          placeholder={item.defaultValue || "e.g. 12px"}
          aria-label={`${item.label} value`}
        />
      </div>
    </div>
  );
}
