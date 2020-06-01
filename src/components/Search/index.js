import React from 'react';
import PropTypes from 'prop-types';
import useFilter from '../../hooks/useFilter';
import './style.css';

const Search = ({ disableAutoFocus }) => (
  <input
    className="emoji-search"
    onChange={useFilter()}
    autoFocus={!disableAutoFocus}
  />
);

Search.propTypes = {
  disableAutoFocus: PropTypes.bool,
};

export default Search;
