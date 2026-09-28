import { Meta } from '@storybook/react';
import React, { useState } from 'react';

import { EmojiStyle } from '../../src';
import {
  CategoryNav,
  List,
  Preview,
  Root,
  Search,
  Viewport,
} from '../../src/primitives';
import type { EmojiClickData } from '../../src/types/exposedTypes';

// Custom designs over public primitives (docs/v5/PRIMITIVES.md §2).
//
// Each composition below reassembles the same behavioral modules the
// default picker uses — no private imports — with a completely different
// visual design and region order. The grammar notes hold for all three:
// Viewport (when present) directly contains exactly one List; Search,
// CategoryNav, Viewport and Preview are optional singletons in any order;
// ordinary consumer wrappers/controls land inside the managed panel.
//
// Bare Roots do not inherit the default token sheet, so each design
// supplies the documented --epr-* tokens it consumes (STYLING.md §3):
// shared v4 defaults via designTokens() plus a small per-design delta.
// Custom CSS targets documented data-epr-part hooks and stays within
// appearance-safe declarations (STYLING.md §2): colors, backgrounds,
// borders, radii, typography, shadows and padding tokens. Structural
// properties (viewport overflow, list/category layout, emoji geometry)
// are never overridden, so virtualization, measurement and keyboard
// row math keep working. Native emoji style keeps the stories
// deterministic without network access.

const meta = {
  title: 'v5/CustomDesigns',
  parameters: {
    controls: { expanded: true },
  },
} satisfies Meta;

export default meta;

function useLastPick() {
  const [last, setLast] = useState<EmojiClickData | null>(null);
  return {
    last,
    onEmojiClick: (data: EmojiClickData) => setLast(data),
  };
}

// Documented default token values (see defaultAppearance baseVariables
// and CSS_VARIABLES.md). A custom design starts from these and overrides
// only what its theme changes; without them, token-driven functional
// styles (input heights, tab sizes, preview height) have no value.
function designTokens(scope: string): string {
  return `
${scope} {
  --epr-highlight-color: #007aeb;
  --epr-hover-bg-color: #e5f0fa;
  --epr-hover-bg-color-reduced-opacity: #e5f0fa80;
  --epr-focus-bg-color: #e0f0ff;
  --epr-text-color: #858585;
  --epr-search-input-bg-color: #f6f6f6;
  --epr-picker-border-color: #e7e7e7;
  --epr-bg-color: #fff;
  --epr-reactions-bg-color: #ffffff90;
  --epr-category-icon-active-color: #3371B7;
  --epr-category-icon-inactive-color: #868686;
  --epr-skin-tone-picker-menu-color: #ffffff95;
  --epr-skin-tone-outer-border-color: #555555;
  --epr-skin-tone-inner-border-color: var(--epr-bg-color);
  --epr-horizontal-padding: 10px;
  --epr-picker-border-radius: 8px;
  --epr-header-padding: 15px var(--epr-horizontal-padding);
  --epr-active-skin-tone-indicator-border-color: var(--epr-highlight-color);
  --epr-active-skin-hover-color: var(--epr-hover-bg-color);
  --epr-search-input-bg-color-active: var(--epr-search-input-bg-color);
  --epr-search-input-padding: 0 30px;
  --epr-search-input-border-radius: 8px;
  --epr-search-input-height: 40px;
  --epr-search-input-text-color: var(--epr-text-color);
  --epr-search-input-placeholder-color: var(--epr-text-color);
  --epr-search-bar-inner-padding: var(--epr-horizontal-padding);
  --epr-search-border-color: var(--epr-search-input-bg-color);
  --epr-search-border-color-active: var(--epr-highlight-color);
  --epr-category-navigation-button-size: 30px;
  --epr-emoji-variation-picker-height: 45px;
  --epr-emoji-variation-picker-bg-color: var(--epr-bg-color);
  --epr-preview-height: 70px;
  --epr-preview-text-size: 14px;
  --epr-preview-text-padding: 0 var(--epr-horizontal-padding);
  --epr-preview-border-color: var(--epr-picker-border-color);
  --epr-preview-text-color: var(--epr-text-color);
  --epr-category-padding: 0 var(--epr-horizontal-padding);
  --epr-category-label-bg-color: #ffffffe6;
  --epr-category-label-text-color: var(--epr-text-color);
  --epr-category-label-padding: 0 var(--epr-horizontal-padding);
  --epr-category-label-height: 40px;
  --epr-emoji-size: 30px;
  --epr-emoji-padding: 5px;
  --epr-emoji-fullsize: calc(var(--epr-emoji-size) + var(--epr-emoji-padding) * 2);
  --epr-emoji-hover-color: var(--epr-hover-bg-color);
  --epr-emoji-variation-indicator-color: var(--epr-picker-border-color);
  --epr-emoji-variation-indicator-color-hover: var(--epr-text-color);
  --epr-header-overlay-z-index: 3;
  --epr-emoji-variations-indictator-z-index: 1;
  --epr-category-label-z-index: 2;
  --epr-skin-variation-picker-z-index: 5;
  --epr-preview-z-index: 6;
}
`;
}

