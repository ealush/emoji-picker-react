import * as React from 'react';

type Props = Readonly<{
  children: React.ReactNode;
}>;

export default function EmojiPickerMain({ children }: Props) {
  return <aside>{children}</aside>;
}
