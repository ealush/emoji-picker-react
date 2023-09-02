import clsx from 'clsx';
import * as React from 'react';

import { ClassNames } from '../../DomUtils/classNames';
import { useSkinTonesDisabledConfig } from '../../config/useConfig';
import skinToneVariations, {
  skinTonesNamed,
} from '../../data/skinToneVariations';
import { setSkinTone } from '../../dataUtils/skinTone';
import { useCloseAllOpenToggles } from '../../hooks/useCloseAllOpenToggles';
import { useFocusSearchInput } from '../../hooks/useFocus';
import { KeyboardEvents } from '../../hooks/useKeyboardNavigation';
import { SkinTones } from '../../types/exposedTypes';
import Absolute from '../Layout/Absolute';
import Relative from '../Layout/Relative';
import { Button } from '../atoms/Button';
import { useSkinTonePickerRef } from '../context/ElementRefContext';
import {
  useActiveSkinToneState,
  useSkinToneFanOpenState,
} from '../context/PickerContext';
import './SkinTonePicker.css';

const ITEM_SIZE = 28;

type Props = {
  direction?: SkinTonePickerDirection;
  fanOutDirection?: SkinTonePickerFanOutDirection;
};

export function SkinTonePickerMenu() {
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
  fanOutDirection = SkinTonePickerFanOutDirection.LEFT,
}: Props) {
  const SkinTonePickerRef = useSkinTonePickerRef();
  const isDisabled = useSkinTonesDisabledConfig();
  const [isOpen, setIsOpen] = useSkinToneFanOpenState();
  const [activeSkinTone, setActiveSkinTone] = useActiveSkinToneState();
  const closeAllOpenToggles = useCloseAllOpenToggles();
  const focusSearchInput = useFocusSearchInput();

  if (isDisabled) {
    return null;
  }

  const fullWidth = `${ITEM_SIZE * skinToneVariations.length}px`;

  const expandedSize = isOpen ? fullWidth : ITEM_SIZE + 'px';

  const vertical = direction === SkinTonePickerDirection.VERTICAL;

  const buttonStyle = { backgroundColor: "transparent", border: "none" }

  return (
    <Relative
      className={clsx('epr-skin-tones', direction, {
        [ClassNames.open]: isOpen,
      })}
      style={
        vertical
          ? { flexBasis: expandedSize, height: expandedSize, ...buttonStyle }
          : { flexBasis: expandedSize, ...buttonStyle }
      }
    >
      <div className="epr-skin-tone-select" ref={SkinTonePickerRef}>
        {skinToneVariations.map((skinToneVariation, i) => {
          const active = skinToneVariation === activeSkinTone;
          return (
            <Button
              style={{
                transform: clsx(
                  vertical
                    ? `translateY(-${i * (isOpen ? ITEM_SIZE : 0)}px)`
                    : getHorizontalTranslation({
                      ix: i,
                      fanOutDirection,
                      isOpen,
                    }),
                  isOpen && active && 'scale(1.3)'
                ),
              }}
              onClick={() => {
                if (isOpen) {
                  setActiveSkinTone(skinToneVariation);
                  setSkinTone(skinToneVariation)
                  focusSearchInput();
                } else {
                  setIsOpen(true);
                }
                closeAllOpenToggles();
              }}
              // When tabbed onto the SkinTonePicker, allow Enter to open and close the fan of tones
              onKeyDown={(event) => {
                const { key } = event;
                if (key === KeyboardEvents.Enter) {
                  if (isOpen) {
                    setActiveSkinTone(skinToneVariation);
                    setSkinTone(skinToneVariation)
                    focusSearchInput();
                  } else {
                    setIsOpen(true);
                  }
                  closeAllOpenToggles();
                }
              }}
              tabIndex={isOpen ? 0 : -1}
              key={skinToneVariation}
              className={clsx(`epr-tone-${skinToneVariation}`, 'epr-tone', {
                [ClassNames.active]: active,
              })}
              aria-pressed={active}
              aria-label={`Skin tone ${skinTonesNamed[skinToneVariation as SkinTones]
                }`}
            ></Button>
          );
        })}
      </div>
    </Relative>
  );

  function getHorizontalTranslation({
    ix,
    fanOutDirection,
    isOpen,
  }: {
    ix: number;
    fanOutDirection: SkinTonePickerFanOutDirection;
    isOpen: boolean;
  }): string {
    // By fanning out to the left, the focus remains on the last (right-most) tone in the array,
    // so tabbing takes a user out of the SkinTonePicker. In order to tab through the tones, a user
    // must first tab backwards.
    //
    // Fanning out to the right keeps the focus on the first (left-most) tone in the array so a user
    // can tab from left to right.
    if (fanOutDirection === SkinTonePickerFanOutDirection.LEFT) {
      return `translateX(-${ix * (isOpen ? ITEM_SIZE : 0)}px)`;
    }
    return `translateX(${ix * (isOpen ? ITEM_SIZE : 0) -
      (isOpen ? (skinToneVariations.length - 1) * ITEM_SIZE : 0)
      }px)`;
  }
}

export enum SkinTonePickerDirection {
  VERTICAL = ClassNames.vertical,
  HORIZONTAL = ClassNames.horizontal,
}
export enum SkinTonePickerFanOutDirection {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}
