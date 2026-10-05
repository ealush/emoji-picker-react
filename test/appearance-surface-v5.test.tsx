import { render } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import * as Picker from '../src/primitives';

vi.mock('../src/hooks/preloadEmoji', () => ({
  preloadEmojiIfNeeded: () => undefined,
  preloadEmoji: () => undefined,
  preloadedEmojs: new Set(),
}));

function Composition(props: Partial<Picker.RootProps>) {
  return (
    <Picker.Root {...props}>
      <Picker.Viewport>
        <Picker.List />
      </Picker.Viewport>
    </Picker.Root>
  );
}

const root = (container: HTMLElement) =>
  container.querySelector('[data-epr-part="root"]')!;

describe('Root appearance surface', () => {
  it('paints the token surface at zero specificity with appearance="default"', () => {
    const { container } = render(
      <Composition appearance="default" colorScheme="dark" />,
    );
    expect(root(container).classList).toContain('epr-appearance-default');
    const css = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent)
      .join('\n');
    expect(css).toContain(
      ':where(.epr-appearance-default){background-color:var(--epr-bg-color);}',
    );
  });

  it('leaves a bare Root unpainted', () => {
    const { container } = render(<Composition colorScheme="dark" />);
    expect(root(container).classList).not.toContain('epr-appearance-default');
  });
});
