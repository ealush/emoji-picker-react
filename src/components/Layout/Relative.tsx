import * as React from 'react';

type Props = Readonly<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  tabIndex?: number;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}>;

export default function Relative({ children, className, style, tabIndex, onKeyDown }: Props) {
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div style={{ ...style, position: 'relative' }} className={className} tabIndex={tabIndex} onKeyDown={onKeyDown}>
      {children}
    </div>
  );
}
