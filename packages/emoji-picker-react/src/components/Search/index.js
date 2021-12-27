import React from 'react';
import useFilter from '../../hooks/useFilter';
import './style.css';
import SkinTones from '../SkinTones';
import { useConfig } from '../../PickerContext';

function Search() {
  const config = useConfig();
  const onChange = useFilter();

  if (config.disableSearchBar) {
    return null;
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        className="emoji-search"
        onChange={onChange}
        autoFocus={!config.disableAutoFocus}
      />
      {config.disableSkinTonePicker ? null : <SkinTones />}
    </div>
  );
}

export default Search;
