import { cx } from 'flairup';
import * as React from 'react';

import { stylesheet } from '../../Stylesheet/stylesheet';

interface Props
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  className?: string;
}

export function Button(props: Props) {
  return (
    <button
      type="button"
      {...props}
      className={cx(styles.button, props.className)}
    >
      {props.children}
    </button>
  );
}

const styles = stylesheet.create({
  button: {
    '.': 'epr-btn',
    cursor: 'pointer',
    border: '0',
    background: 'none',
    outline: 'none'
  }
});
