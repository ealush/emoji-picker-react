import * as React from 'react';
import {
  PickerContextProvider,
  usePickerMainRef
} from '../contextProvider/PickerContextProvider';
import './PickerMain.css';
import { useRef } from 'react';

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
  const PickerMainRef = usePickerMainRef();
  return (
    <aside className="EmojiPickerReact epr-main" ref={PickerMainRef}>
      {children}
    </aside>
  );
}
