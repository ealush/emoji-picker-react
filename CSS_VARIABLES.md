# 🎨 CSS Variables

You can customize specific parts of the picker by overriding these CSS variables. Target `.EmojiPickerReact` or `aside.EmojiPickerReact` to apply them.

```css
.EmojiPickerReact {
  --epr-emoji-size: 32px;
}
```

## 🎛️ General Variables

| Variable                     | Description                                        | Default   |
| :--------------------------- | :------------------------------------------------- | :-------- |
| `--epr-emoji-size`           | Size of the emojis.                                | `30px`    |
| `--epr-emoji-padding`        | Padding around each emoji.                         | `5px`     |
| `--epr-emoji-gap`            | **Deprecated**. Use `--epr-emoji-padding` instead. | -         |
| `--epr-bg-color`             | Background color of the picker.                    | `#fff`    |
| `--epr-text-color`           | Main text color.                                   | `#858585` |
| `--epr-picker-border-color`  | Border color of the picker container.              | `#e7e7e7` |
| `--epr-picker-border-radius` | Border radius of the picker.                       | `8px`     |
| `--epr-horizontal-padding`   | Horizontal padding for various elements.           | `10px`    |
| `--epr-highlight-color`      | Color for active states and highlights.            | `#007aeb` |
| `--epr-hover-bg-color`       | Background color on hover.                         | `#e5f0fa` |
| `--epr-focus-bg-color`       | Background color on focus.                         | `#e0f0ff` |

## 🔎 Search Input

| Variable                               | Description                             | Default                            |
| :------------------------------------- | :-------------------------------------- | :--------------------------------- |
| `--epr-search-input-bg-color`          | Background color of the search input.   | `#f6f6f6`                          |
| `--epr-search-input-bg-color-active`   | Background color when search is active. | `var(--epr-search-input-bg-color)` |
| `--epr-search-input-text-color`        | Text color in the search input.         | `var(--epr-text-color)`            |
| `--epr-search-input-placeholder-color` | Placeholder text color.                 | `var(--epr-text-color)`            |
| `--epr-search-border-color`            | Border color of the search input.       | `var(--epr-search-input-bg-color)` |
| `--epr-search-border-color-active`     | Border color when search is active.     | `var(--epr-highlight-color)`       |
| `--epr-search-input-border-radius`     | Border radius of the search input.      | `8px`                              |
| `--epr-search-input-height`            | Height of the search input.             | `40px`                             |
| `--epr-search-icon-color`              | Color of the search icon.               | -                                  |

## 🏷️ Category Navigation

| Variable                                | Description                          | Default   |
| :-------------------------------------- | :----------------------------------- | :-------- |
| `--epr-category-navigation-button-size` | Size of category navigation buttons. | `30px`    |
| `--epr-category-icon-active-color`      | Color of the active category icon.   | `#6aa8de` |

## 📃 Category Labels

| Variable                          | Description                                    | Default                 |
| :-------------------------------- | :--------------------------------------------- | :---------------------- |
| `--epr-category-label-bg-color`   | Background color of the sticky category label. | `#ffffffe6`             |
| `--epr-category-label-text-color` | Text color of the category label.              | `var(--epr-text-color)` |
| `--epr-category-label-height`     | Height of the category label.                  | `40px`                  |

## 👁️ Preview Area

| Variable                   | Description                            | Default                 |
| :------------------------- | :------------------------------------- | :---------------------- |
| `--epr-preview-height`     | Height of the preview area.            | `70px`                  |
| `--epr-preview-text-size`  | Font size of text in the preview area. | `14px`                  |
| `--epr-preview-text-color` | Text color in the preview area.        | `var(--epr-text-color)` |

## 🖐️ Skin Tone Picker

| Variable                            | Description                                    | Default     |
| :---------------------------------- | :--------------------------------------------- | :---------- |
| `--epr-skin-tone-picker-menu-color` | Background color of the skin tone picker menu. | `#ffffff95` |
| `--epr-skin-tone-size`              | Size of skin tone circles.                     | `20px`      |

## 🌑 Dark Mode

| Variable                           | Description                           | Default                      |
| :--------------------------------- | :------------------------------------ | :--------------------------- |
| `--epr-dark-bg-color`              | Background color in dark mode.        | `#222222`                    |
| `--epr-dark-picker-border-color`   | Border color in dark mode.            | `#151617`                    |
| `--epr-dark-text-color`            | Text color in dark mode.              | `var(--epr-highlight-color)` |
| `--epr-dark-search-input-bg-color` | Search input background in dark mode. | `#333333`                    |
| `--epr-dark-hover-bg-color`        | Hover background color in dark mode.  | `#363636f6`                  |
