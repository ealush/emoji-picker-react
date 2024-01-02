import { cx } from 'flairup';
import * as React from 'react';

import './Flex.css';

export enum FlexDirection {
  ROW = 'FlexRow',
  COLUMN = 'FlexColumn'
}

type Props = Readonly<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  direction?: FlexDirection;
}>;

export default function Flex({
  children,
  className,
  style = {},
  direction = FlexDirection.ROW
}: Props) {
  return (
    <div style={{ ...style }} className={cx('Flex', className, direction)}>
      {children}
    </div>
  );
}
