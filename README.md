# Emoji Picker React

The most popular fully customizable emoji picker for React.

[![npm downloads](https://img.shields.io/npm/dm/emoji-picker-react.svg)](https://www.npmjs.com/package/emoji-picker-react)

**[Live Demo](https://ealush.com/emoji-picker-react)** | **[Report a Bug](https://github.com/ealush/emoji-picker-react/issues)**

![image](https://github.com/ealush/emoji-picker-react/assets/11255103/48901306-e7fd-49cd-8f1e-9b214083a61d)

![reactions](https://github.com/ealush/emoji-picker-react/assets/11255103/c28cc954-dc1d-4d82-91a8-64a74cf1d598)

## Features

- Fully customizable through props and CSS variables
- Light, dark, and auto themes
- Reactions picker mode and custom click handlers
- Dozens of built-in languages
- Custom image-based emojis
- Apple, Google, Facebook, Twitter, and native emoji styles
- Responsive and mobile-friendly
- SSR-safe

## Installation

```bash
npm install emoji-picker-react
```

## Usage

```jsx
import EmojiPicker from 'emoji-picker-react';

function App() {
  return (
    <EmojiPicker onEmojiClick={(emojiData) => console.log(emojiData.emoji)} />
  );
}
```

`onEmojiClick` receives an `EmojiClickData` object (unified code, names, image URL, active skin tone) and the underlying mouse event.

## Configuration

```jsx
<EmojiPicker
  theme="dark"
  emojiStyle="native"
  width={320}
  height={400}
  previewConfig={{ showPreview: false }}
/>
```

See [PROPS.md](PROPS.md) for the complete props reference.

## Styling

No stylesheet import needed. All styles are scoped via [ShipStyles](https://github.com/ealush/shipstyles) — generated class names are hashed, so the picker's CSS won't leak into or clash with your app's styles.

Restyle the picker by overriding [CSS variables](CSS_VARIABLES.md) on `.EmojiPickerReact`:

```css
.EmojiPickerReact {
  --epr-emoji-size: 32px;
}
```

## Internationalization

Pass imported locale data via the `emojiData` prop:

```jsx
import EmojiPicker from 'emoji-picker-react';
import es from 'emoji-picker-react/dist/data/emojis-es'; // Spanish

function App() {
  return <EmojiPicker emojiData={es} />;
}
```

See [INTERNATIONALIZATION.md](INTERNATIONALIZATION.md) for the supported languages.

## Customization

Custom emojis, custom category icons, preview configuration, and CSP nonces are covered in [CUSTOMIZATION.md](CUSTOMIZATION.md).

## Server-Side Rendering

The picker renders on the server, with styles inlined into the server HTML — no setup needed. Since the picker is usually opened on demand rather than shown immediately, lazy-loading it is still recommended to keep the initial bundle small:

```javascript
import dynamic from 'next/dynamic';

const Picker = dynamic(() => import('emoji-picker-react'));
```

## Troubleshooting

### `global is not defined` (Vite, versions before 4.20)

Since 4.20 the picker is SSR-safe and no longer references the Node-style
`global`. If you see `global is not defined`, upgrade to the latest version.
On older versions only, the workaround was adding this to your HTML:

```html
<script>
  window.global = window;
</script>
```

## More from the maintainer

Building complex forms? Check out [**Vest**](https://vestjs.dev) — a validation framework for stateful, async, and dependent validation.

## Contributing

Contributions are welcome — see the [Contributing Guide](https://github.com/ealush/emoji-picker-react/blob/master/CONTRIBUTING.md).

Design inspiration by [Pavel Bolo](https://pavelbolo.com).


## 🌐 Web Resources & Aesthetic Symbols Index
- [MUSIC FLAT SIGN](https://soft-girl-fancy-text-11.pages.dev/symbol/music-flat-sign/)
- [SYM 2664](https://neon-gamer-symbols-64.pages.dev/symbol/sym-2664/)
- [SIXTEEN POINTED STAR](https://chibi-emoticon-world-87.pages.dev/symbol/sixteen-pointed-star/)
- [SYM 1F921](https://chibi-faces-hub-88.pages.dev/symbol/sym-1f921/)
- [RINGED PLANET SATURN](https://soft-pastel-unicode-78.pages.dev/symbol/ringed-planet-saturn/)
- [SYM 26D5](https://synthwave-text-art-35.pages.dev/symbol/sym-26d5/)
- [ROBLOX NAMES](https://sleek-typography-hub-12.pages.dev/roblox-names/)
- [STARS](https://chibi-emoticon-vault-78.pages.dev/ja/stars/)
- [SYM 2747](https://vintage-lace-text-53.pages.dev/symbol/sym-2747/)
- [INSTAGRAM BIO](https://sleek-dot-symbols-31.pages.dev/es/instagram-bio/)
- [SYM 2621](https://baroque-text-decor-84.pages.dev/symbol/sym-2621/)
- [ZODIAC CELESTIAL](https://clean-line-emojis-77.pages.dev/es/zodiac-celestial/)
- [SYM 1D418](https://academic-rune-text-25.pages.dev/symbol/sym-1d418/)
- [SYM 1D429](https://sleek-dot-symbols-31.pages.dev/symbol/sym-1d429/)
- [TIKTOK CAPTIONS](https://anime-sparkle-text-92.pages.dev/tiktok-captions/)
- [SYM 1F621](https://clean-mono-fonts-64.pages.dev/symbol/sym-1f621/)
- [ZODIAC CELESTIAL](https://scholarly-unicode-vault-92.pages.dev/ru/zodiac-celestial/)
- [SPARKLE DOT FLARE](https://balletcore-bio-symbols-63.pages.dev/symbol/sparkle-dot-flare/)
- [SYM 1F635 200D 1F4AB](https://cyber-clan-tags-20.pages.dev/symbol/sym-1f635-200d-1f4ab/)
- [MUSIC SHARP SIGN](https://gothic-bio-fonts-61.pages.dev/symbol/music-sharp-sign/)
- [SYM 1F616](https://cyber-clan-tags-20.pages.dev/symbol/sym-1f616/)
- [SYM 1F97A](https://matrix-terminal-fonts-30.pages.dev/symbol/sym-1f97a/)
- [SYM 26BC](https://cyber-clan-tags-20.pages.dev/symbol/sym-26bc/)
- [SYM 1D436](https://cyber-clan-tags-20.pages.dev/symbol/sym-1d436/)
- [SYM 26B6](https://cyber-clan-tags-20.pages.dev/symbol/sym-26b6/)
- [DISCORD STATUS](https://clean-sparkle-text-75.pages.dev/ja/discord-status/)
- [SYM 26A3](https://angel-core-bios-50.pages.dev/symbol/sym-26a3/)
- [SYM 267D](https://zen-spacing-text-68.pages.dev/symbol/sym-267d/)
- [SYM 1D45A](https://cyber-clan-tags-20.pages.dev/symbol/sym-1d45a/)
- [BORDERS DIVIDERS](https://matrix-terminal-fonts-30.pages.dev/borders-dividers/)
- [SYM 2679](https://clean-mono-fonts-64.pages.dev/symbol/sym-2679/)
- [SYM 2616](https://kawaii-kaomoji-hub-12.pages.dev/symbol/sym-2616/)
- [HEAVY RIGHTWARD ARROW](https://clean-sparkle-text-75.pages.dev/symbol/heavy-rightward-arrow/)
- [SYM 1D40E](https://classic-literature-symbols-64.pages.dev/symbol/sym-1d40e/)
- [SYM 1F60E](https://vintage-lace-symbols-65.pages.dev/symbol/sym-1f60e/)
- [BORDERS DIVIDERS](https://moe-star-emoticons-13.pages.dev/ja/borders-dividers/)
- [SYM 1F615](https://scholarly-unicode-vault-92.pages.dev/symbol/sym-1f615/)
- [SYM 1FA77](https://cyber-clan-tags-20.pages.dev/symbol/sym-1fa77/)
- [SYM 1F632](https://sleek-border-symbols-37.pages.dev/symbol/sym-1f632/)
- [NATURE FLOWERS](https://clean-mono-fonts-64.pages.dev/nature-flowers/)
- [SYM 1D40B](https://angel-core-bios-50.pages.dev/symbol/sym-1d40b/)
- [SAGITTARIUS ZODIAC ARCHER](https://vintage-lace-symbols-65.pages.dev/symbol/sagittarius-zodiac-archer/)
- [KAOMOJI](https://cyber-clan-tags-85.pages.dev/kaomoji/)
- [SYM 26AD](https://angel-core-bios-50.pages.dev/symbol/sym-26ad/)
- [SYM 1D439](https://matrix-terminal-fonts-30.pages.dev/symbol/sym-1d439/)
- [MUSIC WEATHER](https://minimal-star-symbols-32.pages.dev/ja/music-weather/)
- [SYM 1D491](https://minimal-star-symbols-95.pages.dev/symbol/sym-1d491/)
- [SCORPIO ZODIAC SCORPION](https://clean-mono-fonts-64.pages.dev/symbol/scorpio-zodiac-scorpion/)
- [SYM 1D404](https://chibi-emotion-faces-74.pages.dev/symbol/sym-1d404/)
- [SYM 26EB](https://minimal-star-symbols-31.pages.dev/symbol/sym-26eb/)
- [SYM 1F63F](https://gothic-bio-fonts-84.pages.dev/symbol/sym-1f63f/)
- [FREEFIRE NAMES](https://neon-futuristic-symbols-62.pages.dev/es/freefire-names/)
- [BLACK CENTRE STAR](https://neon-glitch-fonts-25.pages.dev/symbol/black-centre-star/)
- [SYM 1F92F](https://cyber-clan-tags-20.pages.dev/symbol/sym-1f92f/)
- [SYM 1D4A5](https://vintage-lace-symbols-65.pages.dev/symbol/sym-1d4a5/)
- [FLUTTERING BUTTERFLY](https://cyber-clan-tags-20.pages.dev/symbol/fluttering-butterfly/)
- [SYM 1F92B](https://scholarly-unicode-vault-92.pages.dev/symbol/sym-1f92b/)
- [AESTHETIC MINIMAL CLOUD](https://zen-unicode-text-24.pages.dev/symbol/aesthetic-minimal-cloud/)
- [FREEFIRE NAMES](https://gothic-bio-fonts-61.pages.dev/pt/freefire-names/)
- [SYM 1D419](https://matrix-terminal-fonts-30.pages.dev/symbol/sym-1d419/)
- [SYM 2636](https://gothic-bio-fonts-84.pages.dev/symbol/sym-2636/)
- [TIKTOK CAPTIONS](https://clean-aesthetic-arrows-99.pages.dev/es/tiktok-captions/)
- [TRENDING](https://cyber-clan-tags-38.pages.dev/ja/trending/)
- [TRENDING](https://kawaii-kaomoji-hub-31.pages.dev/es/trending/)
- [SYM 1F60C](https://sleek-dot-symbols-31.pages.dev/symbol/sym-1f60c/)
- [STARS](https://gothic-bio-fonts-61.pages.dev/es/stars/)
- [SYM 26E8](https://vintage-lace-symbols-65.pages.dev/symbol/sym-26e8/)
- [SYM 2657](https://neon-glitch-fonts-25.pages.dev/symbol/sym-2657/)
- [FLOWER GIRL SMILE KAOMOJI](https://neon-glitch-fonts-25.pages.dev/symbol/flower-girl-smile-kaomoji/)
- [SYM 273D](https://mecha-crosshair-symbols-40.pages.dev/symbol/sym-273d/)
- [MUSIC WEATHER](https://cyber-clan-tags-20.pages.dev/music-weather/)
- [SYM 1FAE2](https://neon-futuristic-symbols-62.pages.dev/symbol/sym-1fae2/)
- [SYM 1D451](https://vintage-lace-symbols-65.pages.dev/symbol/sym-1d451/)
- [SUPER SHY BLUSHING KAOMOJI](https://clean-mono-fonts-64.pages.dev/symbol/super-shy-blushing-kaomoji/)
- [CIRCLED STAR](https://kawaii-kaomoji-hub-31.pages.dev/symbol/circled-star/)
- [BRACKETS](https://vintage-lace-symbols-65.pages.dev/ru/brackets/)
- [SYM 2612](https://chibi-emotion-faces-74.pages.dev/symbol/sym-2612/)
- [SYM 26FA](https://mecha-crosshair-tags-20.pages.dev/symbol/sym-26fa/)
- [SYM 1D456](https://sleek-border-symbols-37.pages.dev/symbol/sym-1d456/)
- [SYM 268B](https://cyber-clan-tags-85.pages.dev/symbol/sym-268b/)
- [MUSIC WEATHER](https://matrix-terminal-fonts-30.pages.dev/pt/music-weather/)
- [SYM 2639 FE0F](https://sleek-dot-symbols-31.pages.dev/symbol/sym-2639-fe0f/)
- [ZODIAC CELESTIAL](https://neon-futuristic-symbols-62.pages.dev/ru/zodiac-celestial/)
- [SYM 26E4](https://academic-rune-text-25.pages.dev/symbol/sym-26e4/)
- [SYM 1D463](https://vintage-lace-symbols-65.pages.dev/symbol/sym-1d463/)
- [GEMINI ZODIAC TWINS](https://gothic-bio-fonts-84.pages.dev/symbol/gemini-zodiac-twins/)
- [SYM 2733](https://clean-mono-fonts-64.pages.dev/symbol/sym-2733/)
- [SYM 1F61D](https://scholarly-unicode-vault-92.pages.dev/symbol/sym-1f61d/)
- [BLUSHING SOFT SMILE KAOMOJI](https://matrix-glitch-text-59.pages.dev/symbol/blushing-soft-smile-kaomoji/)
- [VI](https://sleek-type-aesthetic-51.pages.dev/vi/)
- [SYM 1F610](https://neon-glitch-fonts-25.pages.dev/symbol/sym-1f610/)
- [SYM 1F49D](https://coquette-aesthetic-symbols-58.pages.dev/symbol/sym-1f49d/)
- [SYM 1F494](https://matrix-terminal-fonts-30.pages.dev/symbol/sym-1f494/)
- [ROBLOX NAMES](https://vintage-lace-symbols-65.pages.dev/vi/roblox-names/)
- [LEFT BLACK LENTICULAR BRACKET](https://clean-line-emojis-77.pages.dev/symbol/left-black-lenticular-bracket/)
- [SYM 26DE](https://anime-sparkle-text-24.pages.dev/symbol/sym-26de/)
- [AQUARIUS ZODIAC WATER BEARER](https://gothic-bio-fonts-24.pages.dev/symbol/aquarius-zodiac-water-bearer/)
- [RIGHT HEAVY BRACKET BOX](https://academic-rune-text-25.pages.dev/symbol/right-heavy-bracket-box/)
- [RADIOACTIVE SYMBOL](https://sleek-dot-symbols-31.pages.dev/symbol/radioactive-symbol/)
- [BLACK CENTRE STAR](https://balletcore-bio-symbols-63.pages.dev/symbol/black-centre-star/)
- [SYM 1D457](https://sleek-border-symbols-37.pages.dev/symbol/sym-1d457/)
- [CHEERING FIGHTING FIST KAOMOJI](https://clean-sparkle-text-75.pages.dev/symbol/cheering-fighting-fist-kaomoji/)
- [SYM 1D44B](https://cyber-clan-tags-55.pages.dev/symbol/sym-1d44b/)
- [LEFT WHITE CORNER BRACKET](https://vintage-runic-symbols-53.pages.dev/symbol/left-white-corner-bracket/)
- [SYM 1F63F](https://cyber-clan-tags-20.pages.dev/symbol/sym-1f63f/)
- [STARRY ELEVATION AURA](https://matrix-terminal-fonts-30.pages.dev/symbol/starry-elevation-aura/)
- [ZODIAC CELESTIAL](https://neon-glitch-fonts-25.pages.dev/vi/zodiac-celestial/)
- [SYM 1F62C](https://vintage-lace-symbols-65.pages.dev/symbol/sym-1f62c/)
- [SYM 2654](https://angel-core-bios-50.pages.dev/symbol/sym-2654/)
- [SYM 1F642 200D 2195 FE0F](https://balletcore-bio-symbols-63.pages.dev/symbol/sym-1f642-200d-2195-fe0f/)
- [LAST QUARTER CRESCENT MOON](https://sleek-dot-symbols-31.pages.dev/symbol/last-quarter-crescent-moon/)
- [SYM 1F639](https://matrix-terminal-fonts-30.pages.dev/symbol/sym-1f639/)
- [SYM 1D496](https://sleek-dot-symbols-31.pages.dev/symbol/sym-1d496/)
- [SYM 1F972](https://poetic-scroll-fonts-91.pages.dev/symbol/sym-1f972/)
- [KHANDA EMBLEM](https://neon-futuristic-symbols-62.pages.dev/symbol/khanda-emblem/)
- [SYM 1F609](https://chibi-emotion-faces-74.pages.dev/symbol/sym-1f609/)
- [SYM 267B](https://kawaii-kaomoji-hub-97.pages.dev/symbol/sym-267b/)
- [SYM 1D472](https://cyber-clan-tags-55.pages.dev/symbol/sym-1d472/)
- [SYM 1D474](https://classic-literature-symbols-64.pages.dev/symbol/sym-1d474/)
- [SYM 26E0](https://cyber-clan-tags-55.pages.dev/symbol/sym-26e0/)
- [SYM 1D433](https://matrix-terminal-fonts-30.pages.dev/symbol/sym-1d433/)
- [SYM 1F60E](https://clean-line-emojis-77.pages.dev/symbol/sym-1f60e/)
- [SYM 1F62D](https://gothic-bio-fonts-84.pages.dev/symbol/sym-1f62d/)
- [TRENDING](https://cyber-clan-tags-85.pages.dev/es/trending/)
- [ZODIAC CELESTIAL](https://neon-glitch-fonts-25.pages.dev/ru/zodiac-celestial/)
- [NATURE FLOWERS](https://coquette-aesthetic-symbols-58.pages.dev/pt/nature-flowers/)
- [SYM 1F649](https://cyber-clan-tags-38.pages.dev/symbol/sym-1f649/)
- [SYM 1F639](https://balletcore-unicode-67.pages.dev/symbol/sym-1f639/)
- [INSTAGRAM BIO](https://chibi-emoticon-vault-78.pages.dev/vi/instagram-bio/)
- [ROYAL GOLD CROWN](https://neon-futuristic-symbols-62.pages.dev/symbol/royal-gold-crown/)
