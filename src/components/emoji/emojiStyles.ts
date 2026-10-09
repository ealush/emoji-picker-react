import { ClassNames } from '../../DomUtils/classNames';
import { stylesheet } from '../../Stylesheet/stylesheet';

export const emojiStyles = /* @__PURE__ */ (() =>
  stylesheet.create({
    external: {
      '.': ClassNames.external,
      fontSize: '0',
    },
    common: {
      alignSelf: 'center',
      justifySelf: 'center',
      display: 'block',
    },
  }))();
