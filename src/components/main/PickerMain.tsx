import * as React from 'react';
import { PickerContextProvider } from '../contextProvider/PickerContextProvider';
import './PickerMain.css';
import { useRef } from 'react';

type Props = Readonly<{
  children: React.ReactNode;
}>;

export default function PickerMain({ children }: Props) {
  const PickerMainRef = useRef<HTMLElement>(null);
  return (
    <PickerContextProvider PickerMainRef={PickerMainRef}>
      <aside className="EmojiPickerReact epr-main" ref={PickerMainRef}>
        {children}
      </aside>
    </PickerContextProvider>
  );
}
