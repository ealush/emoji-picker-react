import * as React from 'react';

import { ClassNames, clsx } from '../../DomUtils/classNames';
import { useClassNameConfig, useStyleConfig, useThemeConfig } from '../../config/useConfig';
import useIsSearchMode from '../../hooks/useIsSearchMode';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useOnFocus } from '../../hooks/useOnFocus';
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
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}>;

function PickerRootElement({ children }: RootProps) {
  const theme = useThemeConfig();
  const searchModeActive = useIsSearchMode();
  const PickerMainRef = usePickerMainRef();
  const className = useClassNameConfig();
  const style = useStyleConfig();

  useKeyboardNavigation();
  useOnFocus();

  return (
    <aside
      className={clsx(ClassNames.emojiPicker, 'epr-main', {
        [ClassNames.searchActive]: searchModeActive,
        [ClassNames.darkTheme]: theme === Theme.DARK,
        [ClassNames.autoTheme]: theme === Theme.AUTO
      }, className)}
      ref={PickerMainRef}
      style={style}
    >
      {children}
    </aside>
  );
}
