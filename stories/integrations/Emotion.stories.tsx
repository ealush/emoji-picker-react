/** @jsxImportSource @emotion/react */
import { css, ThemeProvider, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import type { Meta } from '@storybook/react-vite';

import { SkinTonePickerLocation } from '../../src';
import * as Picker from '../../src/primitives';

const meta = {
  title: 'Integrations/Emotion',
  tags: ['integration'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

const theme = {
  colors: {
    surface: '#fffaf3',
    text: '#5c4a3a',
    accent: '#d9480f',
    accentSoft: '#ffe8cc',
    border: '#f1dfc8',
  },
  radius: 14,
};

type AppTheme = typeof theme;

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends AppTheme {}
}

// styled() wraps the Root primitive directly: Emotion's generated class
// lands on the picker element, and its (unlayered) rules beat the
// picker's layered defaults without specificity tricks.
const ThemedRoot = styled(Picker.Root)(({ theme: t }) => ({
  '--epr-bg-color': t.colors.surface,
  '--epr-text-color': t.colors.text,
  '--epr-highlight-color': t.colors.accent,
  '--epr-hover-bg-color': t.colors.accentSoft,
  '--epr-focus-bg-color': t.colors.accentSoft,
  '--epr-search-input-bg-color': '#ffffff',
  '--epr-search-border-color': t.colors.border,
  '--epr-search-border-color-active': t.colors.accent,
  '--epr-category-label-bg-color': `${t.colors.surface}f0`,
  '--epr-category-label-text-color': t.colors.text,
  '--epr-category-icon-active-color': t.colors.accent,
  '--epr-category-icon-inactive-color': '#a08a76',
  '--epr-preview-text-color': t.colors.text,
  width: 360,
  height: 430,
  borderRadius: t.radius,
  border: `1px solid ${t.colors.border}`,
  background: t.colors.surface,
  boxShadow: '0 12px 32px rgb(92 74 58 / 18%)',
  fontFamily: 'Georgia, "Iowan Old Style", serif',
}));

function Picker2() {
  const t = useTheme();
  return (
    <ThemedRoot
      skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
      searchPlaceholder="Find an emoji"
    >
      <Picker.Search />
      <Picker.CategoryNav
        css={css`
          border-bottom: 1px dashed ${t.colors.border};
        `}
      />
      <Picker.Viewport>
        <Picker.List
          css={css`
            [data-epr-part='category-label'] {
              font-style: italic;
              text-transform: none;
            }
          `}
        />
      </Picker.Viewport>
      <Picker.Preview />
    </ThemedRoot>
  );
}

export function Emotion() {
  return (
    <ThemeProvider theme={theme}>
      <Picker2 />
    </ThemeProvider>
  );
}
