import * as React from 'react';
import { cx } from 'shipstyles';

type Props = Readonly<{
  className?: string;
  style?: React.CSSProperties;
}>;

export default function Space({ className, style = {} }: Props) {
  return <div style={{ flex: 1, ...style }} className={cx(className)} />;
}
