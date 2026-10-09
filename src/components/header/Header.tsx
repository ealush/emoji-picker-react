import * as React from 'react';
import { cx } from 'shipstyles';

import { commonInteractionStyles } from '../../Stylesheet/stylesheet';
import {
  useSearchDisabledConfig,
  useSkinTonesDisabledConfig,
} from '../../config/useConfig';
import { useIsSkinToneInSearch } from '../../hooks/useShouldShowSkinTonePicker';
import { CategoryNav, Search, SkinTone } from '../../primitives';
import { useDefaultAppearance } from '../../primitives/appearance';
import Relative from '../Layout/Relative';

// Default header layout: private appearance/layout wrapper around the
// public Search and CategoryNav primitives.
export function Header() {
  const appearance = useDefaultAppearance();
  const searchDisabled = useSearchDisabledConfig();
  const skinTonesDisabled = useSkinTonesDisabledConfig();
  const toneInSearch = useIsSkinToneInSearch();
  return (
    <Relative
      className={cx(
        'epr-header',
        appearance && commonInteractionStyles.hiddenOnReactions,
      )}
    >
      {!searchDisabled && (
        <Search>{!skinTonesDisabled && toneInSearch && <SkinTone />}</Search>
      )}
      <CategoryNav />
    </Relative>
  );
}
