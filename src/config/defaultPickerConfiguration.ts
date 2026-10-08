import * as React from 'react';

import type { PickerConfig } from './config';

/** Private bridge: only the assembled picker translates legacy switches. */
export const DefaultPickerConfiguration =
  React.createContext<PickerConfig | null>(null);
