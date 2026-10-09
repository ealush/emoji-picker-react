import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { expect, it } from 'vitest';

import { ElementRefContextProvider } from '../src/components/context/ElementRefContext';
import { PickerConfigProvider } from '../src/components/context/PickerConfigContext';
import { PickerContextProvider } from '../src/components/context/PickerContext';
import {
  PickerDataProvider,
  usePickerDataContext,
} from '../src/components/context/PickerDataContext';
import { formatSearchResultsLabel, useLabels } from '../src/config/useConfig';
import { useVisibleSearchResultCount } from '../src/hooks/useSearchResults';
import { useFilter } from '../src/hooks/useFilter';
import { Categories, EmojiStyle } from '../src/types/exposedTypes';

function Probe() {
  const { queryFilterDict } = usePickerDataContext();
  const { onChange } = useFilter();
  const count = useVisibleSearchResultCount();
  const labels = useLabels();
  const statusSearchResults =
    count === null ? '' : formatSearchResultsLabel(labels, count);
  return (
    <>
      <input
        aria-label="query"
        onChange={(event) => onChange(event.target.value)}
      />
      <output role="status">{statusSearchResults}</output>
      <span data-testid="canonical-count">
        {Object.keys(queryFilterDict('hand')).length}
      </span>
    </>
  );
}

it('counts canonical visible results rather than skin-tone aliases or hidden matches', async () => {
  render(
    <ElementRefContextProvider>
      <PickerConfigProvider
        emojiStyle={EmojiStyle.NATIVE}
        categories={[Categories.SMILEYS_PEOPLE]}
        hiddenEmojis={['1f603']}
        emojiData={{
          categories: {},
          emojis: {
            [Categories.SMILEYS_PEOPLE]: [
              {
                u: '1f44b',
                n: ['hand wave'],
                a: '1',
                v: ['1f44b-1f3fb', '1f44b-1f3fc'],
              },
              { u: '1f603', n: ['hand grin'], a: '1' },
            ],
          },
        }}
      >
        <PickerDataProvider>
          <PickerContextProvider>
            <Probe />
          </PickerContextProvider>
        </PickerDataProvider>
      </PickerConfigProvider>
    </ElementRefContextProvider>,
  );
  expect(screen.getByTestId('canonical-count')).toHaveTextContent('2');
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hand' } });
  await act(() => new Promise((resolve) => setTimeout(resolve, 300)));
  expect(screen.getByRole('status')).toHaveTextContent('1 result found');
});
