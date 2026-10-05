import type { Meta } from '@storybook/react-vite';
import React from 'react';

import { SkinTonePickerLocation } from '../../src/primitives';
import * as Picker from '../../src/primitives';

import './tailwind.css';

const meta = {
  title: 'Integrations/Tailwind CSS',
  tags: ['integration'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

// Utilities go straight onto the parts' className. Tokens use arbitrary
// properties; nested parts use arbitrary variants. cssLayer="epr" puts the
// picker's CSS in the `epr` layer, declared before Tailwind's (see
// tailwind.css), so every utility wins without `!important`.
export function TailwindCSS() {
  return (
    <Picker.Root
      appearance="default"
      cssLayer="epr"
      skinTonePickerLocation={SkinTonePickerLocation.NONE}
      searchPlaceholder="Search emoji"
      className={[
        'h-[420px] w-[352px] rounded-2xl bg-white font-sans shadow-xl ring-1 ring-zinc-950/10',
        '[--epr-bg-color:var(--color-white)]',
        '[--epr-text-color:var(--color-zinc-600)]',
        '[--epr-highlight-color:var(--color-indigo-600)]',
        '[--epr-hover-bg-color:var(--color-indigo-50)]',
        '[--epr-focus-bg-color:var(--color-indigo-100)]',
        '[--epr-category-label-bg-color:color-mix(in_oklab,var(--color-white)_92%,transparent)]',
        '[--epr-category-label-text-color:var(--color-zinc-500)]',
        '[--epr-category-icon-active-color:var(--color-indigo-600)]',
        '[--epr-category-icon-inactive-color:var(--color-zinc-400)]',
        '[--epr-search-input-bg-color:var(--color-zinc-100)]',
        '[--epr-search-border-color:transparent]',
        '[--epr-search-border-color-active:var(--color-indigo-500)]',
        '[--epr-search-input-text-color:var(--color-zinc-900)]',
        '[--epr-search-input-placeholder-color:var(--color-zinc-500)]',
        '[--epr-search-input-border-radius:var(--radius-lg)]',
        '[--epr-emoji-size:26px]',
        '[--epr-category-navigation-button-size:22px]',
        '[--epr-header-padding:12px_var(--epr-horizontal-padding)]',
        '[&_[data-epr-part=emoji]]:rounded-lg',
        '[&_[data-epr-part=category-label]]:text-xs [&_[data-epr-part=category-label]]:font-semibold [&_[data-epr-part=category-label]]:uppercase [&_[data-epr-part=category-label]]:tracking-wider',
      ].join(' ')}
    >
      <Picker.Search />
      <Picker.CategoryNav className="border-b border-zinc-100 px-2" />
      <Picker.Viewport>
        <Picker.List />
        <Picker.Empty className="text-sm text-zinc-500" />
      </Picker.Viewport>
    </Picker.Root>
  );
}
