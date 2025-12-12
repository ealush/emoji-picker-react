/* eslint-env jest */
import { render } from '@testing-library/react';
import * as React from 'react';
import '@testing-library/jest-dom';

import EmojiPicker from '../index';
import { Categories } from '../types/exposedTypes';

// Mock IntersectionObserver
// eslint-disable-next-line no-undef
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
} as any;

describe('Custom Category Icons', () => {
  test('Renders custom icon from categoryIcons prop', async () => {
    const CustomIcon = () => (
      <div data-testid="custom-suggested-icon">MyIcon</div>
    );

    const { getByTestId } = render(
      <EmojiPicker
        categoryIcons={{
          [Categories.SUGGESTED]: <CustomIcon />
        }}
      />
    );

    const icon = getByTestId('custom-suggested-icon');
    expect(icon).toBeInTheDocument();
  });

  test('Renders custom icon from categories array config', async () => {
    const CustomIcon = () => (
      <div data-testid="custom-array-icon">ArrayIcon</div>
    );

    const { getByTestId } = render(
      <EmojiPicker
        categories={[
          {
            category: Categories.SMILEYS_PEOPLE,
            name: 'Smileys',
            icon: <CustomIcon />
          }
        ]}
      />
    );

    const icon = getByTestId('custom-array-icon');
    expect(icon).toBeInTheDocument();
  });
});
