import clsx from 'clsx';
import * as React from 'react';

import { ClassNames } from '../../DomUtils/classNames';
import { usePickerSizeConfig, useSearchQuery, useThemeConfig } from '../../config/useConfig';
import useIsSearchMode from '../../hooks/useIsSearchMode';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useOnFocus } from '../../hooks/useOnFocus';
import { Theme } from '../../types/exposedTypes';
import { usePickerMainRef } from '../context/ElementRefContext';
import { PickerContextProvider } from '../context/PickerContext';
import './PickerMain.css';
import { useFilter } from '../../hooks/useFilter';

type Props = Readonly<{
  children: React.ReactNode;
}>;

export default function PickerMain({ children }: Props) {
  return (
    <PickerContextProvider>
      <PickerRootElement>{children}</PickerRootElement>
    </PickerContextProvider>
  );
}

type RootProps = Readonly<{
  children: React.ReactNode;
}>;

function PickerRootElement({ children }: RootProps) {
  const theme = useThemeConfig();
  const searchModeActive = useIsSearchMode();
  const PickerMainRef = usePickerMainRef();
  const { height, width } = usePickerSizeConfig();

  const filter = useFilter();
  const searchQuery = useSearchQuery();
  React.useEffect(() => {
    filter.onChange(searchQuery)
  }, [searchQuery]);
  
  useKeyboardNavigation();
  useOnFocus();

  const style = {
    height,
    width
  };

  return (
    <aside
      className={clsx(ClassNames.emojiPicker, 'epr-main', {
        [ClassNames.searchActive]: searchModeActive,
        'epr-dark-theme': theme === Theme.DARK
      })}
      ref={PickerMainRef}
      style={style}
    >
      {children}
    </aside>
  );
}
