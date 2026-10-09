import type { Meta } from '@storybook/react-vite';
import React from 'react';
import styled, { ThemeProvider } from 'styled-components';

import * as Picker from '../../src/primitives';

const meta = {
  title: 'Integrations/styled-components',
  tags: ['integration'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

const theme = {
  bg: '#0f172a',
  panel: '#111c33',
  text: '#cbd5e1',
  accent: '#22d3ee',
  muted: '#1e293b',
};

// styled(Root) owns the chrome and explicitly opts into managed leaf
// appearance for this token-based recipe.
const ThemedPicker = styled(Picker.Root).attrs({ appearance: 'default' })`
  --epr-bg-color: ${(p) => p.theme.panel};
  --epr-text-color: ${(p) => p.theme.text};
  --epr-highlight-color: ${(p) => p.theme.accent};
  --epr-hover-bg-color: ${(p) => p.theme.muted};
  --epr-focus-bg-color: #263449;
  --epr-search-input-bg-color: ${(p) => p.theme.muted};
  --epr-search-border-color: ${(p) => p.theme.muted};
  --epr-search-border-color-active: ${(p) => p.theme.accent};
  --epr-search-input-text-color: #f1f5f9;
  --epr-search-input-placeholder-color: #94a3b8;
  --epr-category-label-bg-color: ${(p) => p.theme.panel}f2;
  --epr-category-label-text-color: #94a3b8;
  --epr-category-icon-active-color: ${(p) => p.theme.accent};
  --epr-category-icon-inactive-color: #64748b;
  --epr-preview-text-color: #f1f5f9;
  --epr-preview-border-color: ${(p) => p.theme.muted};
  --epr-skin-tone-picker-menu-color: ${(p) => p.theme.panel};
  --epr-emoji-variation-picker-bg-color: ${(p) => p.theme.panel};
  border-radius: 18px;
  background: ${(p) => p.theme.panel};
  box-shadow:
    0 0 0 1px #1e293b,
    0 20px 40px rgb(2 6 23 / 60%);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  color: ${(p) => p.theme.text};

  [data-epr-part='category-label'] {
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
`;

export function StyledComponents() {
  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: 24, borderRadius: 24, background: theme.bg }}>
        <ThemedPicker style={{ width: 340, height: 440 }}>
          <Picker.Search />
          <Picker.CategoryNav />
          <Picker.Viewport>
            <Picker.List />
            <Picker.Empty />
            <Picker.Loading />
            <Picker.LoadError />
          </Picker.Viewport>
          <Picker.Preview />
        </ThemedPicker>
      </div>
    </ThemeProvider>
  );
}
