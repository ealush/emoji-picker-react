import * as React from 'react';

type Props = Readonly<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}>;

export default function Absolute({ children, className, style }: Props) {
  return (
    <div style={{ ...style, position: 'absolute' }} className={className}>
      {children}
    </div>
  );
}