// ---------------------------------------------------------------------------
// 1. Midnight command palette: dark glass card, status Preview on top,
//    bottom search bar, custom status footer. Regions run in a fully
//    reordered arrangement (Preview first, Search last) to prove there
//    is no child-ordering rule.
// ---------------------------------------------------------------------------
export function MidnightPalette() {
  const { last, onEmojiClick } = useLastPick();
  const scope = '.midnight-palette-story .midnight-palette';
  return (
    <div className="midnight-palette-story">
      <style>{`${designTokens(scope)}
${scope} {
  --epr-text-color: #e8eaf2;
  --epr-bg-color: #101424;
  --epr-picker-border-color: rgba(255, 255, 255, 0.12);
  --epr-hover-bg-color: rgba(122, 162, 255, 0.18);
  --epr-focus-bg-color: rgba(122, 162, 255, 0.24);
  --epr-highlight-color: #7aa2ff;
  --epr-search-input-bg-color: rgba(255, 255, 255, 0.06);
  --epr-search-border-color: rgba(255, 255, 255, 0.14);
  --epr-category-label-bg-color: rgba(16, 20, 36, 0.9);
  --epr-category-label-text-color: #8b93b0;
  --epr-preview-border-color: rgba(255, 255, 255, 0.08);
  --epr-preview-text-color: #e8eaf2;
  --epr-category-icon-active-color: #7aa2ff;
  --epr-category-icon-inactive-color: #6d7591;
  --epr-emoji-hover-color: rgba(122, 162, 255, 0.18);
}`}</style>
      <style>{MIDNIGHT_CSS}</style>
      <Root
        emojiStyle={EmojiStyle.NATIVE}
        reactions={['1f600', '1f603', '1f60d', '1f622', '1f44d', '2764-fe0f']}
        previewConfig={{
          defaultEmoji: '1f680',
          defaultCaption: 'Midnight palette — pick an emoji',
          showPreview: true,
        }}
        onEmojiClick={onEmojiClick}
        className="midnight-palette"
        style={{ width: 400, height: 480 }}
        searchPlaceholder="Type to filter…"
        searchClearButtonLabel="Clear filter"
      >
        <div className="midnight-head">
          <span className="midnight-title">emoji</span>
          <span className="midnight-kbd">⌘K</span>
        </div>
        <Preview />
        <Viewport>
          <List />
        </Viewport>
        <CategoryNav />
        <Search />
        <div className="midnight-status" aria-live="polite">
          {last ? `Last pick: ${last.emoji} · ${last.unified}` : 'Nothing picked yet'}
        </div>
      </Root>
    </div>
  );
}

const MIDNIGHT_CSS = `
.midnight-palette-story {
  display: flex;
  justify-content: center;
  padding: 24px;
  background: radial-gradient(1200px 600px at 50% -10%, #2b3a67, #0b0e1a 70%);
  border-radius: 12px;
}
/* Bare Roots inherit no resets: border-box keeps padded controls
   (search input, tabs) inside their containers instead of overflowing
   the scrollable root, which autofocus scrolling would then reveal. */
.midnight-palette-story *,
.midnight-palette-story *::before,
.midnight-palette-story *::after {
  box-sizing: border-box;
}
.midnight-palette-story .midnight-palette {
  background: rgba(16, 20, 36, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.55);
  color: #e8eaf2;
  font-family: ui-sans-serif, system-ui, sans-serif;
  overflow: hidden;
}
.midnight-palette-story .midnight-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 4px;
}
.midnight-palette-story .midnight-title {
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #8b93b0;
}
.midnight-palette-story .midnight-kbd {
  font-size: 11px;
  color: #c6cbe0;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 6px;
  padding: 2px 8px;
}
.midnight-palette-story [data-epr-part="preview"] {
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  min-height: 56px;
}
.midnight-palette-story [data-epr-part="category-tab"] {
  border-radius: 999px;
}
.midnight-palette-story [data-epr-part="category-tab"][aria-selected="true"] {
  background: rgba(122, 162, 255, 0.22);
}
.midnight-palette-story .midnight-status {
  padding: 8px 16px 12px;
  font-size: 12px;
  color: #8b93b0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
`;

