import * as React from 'react';
import { PickerContextProvider } from '../context/PickerContext';
import './PickerMain.css';
import useIsSearchMode from '../../hooks/useIsSearchMode';
import clsx from 'clsx';
import { usePickerMainRef } from '../context/ElementRefContext';

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
  const searchModeActive = useIsSearchMode();
  const PickerMainRef = usePickerMainRef();
  return (
    <aside
      className={clsx('EmojiPickerReact', 'epr-main', {
        'epr-search-active': searchModeActive
      })}
      ref={PickerMainRef}
    >
      {children}
    </aside>
  );
}
