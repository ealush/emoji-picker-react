import { fireEvent, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useBodyRef,
  useCategoryNavigationRef,
  usePickerMainRef,
  useReactionsRef,
  useSearchInputRef,
  useSkinTonePickerRef,
} from '../../src/components/context/ElementRefContext';
import {
  useNavigationRegistry,
  useSkinToneFanOpenState,
} from '../../src/components/context/PickerContext';
import { useDisallowMouseMove } from '../../src/hooks/useDisallowMouseMove';
import { useKeyboardNavigation } from '../../src/hooks/useKeyboardNavigation';
import { useAcceptedSearchValue } from '../../src/hooks/useSearchController';
import {
  useFocusCategoryNavigation,
  useFocusSearchInput,
  useFocusSkinTonePicker,
} from '../../src/hooks/useFocus';
import { NavigationRegistry } from '../../src/state/navigationRegistry';

// Mocks
vi.mock('../../src/components/context/ElementRefContext', () => ({
  useBodyRef: vi.fn(),
  useCategoryNavigationRef: vi.fn(),
  usePickerMainRef: vi.fn(),
  useReactionsRef: vi.fn(),
  useSearchInputRef: vi.fn(),
  useSkinTonePickerRef: vi.fn(),
}));

vi.mock('../../src/components/context/PickerContext', () => ({
  useSkinToneFanOpenState: vi.fn(() => [false, vi.fn()]),
  useReactionsModeState: vi.fn(() => [false, vi.fn()]),
  useNavigationRegistry: vi.fn(() => new NavigationRegistry()),
  useSearchComposingState: vi.fn(() => [false, vi.fn()]),
  useSearchDisplayState: vi.fn(() => ['', vi.fn()]),
  useSetActiveEmoji: vi.fn(() => vi.fn()),
  useSearchTermState: vi.fn(() => ['', vi.fn()]),
}));

vi.mock('../../src/config/useConfig', () => ({
  useSearchDisabledConfig: vi.fn(() => false),
  useVariationsDisabledConfig: vi.fn(() => false),
  useKeepSearchFocusConfig: vi.fn(() => false),
  useSuggestedEmojisConfig: vi.fn(() => undefined),
}));

vi.mock('../../src/components/context/PickerDataContext', () => ({
  usePickerDataContext: () => ({ emojiData: undefined }),
}));

vi.mock('../../src/hooks/useCloseAllOpenToggles', () => ({
  useCloseAllOpenToggles: vi.fn(() => vi.fn()),
  useHasOpenToggles: vi.fn(() => () => false),
}));

vi.mock('../../src/hooks/useDisallowMouseMove', () => ({
  useDisallowMouseMove: vi.fn(() => vi.fn()),
}));

vi.mock('../../src/hooks/useFilter', () => ({
  useFilter: vi.fn(() => ({
    onChange: vi.fn(),
    searchTerm: '',
    SearchInputRef: { current: null },
    statusSearchResults: '',
  })),
}));

vi.mock('../../src/hooks/useSearchController', () => ({
  useTypeToSearchKey: vi.fn(() => vi.fn()),
  useClearSearchValue: vi.fn(() => vi.fn()),
  useAcceptedSearchValue: vi.fn(() => ''),
}));

vi.mock('../../src/hooks/useFocus', () => ({
  useFocusCategoryNavigation: vi.fn(() => vi.fn()),
  useFocusSearchInput: vi.fn(() => vi.fn()),
  useFocusSkinTonePicker: vi.fn(() => vi.fn()),
}));

vi.mock('../../src/hooks/useIsSearchMode', () => ({
  default: vi.fn(() => false),
}));

vi.mock('../../src/hooks/useSetVariationPicker', () => ({
  default: vi.fn(() => vi.fn()),
}));

vi.mock('../../src/DomUtils/scrollTo', () => ({
  useScrollTo: vi.fn(() => vi.fn()),
}));