// ---------------------------------------------------------------------------
// 2. Slim composer bar: a horizontal keyboard-first strip. CategoryNav
//    and Preview are both omitted (optional singletons) — navigation is
//    search-driven plus full grid arrow keys, and the last pick docks
//    into the search row. No tab rail, no dead scroll areas.
// ---------------------------------------------------------------------------
export function SlimComposerBar() {
  const { last, onEmojiClick } = useLastPick();
  const scope = '.slim-bar-story .slim-bar';
  return (
    <div className="slim-bar-story">
      <style>{`${designTokens(scope)}
${scope} {
  --epr-text-color: #1f2937;
  --epr-bg-color: #fffdf8;
  --epr-picker-border-color: #e3ddd0;
  --epr-search-input-bg-color: #ffffff;
  --epr-highlight-color: #166534;
  --epr-search-border-color-active: #166534;
  --epr-hover-bg-color: #e7f0e4;
  --epr-focus-bg-color: #dcebd8;
  --epr-emoji-hover-color: #e7f0e4;
  --epr-category-label-text-color: #6b6250;
  --epr-category-icon-active-color: #166534;
}`}</style>
      <style>{SLIM_CSS}</style>
      <Root
        emojiStyle={EmojiStyle.NATIVE}
        onEmojiClick={onEmojiClick}
        className="slim-bar"
        style={{ width: 620, height: 300 }}
        aria-label="Emoji composer bar"
        searchPlaceholder="Search emojis…"
      >
        <div className="slim-col">
          <div className="slim-searchrow">
            <Search />
            <div className="slim-pick" aria-live="polite" title="Last pick">
              {last?.emoji ?? '😶'}
            </div>
          </div>
          <Viewport style={{ flex: 1, minHeight: 0 }}>
            <List />
          </Viewport>
          <div className="slim-hint" aria-hidden="true">
            ↑↓←→ navigate&ensp;·&ensp;Enter selects&ensp;·&ensp;Esc clears
          </div>
        </div>
      </Root>
    </div>
  );
}

const SLIM_CSS = `
.slim-bar-story {
  padding: 24px;
  background: #f4f1ea;
  border-radius: 12px;
}
.slim-bar-story *,
.slim-bar-story *::before,
.slim-bar-story *::after {
  box-sizing: border-box;
}
.slim-bar-story .slim-bar {
  background: #fffdf8;
  border: 1px solid #e3ddd0;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(120, 100, 60, 0.16);
  font-family: ui-sans-serif, system-ui, sans-serif;
  overflow: hidden;
}
.slim-bar-story .slim-col {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px 16px;
  gap: 8px;
}
.slim-bar-story .slim-searchrow {
  display: flex;
  align-items: center;
  gap: 8px;
}
.slim-bar-story .slim-searchrow [data-epr-part="search"] {
  flex: 1;
  min-width: 0;
}
.slim-bar-story [data-epr-part="search"] input {
  border-radius: 12px;
  font-size: 14px;
  border-width: 2px;
}
.slim-bar-story .slim-pick {
  font-size: 24px;
  width: 44px;
  height: 44px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f6f1e7;
  border: 1px solid #e3ddd0;
  border-radius: 12px;
}
.slim-bar-story .slim-hint {
  font-size: 11px;
  letter-spacing: 0.04em;
  color: #8a7f63;
  text-align: center;
}
`;

