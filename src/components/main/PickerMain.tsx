import * as React from 'react';
import './PickerMain.css';

type Props = Readonly<{
  children: React.ReactNode;
}>;

export default function PickerMain({ children }: Props) {
  return <aside className="EmojiPickerReact epr-main">{children}</aside>;
}
