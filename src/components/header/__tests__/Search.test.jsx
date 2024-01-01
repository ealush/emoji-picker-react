import * as React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/react';
import { SearchContainer } from '../Search';
import { useFilter } from '../../../hooks/useFilter';

jest.mock('../../../hooks/useFilter', () => ({
  getNormalizedSearchTerm: jest.fn(),
  useClearSearch: jest.fn(),
  useFilter: jest.fn(),
}));

describe('Search', () => {
  beforeEach(() => {
    useFilter.mockImplementation(() => ({
      statusSearchResults: 5,
      searchTerm: 'asdf',
      onChange: jest.fn(),
    }));
  })

  afterEach(() => {
    useFilter.mockReset();
  })

  it('should render search field', () => {
    const { getByLabelText } = render(
      <SearchContainer />
    );
    expect(getByLabelText('Type to search for an emoji')).toBeInTheDocument();
  })

  it('should trigger useFilter twice after search query was entered', () => {
    const { getByLabelText, debug } = render(
      <SearchContainer />
    );

    expect(useFilter).toHaveBeenCalledTimes(1);
    fireEvent.change(getByLabelText('Type to search for an emoji'), { target: { value: 'asdf' }});
    expect(useFilter).toHaveBeenCalledTimes(2);
  })
})
