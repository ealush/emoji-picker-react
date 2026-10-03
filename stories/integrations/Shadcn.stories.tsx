import * as Popover from '@radix-ui/react-popover';
import type { Meta } from '@storybook/react-vite';
import { clsx, type ClassValue } from 'clsx';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { SkinTonePickerLocation } from '../../src';
import * as Picker from '../../src/primitives';

import './tailwind.css';
import './shadcn.css';

const meta = {
  title: 'Integrations/shadcn ui',
  tags: ['integration'],
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;

// --- what `npx shadcn add` gives you -------------------------------------
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const buttonClass =
  'inline-flex size-9 items-center justify-center rounded-md border border-[var(--input)] bg-[var(--background)] text-[var(--foreground)] shadow-xs transition-colors hover:bg-[var(--accent)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_oklab,var(--ring)_50%,transparent)]';

const popoverContentClass =
  'z-50 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--popover)] text-[var(--popover-foreground)] shadow-md outline-hidden';

// --- the emoji picker as a shadcn-style component -------------------------
// Copy into components/ui/emoji-picker.tsx. It reads the shadcn theme
// variables (shadcn.css), so light/dark and custom themes just work.
function EmojiPicker({
  className,
  onEmojiSelect,
}: {
  className?: string;
  onEmojiSelect: (emoji: string) => void;
}) {
  return (
    <Picker.Root
      cssLayer="epr"
      className={cn('shadcn-emoji-picker h-[368px] w-[324px] bg-transparent', className)}
      skinTonePickerLocation={SkinTonePickerLocation.NONE}
      searchPlaceholder="Search emoji…"
      onEmojiClick={(emoji) => onEmojiSelect(emoji.emoji)}
    >
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-2 py-2">
        <Picker.Search className="flex-1 [&>*]:p-0" />
        <Picker.SkinTone />
      </div>
      <Picker.CategoryNav className="border-b border-[var(--border)] [&>*]:px-3 [&>*]:py-2" />
      <Picker.Viewport>
        <Picker.List className="[&_[data-epr-part=category-label]]:text-xs [&_[data-epr-part=category-label]]:font-medium [&_[data-epr-part=category-label]]:normal-case [&_[data-epr-part=emoji]]:rounded-md" />
        <Picker.Empty className="py-6 text-sm text-[var(--muted-foreground)]" />
      </Picker.Viewport>
    </Picker.Root>
  );
}

// --- usage -----------------------------------------------------------------
function Composer({ dark = false }: { dark?: boolean }) {
  const [message, setMessage] = useState('Ship it ');
  return (
    <div
      className={cn(
        'shadcn-theme flex h-[460px] w-[400px] items-start gap-2 rounded-xl bg-[var(--background)] p-4 font-sans',
        dark && 'dark',
      )}
    >
      <input
        aria-label="Message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        className="h-9 flex-1 rounded-md border border-[var(--input)] bg-transparent px-3 text-sm text-[var(--foreground)] shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_oklab,var(--ring)_50%,transparent)]"
      />
      <Popover.Root defaultOpen>
        <Popover.Trigger className={buttonClass} aria-label="Insert emoji">
          😊
        </Popover.Trigger>
        {/* Rendered without a Portal so the story root contains it. */}
        <Popover.Content
          align="end"
          sideOffset={6}
          className={popoverContentClass}
        >
          <EmojiPicker onEmojiSelect={(emoji) => setMessage((m) => m + emoji)} />
        </Popover.Content>
      </Popover.Root>
    </div>
  );
}

export function ShadcnLight() {
  return <Composer />;
}

export function ShadcnDark() {
  return <Composer dark />;
}
