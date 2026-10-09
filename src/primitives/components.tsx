import * as React from 'react';

import type { ListComponents } from '../components/body/listComponents';
import type { SkinTones } from '../types/exposedTypes';

/** Spread the managed props onto one native button. Render children or your own content. */
export type CategoryButtonRenderProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    category: { id: string; name: string; isActive: boolean };
  };
export type SkinToneButtonRenderProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    tone: { skinTone: SkinTones; isActive: boolean; isOpen: boolean };
  };
export type PickerComponents = ListComponents & {
  CategoryButton?: React.ComponentType<CategoryButtonRenderProps>;
  SkinToneButton?: React.ComponentType<SkinToneButtonRenderProps>;
  ExpandButton?: React.ComponentType<
    React.ButtonHTMLAttributes<HTMLButtonElement>
  >;
  ClearButton?: React.ComponentType<
    React.ButtonHTMLAttributes<HTMLButtonElement>
  >;
};
export const EMPTY_COMPONENTS: PickerComponents = {};
export const PickerComponentsContext =
  /* @__PURE__ */ React.createContext<PickerComponents>(EMPTY_COMPONENTS);
export function usePickerComponents(): PickerComponents {
  return React.useContext(PickerComponentsContext);
}
