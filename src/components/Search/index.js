import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import useFilter from '../../hooks/useFilter';
import { PickerContext } from '../../lib/reducer';
import RemoveTypedIcon from '../RemoveTypedIcon';
import './style.css';

const Search = ({ disableAutoFocus }) => {
  let {
    state: { searchString },
  } = useContext(PickerContext);

  if (searchString === undefined) searchString = '';

  return (
    <>
      <span className="search-container__search--emoji-icon"></span>
      <input
        className="emoji-search"
        onChange={useFilter()}
        id="emoji-searchID"
        autoFocus={!disableAutoFocus}
        placeholder="Search"
        value={searchString}
      />
      {!!searchString.length && (
        <span className="search-container__remove-icon" onClick={useFilter()}>
          <RemoveTypedIcon />
        </span>
      )}
    </>
  );
};

Search.propTypes = {
  disableAutoFocus: PropTypes.bool,
};

export default Search;
