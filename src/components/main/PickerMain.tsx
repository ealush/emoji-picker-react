import clsx from 'clsx';
import * as React from 'react';

import { useThemeConfig } from '../../config/useConfig';
import { ClassNames } from '../../DomUtils/classNames';
import useIsSearchMode from '../../hooks/useIsSearchMode';
import { Theme } from '../../types/exposedTypes';
import { usePickerMainRef } from '../context/ElementRefContext';
import { PickerContextProvider } from '../context/PickerContext';
import './PickerMain.css';

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
  return (
    <aside
      className={clsx('EmojiPickerReact', 'epr-main', {
        [ClassNames.searchActive]: searchModeActive,
        'epr-dark-theme': theme === Theme.DARK
      })}
      ref={PickerMainRef}
    >
      {children}
    </aside>
  );
}
