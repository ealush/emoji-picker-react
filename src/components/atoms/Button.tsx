import { cx } from 'flairup';
import * as React from 'react';

interface Props
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  className?: string;
}

export function Button(props: Props) {
  return (
    <button type="button" {...props} className={cx('epr-btn', props.className)}>
      {props.children}
    </button>
  );
}
