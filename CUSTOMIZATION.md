# Customization

## Custom Emojis

Pass the `customEmojis` prop to inject image-based emojis. Each entry uses this structure:

```ts
{
  id: string;      // Unique ID
  names: string[]; // Search keywords
  imgUrl: string;  // Image source
}
```

```jsx
<EmojiPicker
  customEmojis={[
    {
      id: 'panda',
      names: ['panda', 'bear'],
      imgUrl: 'https://example.com/panda.png',
    },
  ]}
/>
```

### Grouping custom emojis

Give customs a `group` to render each group as its own named section.
Reference the group from a `{ category: Categories.CUSTOM, group }`
entry in `categories` to place it anywhere in the order, with its own
`name` and `icon`. Customs without a group share the classic bucket:

```tsx
<EmojiPicker
  customEmojis={[
    { id: 'panda', names: ['panda'], imgUrl: pandaPng, group: 'animals' },
    { id: 'ninja', names: ['ninja'], imgUrl: ninjaPng, group: 'people' },
    { id: 'orphan', names: ['orphan'], imgUrl: orphanPng },
  ]}
  categories={[
    Categories.SMILEYS_PEOPLE,
    { category: Categories.CUSTOM, group: 'animals', name: 'Animals' },
    { category: Categories.CUSTOM, group: 'people', name: 'People' },
    { category: Categories.CUSTOM, name: 'Misc' },
  ]}
/>
```

## Preview Bar

Control the footer preview area with `previewConfig`:

```ts
{
  defaultEmoji: string; // Default: "1f60a"
  defaultCaption: string; // Default: "What's your mood?"
  showPreview: boolean; // Default: true
}
```

## Custom Category Icons

Customize the navigation icons using one of three methods.

**Method 1: Recolor the default icons with CSS variables**

The default icons follow two variables. Set them on the picker root via
the `style` prop (the picker defines its own defaults on `.epr-main`, so
values inherited from outer ancestors are shadowed):

```tsx
<EmojiPicker
  style={
    {
      '--epr-category-icon-active-color': '#e11d48',
      '--epr-category-icon-inactive-color': '#a8a29e',
    } as React.CSSProperties
  }
/>
```

| Variable                             | Default                             |
| :----------------------------------- | :---------------------------------- |
| `--epr-category-icon-active-color`   | `#3371B7` (`#6AA9DD` in dark theme) |
| `--epr-category-icon-inactive-color` | `#868686` (`#C0C0BF` in dark theme) |

**Method 2: The `categoryIcons` prop**

Map `Categories` enum values to React nodes:

```tsx
import EmojiPicker, { Categories } from 'emoji-picker-react';

<EmojiPicker
  categoryIcons={{
    [Categories.SUGGESTED]: <img src="recent.png" alt="Recent" />,
    [Categories.SMILEYS_PEOPLE]: <MyCustomFaceIcon />,
  }}
/>;
```

**Method 3: The `categories` configuration array**

Define the icon directly within the category configuration object:

```tsx
import EmojiPicker, { Categories } from 'emoji-picker-react';

<EmojiPicker
  categories={[
    {
      category: Categories.SUGGESTED,
      name: 'Recently Used',
      icon: <img src="recent.png" alt="Recent" />,
    },
    {
      category: Categories.SMILEYS_PEOPLE,
      name: 'Smileys & People',
      icon: <MyCustomFaceIcon />,
    },
  ]}
/>;
```

Note: if both methods are used for the same category, the icon from the `categories` configuration takes precedence over the `categoryIcons` prop.

## Content Security Policy (CSP)

If your site has a CSP that blocks inline styles, pass a `nonce` to the `EmojiPicker` component. It is applied to the inline `<style>` tag:

```jsx
<EmojiPicker nonce="your-nonce-value" />
```
