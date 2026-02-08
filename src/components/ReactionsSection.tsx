"use client";

import Picker, { Theme } from "emoji-picker-react";
import { useState } from "react";
import styles from "@/styles/Home.module.css";

export function ReactionsSection() {
  const [key, setKey] = useState(0);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  const handleRestart = () => {
    setKey((k) => k + 1);
    setSelectedEmoji(null);
  };

  return (
    <section className={styles.reactionsSection}>
      <div className={styles.reactionsContent}>
        <div className={styles.reactionsInfo}>
          <h2 className={styles.sectionTitle}>Reactions Mode</h2>
          <p className={styles.sectionSubtitle}>
            Perfect for message reactions — a compact picker that expands on
            demand
          </p>
          <p className={styles.reactionsDescription}>
            Start with a curated set of popular reactions, then expand to access
            the full emoji library. Ideal for chat apps, comment systems, and
            social features.
          </p>
          <button onClick={handleRestart} className={styles.restartButton}>
            <RestartIcon />
            Restart Demo
          </button>
        </div>
        <div className={styles.reactionsPickerArea}>
          {selectedEmoji && (
            <div className={styles.selectedEmojiCard}>
              <span className={styles.selectedEmojiIcon}>{selectedEmoji}</span>
            </div>
          )}
          <div className={styles.reactionsPickerWrapper}>
            <Picker
              key={key}
              reactionsDefaultOpen={true}
              onEmojiClick={(emoji) => setSelectedEmoji(emoji.emoji)}
              theme={Theme.LIGHT}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function RestartIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
