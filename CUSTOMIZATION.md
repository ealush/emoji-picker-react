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

Customize the navigation icons using one of two methods.

**Method 1: The `categoryIcons` prop**

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

**Method 2: The `categories` configuration array**

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
