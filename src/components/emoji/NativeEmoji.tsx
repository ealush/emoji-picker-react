import * as React from 'react';

import { ClassNames, clsx } from '../../DomUtils/classNames';
import { parseNativeEmoji } from '../../dataUtils/parseNativeEmoji';

export function NativeEmoji({
  unified,
  style
}: {
  unified: string;
  style: React.CSSProperties;
}) {
  return (
    <span
      className={clsx(ClassNames.external, 'epr-emoji-native')}
      data-unified={unified}
      style={style}
    >
      {parseNativeEmoji(unified)}
    </span>
  );
}
