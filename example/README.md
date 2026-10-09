# emoji-picker-react example

A small Vite + React 19 app that shows every way to use the picker:

| Tab | What it shows | Files |
| --- | --- | --- |
| Batteries included | `<EmojiPicker />` with `colorScheme`, `columns` and a `--epr-*` brand theme | `src/examples/BatteriesIncluded.tsx`, `batteries.css` |
| Unstyled | `<EmojiPicker unstyled />` restyled from scratch through `[data-epr-part]` selectors | `src/examples/Unstyled.tsx`, `unstyled.css` |
| Composed | `emoji-picker-react/primitives`: your input, cells, headers, tabs and a hook-driven toolbar; a dataset loaded on demand | `src/examples/Composed.tsx`, `composed.css` |
| Data API | `searchEmojis` and `getEmojiByUnified` from `emoji-picker-react/data`, no UI | `src/examples/DataApi.tsx` |

The app consumes the library from this repository (`file:..`), so build the
library first:

```sh
npm ci && npm run build   # repository root
cd example
npm install
npm run dev
```

`npm run build` type-checks the examples and produces a production bundle.
