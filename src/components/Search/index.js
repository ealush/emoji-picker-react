import React from 'react';
import PropTypes from 'prop-types';
import useFilter from '../../hooks/useFilter';
import './style.css';

const Search = ({ disableAutoFocus }) => (
  <>
    <span className="search-container__search--emoji-icon"></span>
    <input
      className="emoji-search"
      onChange={useFilter()}
      autoFocus={!disableAutoFocus}
      placeholder="Search"
    />
  </>
);

Search.propTypes = {
  disableAutoFocus: PropTypes.bool,
};

export default Search;
