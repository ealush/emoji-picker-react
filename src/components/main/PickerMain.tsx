import * as React from 'react';
import {
  PickerContextProvider,
  usePickerMainRef
} from '../context/PickerContext';
import './PickerMain.css';
import { useRef } from 'react';
import useIsSearchMode from '../../hooks/useIsSearchMode';
import clsx from 'clsx';

type Props = Readonly<{
  children: React.ReactNode;
}>;

export default function PickerMain({ children }: Props) {
  const PickerMainRef = useRef<HTMLElement>(null);
  return (
    <PickerContextProvider PickerMainRef={PickerMainRef}>
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