// ---------------------------------------------------------------------------
// 3. Sidebar explorer: airy light theme with a vertical category rail on
//    the left and the grid on the right. Tab order follows DOM order;
//    arrow-key category travel still moves between sibling tabs.
// ---------------------------------------------------------------------------
export function SidebarExplorer() {
  const { last, onEmojiClick } = useLastPick();
  const scope = '.sidebar-story .sidebar-explorer';
  return (
    <div className="sidebar-story">
      <style>{`${designTokens(scope)}
${scope} {
  --epr-text-color: #232946;
  --epr-bg-color: rgba(255, 255, 255, 0.9);
  --epr-picker-border-color: #dfe5f5;
  --epr-search-input-bg-color: #f1f4fc;
  --epr-category-padding: 0 16px;
  --epr-category-label-padding: 0 16px;
  --epr-category-label-bg-color: rgba(255, 255, 255, 0.92);
  --epr-category-label-text-color: #5b6486;
  --epr-category-icon-active-color: #3f5fe0;
  --epr-preview-text-color: #232946;
  --epr-preview-border-color: #e6ebf8;
  --epr-highlight-color: #3f5fe0;
  --epr-search-border-color-active: #b9c8f5;
  --epr-hover-bg-color: #e5edff;
}`}</style>
      <style>{SIDEBAR_CSS}</style>
      <Root
        emojiStyle={EmojiStyle.NATIVE}
        onEmojiClick={onEmojiClick}
        className="sidebar-explorer"
        style={{ width: 520, height: 560 }}
        searchPlaceholder="Search the library…"
        previewConfig={{
          defaultEmoji: '1f50d',
          defaultCaption: 'Browse the library',
          showPreview: true,
        }}
      >
        <div className="sidebar-body">
          <div className="sidebar-rail">
            <div className="sidebar-railhead">Browse</div>
            <CategoryNav aria-label="Categories" />
          </div>
          <div className="sidebar-main">
            <Search />
            <Viewport>
              <List />
            </Viewport>
          </div>
        </div>
        <Preview />
        <div className="sidebar-foot" aria-live="polite">
          {last ? `Selected ${last.emoji} (${last.names[0]})` : 'Hover or navigate to preview'}
        </div>
      </Root>
    </div>
  );
}

const SIDEBAR_CSS = `
.sidebar-story {
  padding: 24px;
  background: linear-gradient(135deg, #eef4ff, #f7f3ff);
  border-radius: 12px;
  font-family: ui-sans-serif, system-ui, sans-serif;
}
.sidebar-story *,
.sidebar-story *::before,
.sidebar-story *::after {
  box-sizing: border-box;
}
.sidebar-story .sidebar-explorer {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #dfe5f5;
  border-radius: 18px;
  box-shadow: 0 16px 40px rgba(80, 100, 180, 0.14);
  overflow: hidden;
}
.sidebar-story .sidebar-body {
  display: flex;
  min-height: 0;
  flex: 1;
}
.sidebar-story .sidebar-rail {
  width: 72px;
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: #eef1fa;
  border-right: 1px solid #e0e6f5;
  padding: 12px 8px;
  gap: 4px;
}
.sidebar-story .sidebar-railhead {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8a93b2;
  padding: 0 8px 8px;
}
.sidebar-story [data-epr-part="category-nav"] {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
/* The primitive shell only positions; the inner tablist view owns the
   tab layout, so the vertical stacking goes here, not on the part.
   Tabs distribute evenly across the rail height instead of bunching
   at the top; per-row grid math is unaffected (it uses the declared
   per-row count, not tab geometry). */
.sidebar-story [data-epr-part="category-nav"] > div {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  height: 100%;
  min-height: min-content;
  padding: 4px 0;
}
.sidebar-story [data-epr-part="category-tab"] {
  border-radius: 12px;
  position: relative;
  flex: none;
}
.sidebar-story [data-epr-part="category-tab"][aria-selected="true"] {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(63, 95, 224, 0.18);
}
.sidebar-story [data-epr-part="category-tab"][aria-selected="true"]::before {
  content: "";
  position: absolute;
  left: -8px;
  top: 10px;
  bottom: 10px;
  width: 4px;
  border-radius: 4px;
  background: #3f5fe0;
}
.sidebar-story .sidebar-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.sidebar-story [data-epr-part="search"] input:focus {
  border-color: #b9c8f5;
  background: #fff;
}
.sidebar-story [data-epr-part="category-label"] {
  font-weight: 600;
}
.sidebar-story .sidebar-foot {
  padding: 8px 16px 16px;
  font-size: 12px;
  color: #5b6486;
  border-top: 1px solid #e6ebf8;
}
`;
