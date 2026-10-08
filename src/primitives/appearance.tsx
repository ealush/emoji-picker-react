import * as React from 'react';

// Every Root resets appearance ownership, including nested Roots.
export const AppearanceContext = /* @__PURE__ */ React.createContext(false);
export function useDefaultAppearance(): boolean {
  return React.useContext(AppearanceContext);
}
