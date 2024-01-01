import { cx } from 'flairup';
import * as React from 'react';

import { clsx } from '../../DomUtils/classNames';
import { sheet } from '../../DomUtils/stylesheet';

export enum FlexDirection {
  ROW = 'FlexRow',
  COLUMN = 'FlexColumn'
}

const styles = sheet.create({
  Flex: {
    '.': 'Flex',
    display: 'flex',
    flexDirection: 'var(--epr-flex-direction, row)'
  },
  FlexRow: {
    flexDirection: 'row'
  },
  FlexColumn: {
    flexDirection: 'column'
  }
});

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
    <div
      style={{ ...style }}
      className={clsx(
        cx(
          styles.Flex,
          direction === FlexDirection.ROW ? styles.FlexRow : styles.FlexColumn
        ),
        className
      )}
    >
      {children}
    </div>
  );
}
