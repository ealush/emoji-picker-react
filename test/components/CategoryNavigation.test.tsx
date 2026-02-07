
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryNavigation } from '../../src/components/navigation/CategoryNavigation';
import { Categories } from '../../src/types/exposedTypes';

// Mocks
vi.mock('../../src/components/context/ElementRefContext', () => ({
  useCategoryNavigationRef: vi.fn()
}));

vi.mock('../../src/components/context/PickerContext', () => ({
  useVisibleCategoriesState: vi.fn()
}));

vi.mock('../../src/config/useConfig', () => ({
  useCategoriesConfig: vi.fn(),
  useClassNameConfig: vi.fn(() => '')
}));

vi.mock('../../src/hooks/useActiveCategoryScrollDetection', () => ({
  useActiveCategoryScrollDetection: vi.fn()
}));

vi.mock('../../src/hooks/useIsSearchMode', () => ({
  default: vi.fn()
}));

vi.mock('../../src/hooks/useScrollCategoryIntoView', () => ({
  useScrollCategoryIntoView: vi.fn()
}));

vi.mock('../../src/hooks/useShouldHideCustomEmojis', () => ({
  useShouldHideCustomEmojis: vi.fn()
}));

// Mock CategoryButton to simplify testing
vi.mock('../../src/components/navigation/CategoryButton', () => ({
  CategoryButton: ({ category, onClick }: any) => (
    <button data-testid={`category-btn-${category}`} onClick={onClick}>
      {category}
    </button>
  )
}));

import { useCategoriesConfig } from '../../src/config/useConfig';
import { useVisibleCategoriesState } from '../../src/components/context/PickerContext';
import { useCategoryNavigationRef } from '../../src/components/context/ElementRefContext';
import { useScrollCategoryIntoView } from '../../src/hooks/useScrollCategoryIntoView';
import useIsSearchMode from '../../src/hooks/useIsSearchMode';
import { useShouldHideCustomEmojis } from '../../src/hooks/useShouldHideCustomEmojis';

describe('CategoryNavigation', () => {
  const setVisibleCategoriesMock = vi.fn();
  const scrollCategoryIntoViewMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useCategoryNavigationRef as any).mockReturnValue({ current: null });
    (useCategoriesConfig as any).mockReturnValue([
      { category: Categories.SMILEYS_PEOPLE, name: 'Smileys & People' },
      { category: Categories.ANIMALS_NATURE, name: 'Animals & Nature' }
    ]);
    (useVisibleCategoriesState as any).mockReturnValue([new Set(), setVisibleCategoriesMock]);
    (useScrollCategoryIntoView as any).mockReturnValue(scrollCategoryIntoViewMock);
    (useIsSearchMode as any).mockReturnValue(false);
    (useShouldHideCustomEmojis as any).mockReturnValue(false);
  });

  it('renders categories', () => {
    render(<CategoryNavigation />);
    expect(screen.getByTestId(`category-btn-${Categories.SMILEYS_PEOPLE}`)).toBeDefined();
    expect(screen.getByTestId(`category-btn-${Categories.ANIMALS_NATURE}`)).toBeDefined();
  });

  it('scrolls to category on click', () => {
    render(<CategoryNavigation />);
    fireEvent.click(screen.getByTestId(`category-btn-${Categories.ANIMALS_NATURE}`));
    expect(scrollCategoryIntoViewMock).toHaveBeenCalledWith(Categories.ANIMALS_NATURE);
  });

  it('hides custom category if shouldHideCustomEmojis is true', () => {
    (useCategoriesConfig as any).mockReturnValue([
      { category: Categories.CUSTOM, name: 'Custom' }
    ]);
    (useShouldHideCustomEmojis as any).mockReturnValue(true);

    const { container } = render(<CategoryNavigation />);
    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
