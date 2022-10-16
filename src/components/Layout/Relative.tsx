import * as React from 'react';

type Props = Readonly<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}>;

export default function Relative({ children, className, style }: Props) {
  return (
    <div style={{ ...style, position: 'relative' }} className={className}>
      {children}
    </div>
  );
}
