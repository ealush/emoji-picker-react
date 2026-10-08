import * as React from 'react';
import { cx } from 'shipstyles';

import { ClassNames } from '../../../DomUtils/classNames';
import { isRtl } from '../../../DomUtils/isRtl';
import { stylesheet } from '../../../Stylesheet/stylesheet';
import {
  useOnSkinToneChangeConfig,
  useSkinTonesDisabledConfig,
} from '../../../config/useConfig';
import skinToneVariations from '../../../data/skinToneVariations';
import { useCloseAllOpenToggles } from '../../../hooks/useCloseAllOpenToggles';
import { useFocusSearchInput } from '../../../hooks/useFocus';
import { useRegisterRegion } from '../../../hooks/useRegisterRegion';
import { useDefaultAppearance } from '../../../primitives/appearance';
import Absolute from '../../Layout/Absolute';
import Relative from '../../Layout/Relative';
import { useSkinTonePickerRef } from '../../context/ElementRefContext';
import {
  useActiveSkinToneState,
  useSkinToneFanOpenState,
} from '../../context/PickerContext';

import { BtnSkinToneVariation } from './BtnSkinToneVariation';

const ITEM_SIZE = 28;

type Props = {
  direction?: SkinTonePickerDirection;
};

export function SkinTonePickerMenu() {
  const SkinTonePickerRef = useSkinTonePickerRef();
  // Preview-located skin-tone control is its own focus region; the
  // search-located fan stays covered by local Search behavior.
  useRegisterRegion('preview-skin-tone', SkinTonePickerRef);
  return (
    <Relative style={{ height: ITEM_SIZE }}>
      <Absolute style={{ bottom: 0, right: 0 }}>
        <SkinTonePicker direction={SkinTonePickerDirection.VERTICAL} />
      </Absolute>
    </Relative>
  );
}

export function SkinTonePicker({
  direction = SkinTonePickerDirection.HORIZONTAL,
}: Props) {
  const appearance = useDefaultAppearance();
  const SkinTonePickerRef = useSkinTonePickerRef();
  const isDisabled = useSkinTonesDisabledConfig();
  const [isOpen, setIsOpen] = useSkinToneFanOpenState();
  const [activeSkinTone, setActiveSkinTone] = useActiveSkinToneState();
  const onSkinToneChange = useOnSkinToneChangeConfig();
  const closeAllOpenToggles = useCloseAllOpenToggles();
  const focusSearchInput = useFocusSearchInput();

  if (isDisabled) {
    return null;
  }

  const fullWidth = `${ITEM_SIZE * skinToneVariations.length}px`;

  const expandedSize = isOpen ? fullWidth : ITEM_SIZE + 'px';

  const vertical = direction === SkinTonePickerDirection.VERTICAL;
  // The fan opens toward the inline start: leftward, or rightward under
  // dir="rtl". The control is mounted before it can open, so the ref is set.
  const inlineSign =
    isOpen && !vertical && isRtl(SkinTonePickerRef.current) ? 1 : -1;

  return (
    <Relative
      className={skinToneClassName(appearance, vertical, isOpen)}
      style={
        vertical
          ? { flexBasis: expandedSize, height: expandedSize }
          : { flexBasis: expandedSize }
      }
    >
      <div
        className={cx(styles.select)}
        ref={SkinTonePickerRef}
        data-epr-part="skin-tone"
        // Read by the keyboard handler: arrow keys follow the fan axis
        // wherever the control is placed.
        data-epr-direction={vertical ? 'vertical' : 'horizontal'}
      >
        {/* eslint-disable complexity */}
        {skinToneVariations.map((skinToneVariation, i) => {
          const active = skinToneVariation === activeSkinTone;

          return (
            <BtnSkinToneVariation
              key={skinToneVariation}
              skinToneVariation={skinToneVariation}
              isOpen={isOpen}
              // Roving tabindex: when the fan is closed the inactive tones
              // are invisible (opacity: 0, stacked), so they must not be
              // reachable via Tab. The active tone stays tabbable to open
              // the fan from the keyboard.
              // https://github.com/ealush/emoji-picker-react/issues/492
              tabIndex={isOpen || active ? 0 : -1}
              style={{
                transform: cx(
                  vertical
                    ? `translateY(-${i * (isOpen ? ITEM_SIZE : 0)}px)`
                    : `translateX(${inlineSign * i * (isOpen ? ITEM_SIZE : 0)}px)`,
                  appearance && isOpen && active && 'scale(1.3)',
                ),
              }}
              isActive={active}
              onClick={() => {
                if (isOpen) {
                  setActiveSkinTone(skinToneVariation);
                  onSkinToneChange(skinToneVariation);
                  focusSearchInput();
                } else {
                  setIsOpen(true);
                }
                closeAllOpenToggles();
              }}
            />
          );
        })}
      </div>
    </Relative>
  );
}

// eslint-disable-next-line complexity
function skinToneClassName(
  appearance: boolean,
  vertical: boolean,
  open: boolean,
) {
  return cx(
    styles.geometry,
    appearance && styles.skinTones,
    vertical && styles.verticalGeometry,
    appearance && vertical && styles.vertical,
    appearance && open && styles.open,
    appearance && vertical && open && styles.verticalShadow,
  );
}

export enum SkinTonePickerDirection {
  VERTICAL = ClassNames.vertical,
  HORIZONTAL = ClassNames.horizontal,
}

const styles = /* @__PURE__ */ (() =>
  stylesheet.create({
    geometry: {
      '--': { '--epr-skin-tone-size': '15px' },
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '10px 0',
    },
    verticalGeometry: {
      padding: '9px',
      alignItems: 'flex-end',
      flexDirection: 'column',
    },
    skinTones: {
      '.': 'epr-skin-tones',
      transition: 'all 0.3s ease-in-out',
      padding: '10px 0',
    },
    vertical: {
      padding: '9px',
      alignItems: 'flex-end',
      flexDirection: 'column',
      borderRadius: '6px',
      border: '1px solid var(--epr-bg-color)',
    },
    verticalShadow: {
      boxShadow: '0px 0 7px var(--epr-picker-border-color)',
    },
    open: {
      // @ts-ignore - backdropFilter is not recognized.
      backdropFilter: 'blur(5px)',
      background: 'var(--epr-skin-tone-picker-menu-color)',
      '.epr-active': {
        border: '1px solid var(--epr-active-skin-tone-indicator-border-color)',
      },
    },
    select: {
      '.': 'epr-skin-tone-select',
      position: 'relative',
      width: 'var(--epr-skin-tone-size)',
      height: 'var(--epr-skin-tone-size)',
    },
  }))();
