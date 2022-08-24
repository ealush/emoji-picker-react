import * as React from 'react';

type Props = Readonly<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}>;

export default function Flex({ children, className, style = {} }: Props) {
  return (
    <div style={{ ...style, display: 'flex' }} className={className}>
      {children}
    </div>
  );
}
