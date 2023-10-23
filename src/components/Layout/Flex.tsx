import * as React from 'react';

import './Flex.css';
import { clsx } from '../../DomUtils/classNames';

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
    <div style={{ ...style }} className={clsx('Flex', className, direction)}>
      {children}
    </div>
  );
}
