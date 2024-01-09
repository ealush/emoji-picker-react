import { ClassNames } from '../../DomUtils/classNames';
import { stylesheet } from '../../Stylesheet/stylesheet';

export const emojiStyles = stylesheet.create({
  external: {
    '.': ClassNames.external,
    fontSize: '0'
  },
  common: {
    alignSelf: 'center',
    justifySelf: 'center',
    display: 'block'
  }
});
