import { fireEvent, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useKeyboardNavigation } from '../../src/hooks/useKeyboardNavigation';
import {
  useBodyRef,
  useCategoryNavigationRef,
  usePickerMainRef,
  useSearchInputRef,
  useSkinTonePickerRef
} from '../../src/components/context/ElementRefContext';
import {
  useFocusCategoryNavigation,
  useFocusSearchInput,
  useFocusSkinTonePicker
} from '../../src/hooks/useFocus';
import { useSkinToneFanOpenState } from '../../src/components/context/PickerContext';
import { useIsSkinToneInSearch } from '../../src/hooks/useShouldShowSkinTonePicker';

// Mocks
vi.mock('../../src/components/context/ElementRefContext', () => ({
  useBodyRef: vi.fn(),
  useCategoryNavigationRef: vi.fn(),
  usePickerMainRef: vi.fn(),
  useSearchInputRef: vi.fn(),
  useSkinTonePickerRef: vi.fn()
}));

vi.mock('../../src/components/context/PickerContext', () => ({
  useSkinToneFanOpenState: vi.fn(() => [false, vi.fn()])
}));

vi.mock('../../src/config/useConfig', () => ({
  useSearchDisabledConfig: vi.fn(() => false)
}));

vi.mock('../../src/hooks/useCloseAllOpenToggles', () => ({
  useCloseAllOpenToggles: vi.fn(() => vi.fn()),
  useHasOpenToggles: vi.fn(() => () => false)
}));

vi.mock('../../src/hooks/useDisallowMouseMove', () => ({
  useDisallowMouseMove: vi.fn(() => vi.fn())
}));

vi.mock('../../src/hooks/useFilter', () => ({
  useAppendSearch: vi.fn(() => vi.fn()),
  useClearSearch: vi.fn(() => vi.fn())
}));

vi.mock('../../src/hooks/useFocus', () => ({
  useFocusCategoryNavigation: vi.fn(() => vi.fn()),
  useFocusSearchInput: vi.fn(() => vi.fn()),
  useFocusSkinTonePicker: vi.fn(() => vi.fn())
}));

vi.mock('../../src/hooks/useIsSearchMode', () => ({
  default: vi.fn(() => false)
}));

vi.mock('../../src/hooks/useSetVariationPicker', () => ({
  default: vi.fn(() => vi.fn())
}));

vi.mock('../../src/hooks/useShouldShowSkinTonePicker', () => ({
  useIsSkinToneInPreview: vi.fn(() => false),
  useIsSkinToneInSearch: vi.fn(() => false)
}));

vi.mock('../../src/DomUtils/scrollTo', () => ({
  useScrollTo: vi.fn(() => vi.fn())
}));

describe('useKeyboardNavigation', () => {
  let pickerMain: HTMLDivElement;
  let searchInput: HTMLInputElement;

  beforeEach(() => {
    vi.clearAllMocks();
    
    pickerMain = document.createElement('div');
    searchInput = document.createElement('input');

    (usePickerMainRef as any).mockReturnValue({ current: pickerMain });
    (useSearchInputRef as any).mockReturnValue({ current: searchInput });
    (useBodyRef as any).mockReturnValue({ current: document.createElement('div') });
    (useCategoryNavigationRef as any).mockReturnValue({ current: document.createElement('div') });
    (useSkinTonePickerRef as any).mockReturnValue({ current: document.createElement('div') });
  });

  it('attaches event listeners to picker main', () => {
    const addEventListenerSpy = vi.spyOn(pickerMain, 'addEventListener');
    renderHook(() => useKeyboardNavigation());
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('focuses search input on Escape if toggles are closed', () => {
    const focusSearchInputMock = vi.fn();
    (useFocusSearchInput as any).mockReturnValue(focusSearchInputMock);

    renderHook(() => useKeyboardNavigation());

    fireEvent.keyDown(pickerMain, { key: 'Escape' });

    expect(focusSearchInputMock).toHaveBeenCalled();
  });

  describe('Search Input Navigation', () => {
    it('focuses skin tone picker on ArrowRight if in search mode', () => {
      const focusSkinTonePickerMock = vi.fn();
      const setSkinToneFanOpenStateMock = vi.fn();
      
      (useIsSkinToneInSearch as any).mockReturnValue(true);
      (useSkinToneFanOpenState as any).mockReturnValue([false, setSkinToneFanOpenStateMock]);

      (useFocusSkinTonePicker as any).mockReturnValue(focusSkinTonePickerMock);

      renderHook(() => useKeyboardNavigation());

      fireEvent.keyDown(searchInput, { key: 'ArrowRight' });

      expect(setSkinToneFanOpenStateMock).toHaveBeenCalledWith(true);
      expect(focusSkinTonePickerMock).toHaveBeenCalled();
    });

    it('goes down from search input on ArrowDown', () => {
      const focusCategoryNavigationMock = vi.fn();
      (useFocusCategoryNavigation as any).mockReturnValue(focusCategoryNavigationMock);

      renderHook(() => useKeyboardNavigation());

      fireEvent.keyDown(searchInput, { key: 'ArrowDown' });

      expect(focusCategoryNavigationMock).toHaveBeenCalled();
    });
  });

  describe('Category Navigation', () => {
    let categoryNav: HTMLDivElement;

    beforeEach(() => {
      categoryNav = document.createElement('div');
      (useCategoryNavigationRef as any).mockReturnValue({ current: categoryNav });
    });

    it('focuses search input on ArrowUp', () => {
      const focusSearchInputMock = vi.fn();
      (useFocusSearchInput as any).mockReturnValue(focusSearchInputMock);

      renderHook(() => useKeyboardNavigation());

      fireEvent.keyDown(categoryNav, { key: 'ArrowUp' });

      expect(focusSearchInputMock).toHaveBeenCalled();
    });
  });
});
