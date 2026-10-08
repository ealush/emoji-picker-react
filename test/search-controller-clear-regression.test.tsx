import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { expect, it, vi } from 'vitest';

import {
  ElementRefContextProvider,
  useSearchInputRef,
} from '../src/components/context/ElementRefContext';
import { PickerConfigProvider } from '../src/components/context/PickerConfigContext';
import { PickerContextProvider } from '../src/components/context/PickerContext';
import { PickerDataProvider } from '../src/components/context/PickerDataContext';
import {
  MutableConfigProvider,
  useDefineMutableConfig,
} from '../src/config/mutableConfig';
import { useClearSearchValue } from '../src/hooks/useSearchController';

function Probe() {
  const ref = useSearchInputRef();
  const clear = useClearSearchValue();
  return (
    <>
      <input ref={ref} defaultValue="cat" aria-label="accepted query" />
      <button onClick={clear}>Clear proposal</button>
    </>
  );
}

function Harness({
  onSearchChange,
}: {
  onSearchChange: (value: string) => void;
}) {
  const callbacks = useDefineMutableConfig({ onSearchChange });
  return (
    <MutableConfigProvider value={callbacks}>
      <ElementRefContextProvider>
        <PickerConfigProvider
          searchValue="cat"
          emojiData={{ categories: {}, emojis: {} }}
        >
          <PickerDataProvider>
            <PickerContextProvider>
              <Probe />
            </PickerContextProvider>
          </PickerDataProvider>
        </PickerConfigProvider>
      </ElementRefContextProvider>
    </MutableConfigProvider>
  );
}

it('does not directly clear the DOM when the parent rejects a controlled clear proposal', async () => {
  const onSearchChange = vi.fn();
  render(<Harness onSearchChange={onSearchChange} />);
  fireEvent.click(screen.getByRole('button'));
  expect(onSearchChange).toHaveBeenCalledWith('');
  expect(screen.getByRole('textbox')).toHaveValue('cat');
  await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
  expect(document.activeElement).toBe(screen.getByRole('textbox'));
});
