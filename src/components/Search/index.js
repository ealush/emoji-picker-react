import PropTypes from 'prop-types';
import React from 'react';

import useFilter from '../../hooks/useFilter';
import { useConfig } from '../../PickerContext';
import SkinTones from '../SkinTones';

import './style.css';

function Search({ searchPlaceholder = null }) {
  const config = useConfig();
  const onChange = useFilter();

  if (config.disableSearchBar) {
    return null;
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        placeholder={searchPlaceholder}
        className="emoji-search"
        onChange={onChange}
        autoFocus={!config.disableAutoFocus}
      />
      {config.disableSkinTonePicker ? null : <SkinTones />}
    </div>
  );
}

export default Search;

Search.propTypes = {
  searchPlaceholder: PropTypes.string,
};
