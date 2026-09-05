"use client";

import { useState } from "react";
import styles from "@/styles/Home.module.css";

type PackageManager = "npm" | "yarn" | "pnpm";

const commands: Record<PackageManager, string> = {
  npm: "npm install emoji-picker-react",
  yarn: "yarn add emoji-picker-react",
  pnpm: "pnpm add emoji-picker-react",
};

export function InstallSection() {
  const [pm, setPm] = useState<PackageManager>("npm");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(commands[pm]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="install" className={styles.install}>
      <div className={styles.installContent}>
        <h2 className={styles.sectionTitle}>Quick Start</h2>
        <p className={styles.sectionSubtitle}>Install and use in minutes</p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            marginBottom: "0.5rem",
          }}
        >
          {(["npm", "yarn", "pnpm"] as PackageManager[]).map((manager) => (
            <button
              key={manager}
              onClick={() => setPm(manager)}
              style={{
                padding: "0.375rem 0.75rem",
                fontSize: "0.75rem",
                fontWeight: pm === manager ? 600 : 400,
                background:
                  pm === manager ? "var(--foreground)" : "transparent",
                color:
                  pm === manager
                    ? "var(--background)"
                    : "var(--foreground-muted)",
                border: "1px solid",
                borderColor:
                  pm === manager ? "var(--foreground)" : "var(--border)",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {manager}
            </button>
          ))}
        </div>

        <div className={styles.codeBlock}>
          <code className={styles.codeText}>{commands[pm]}</code>
          <button
            className={styles.copyButton}
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </div>
      </div>
    </section>
  );
}

function CopyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
