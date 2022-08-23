import * as React from 'react';

type Props = Readonly<{
  children: React.ReactNode;
  className?: string;
}>;

export default function Relative({ children, className }: Props) {
  return (
    <div style={{ position: 'relative' }} className={className}>
      {children}
    </div>
  );
}
