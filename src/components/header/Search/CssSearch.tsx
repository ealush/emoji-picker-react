import * as React from 'react';

export function CssSearch({ value }: { value: undefined | string }) {
  if (!value) {
    return null;
  }

  return (
    <style>{`
    .epr-emoji-list {
      counter-reset: emojis 0;
    }

    .epr-emoji-list::after {
      content: counter(emojis) ' emojis found';
    }

    .epr-emoji-list button.epr-emoji {
      display: none;
    }

    .epr-emoji-list button.epr-emoji[aria-label*="${value}"] {
      display: flex;
      counter-increment: emojis 1;
    }

    .epr-emoji-list .epr-emoji-category:not(:has(button.epr-emoji[aria-label*="${value}"])) {
      display: none;
    }
  `}</style>
  );
}
