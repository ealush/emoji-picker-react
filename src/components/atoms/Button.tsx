import * as React from 'react';
import { cx } from 'shipstyles';

import { stylesheet } from '../../Stylesheet/stylesheet';
import { useDefaultAppearance } from '../../primitives/appearance';

interface Props extends React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> {
  className?: string;
}

export function Button(props: Props) {
  const appearance = useDefaultAppearance();
  return (
    <button
      type="button"
      {...props}
      className={cx(appearance && buttonStyles.button, props.className)}
    >
      {props.children}
    </button>
  );
}

export const buttonStyles = /* @__PURE__ */ (() =>
  stylesheet.create({
    button: {
      '.': 'epr-btn',
      cursor: 'pointer',
      border: '0',
      // Longhand, not `background: 'none'`: a shorthand reset shares its
      // conflict keys with every background longhand, so cx() would drop
      // this whole class wherever a later class sets background-image
      // (e.g. the category nav sprite) and the native button face would
      // show through.
      backgroundColor: 'transparent',
      outline: 'none',
    },
  }))();
