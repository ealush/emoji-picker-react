import * as React from 'react';

type Props = Readonly<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  button?: boolean;
  tabIndex?: number;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}>;

export default function Relative({
  children,
  className,
  style,
  button,
  tabIndex,
  onKeyDown
}: Props) {
  return button ? (
    <button
      style={{ ...style, position: 'relative' }}
      className={className}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
    >{children}</button>
  ) : (
    <div style={{ ...style, position: 'relative' }} className={className}>
      {children}
    </div>
  );
}
