import clsx from 'clsx';
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
    <button
      type="button"
      {...props}
      className={clsx('epr-btn', props.className)}
    >
      {props.children}
    </button>
  );
}
