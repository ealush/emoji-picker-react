import clsx from 'clsx';
import * as React from 'react';

type Props = Readonly<{
  className?: string;
  style?: React.CSSProperties;
}>;

export default function Space({ className, style = {} }: Props) {
  return <div style={{ flex: 1, ...style }} className={clsx(className)} />;
}