describe('useKeyboardNavigation', () => {
  let pickerMain: HTMLDivElement;
  let searchInput: HTMLInputElement;
  let registry: NavigationRegistry;

  beforeEach(() => {
    vi.clearAllMocks();
    // One registry per picker: regions registered here are what arrow
    // keys traverse (DOM order, since jsdom has no layout).
    registry = new NavigationRegistry();
    (useNavigationRegistry as any).mockReturnValue(registry);

    pickerMain = document.createElement('div');
    searchInput = document.createElement('input');

    pickerMain.appendChild(searchInput);
    // Traversal only considers regions connected to the document.
    document.body.appendChild(pickerMain);
    (usePickerMainRef as any).mockReturnValue({ current: pickerMain });
    (useSearchInputRef as any).mockReturnValue({ current: searchInput });
    (useBodyRef as any).mockReturnValue({
      current: document.createElement('div'),
    });
    (useCategoryNavigationRef as any).mockReturnValue({
      current: document.createElement('div'),
    });
    (useSkinTonePickerRef as any).mockReturnValue({
      current: document.createElement('div'),
    });
    (useReactionsRef as any).mockReturnValue({
      current: document.createElement('div'),
    });
  });

  afterEach(() => pickerMain.remove());

  it('runs an unhandled Escape once while leaving it available to the host', () => {
    const disallow = vi.fn();
    vi.mocked(useDisallowMouseMove).mockReturnValue(disallow);
    renderHook(() => useKeyboardNavigation());
    expect(fireEvent.keyDown(pickerMain, { key: 'Escape' })).toBe(true);
    expect(disallow).toHaveBeenCalledTimes(1);
  });

  it('attaches event listeners to picker main', () => {
    const addEventListenerSpy = vi.spyOn(pickerMain, 'addEventListener');
    renderHook(() => useKeyboardNavigation());
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
    );
  });

  it('clears the search and focuses it on Escape if toggles are closed', () => {
    const focusSearchInputMock = vi.fn();
    (useFocusSearchInput as any).mockReturnValue(focusSearchInputMock);
    (useAcceptedSearchValue as any).mockReturnValue('cat');

    renderHook(() => useKeyboardNavigation());

    expect(fireEvent.keyDown(pickerMain, { key: 'Escape' })).toBe(false);

    expect(focusSearchInputMock).toHaveBeenCalled();
  });

  it('leaves Escape to the host with nothing to undo', () => {
    const focusSearchInputMock = vi.fn();
    (useFocusSearchInput as any).mockReturnValue(focusSearchInputMock);
    (useAcceptedSearchValue as any).mockReturnValue('');

    renderHook(() => useKeyboardNavigation());

    expect(fireEvent.keyDown(pickerMain, { key: 'Escape' })).toBe(true);
    expect(focusSearchInputMock).not.toHaveBeenCalled();
  });

  describe('Search Input Navigation', () => {
    it('focuses skin tone picker on ArrowRight if in search mode', () => {
      const focusSkinTonePickerMock = vi.fn();
      const setSkinToneFanOpenStateMock = vi.fn();

      const region = document.createElement('div');
      region.setAttribute('data-epr-part', 'search');
      const tone = document.createElement('div');
      region.append(searchInput, tone);
      pickerMain.appendChild(region);
      (useSkinTonePickerRef as any).mockReturnValue({ current: tone });
      (useSkinToneFanOpenState as any).mockReturnValue([
        false,
        setSkinToneFanOpenStateMock,
      ]);

      (useFocusSkinTonePicker as any).mockReturnValue(focusSkinTonePickerMock);

      renderHook(() => useKeyboardNavigation());

      fireEvent.keyDown(searchInput, { key: 'ArrowRight' });

      expect(setSkinToneFanOpenStateMock).toHaveBeenCalledWith(true);
      expect(focusSkinTonePickerMock).toHaveBeenCalled();
    });

    it('goes down from search input on ArrowDown', () => {
      const focusCategoryNavigationMock = vi.fn();
      (useFocusCategoryNavigation as any).mockReturnValue(
        focusCategoryNavigationMock,
      );
      const categoryNav = document.createElement('div');
      pickerMain.appendChild(categoryNav);
      registry.register('search', searchInput);
      registry.register('categories', categoryNav);

      renderHook(() => useKeyboardNavigation());

      fireEvent.keyDown(searchInput, { key: 'ArrowDown' });

      expect(focusCategoryNavigationMock).toHaveBeenCalled();
    });
  });

  describe('Category Navigation', () => {
    let categoryNav: HTMLDivElement;

    beforeEach(() => {
      categoryNav = document.createElement('div');
      pickerMain.appendChild(categoryNav);
      (useCategoryNavigationRef as any).mockReturnValue({
        current: categoryNav,
      });
    });

    it('focuses search input on ArrowUp', () => {
      const focusSearchInputMock = vi.fn();
      (useFocusSearchInput as any).mockReturnValue(focusSearchInputMock);
      registry.register('search', searchInput);
      registry.register('categories', categoryNav);

      renderHook(() => useKeyboardNavigation());

      fireEvent.keyDown(categoryNav, { key: 'ArrowUp' });

      expect(focusSearchInputMock).toHaveBeenCalled();
    });
  });
});
