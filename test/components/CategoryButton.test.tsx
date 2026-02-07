import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CategoryButton } from '../../src/components/navigation/CategoryButton';
import { Categories, CategoryConfig } from '../../src/types/exposedTypes';

vi.mock('../../src/config/categoryConfig', () => ({
  categoryNameFromCategoryConfig: vi.fn(
    (config: CategoryConfig) => config.name,
  ),
}));

describe('CategoryButton', () => {
  const defaultProps = {
    isActiveCategory: false,
    category: Categories.SMILEYS_PEOPLE,
    allowNavigation: true,
    categoryConfig: {
      category: Categories.SMILEYS_PEOPLE,
      name: 'Smileys & People',
    },
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default icon (no custom icon)', () => {
    render(<CategoryButton {...defaultProps} />);
    const button = screen.getByRole('tab', { name: 'Smileys & People' });
    expect(button).toBeDefined();
    // Default icon should have the epr-icn-smileys_people class
    expect(button.className).toContain('epr-icn-smileys_people');
    // Should not have custom icon class
    expect(button.className).not.toContain('epr-cat-btn-custom-icon');
  });

  it('renders with custom icon from customIcon prop', () => {
    const customIcon = <span data-testid="custom-icon">🔥</span>;
    render(<CategoryButton {...defaultProps} customIcon={customIcon} />);

    const button = screen.getByRole('tab', { name: 'Smileys & People' });
    expect(button).toBeDefined();
    // Custom icon class should be present
    expect(button.className).toContain('epr-cat-btn-custom-icon');
    // Should not have the default icon class
    expect(button.className).not.toContain('epr-icn-smileys_people');
    // Custom icon should be rendered
    expect(screen.getByTestId('custom-icon')).toBeDefined();
    expect(screen.getByTestId('custom-icon').textContent).toBe('🔥');
  });

  it('renders with custom icon from categoryConfig.icon', () => {
    const categoryConfig: CategoryConfig = {
      category: Categories.SMILEYS_PEOPLE,
      name: 'Smileys & People',
      icon: <span data-testid="config-icon">⭐</span>,
    };
    render(
      <CategoryButton {...defaultProps} categoryConfig={categoryConfig} />,
    );

    const button = screen.getByRole('tab', { name: 'Smileys & People' });
    expect(button.className).toContain('epr-cat-btn-custom-icon');
    expect(screen.getByTestId('config-icon')).toBeDefined();
    expect(screen.getByTestId('config-icon').textContent).toBe('⭐');
  });

  it('categoryConfig.icon takes precedence over customIcon prop', () => {
    const categoryConfig: CategoryConfig = {
      category: Categories.SMILEYS_PEOPLE,
      name: 'Smileys & People',
      icon: <span data-testid="config-icon">⭐</span>,
    };
    const customIcon = <span data-testid="custom-icon">🔥</span>;

    render(
      <CategoryButton
        {...defaultProps}
        categoryConfig={categoryConfig}
        customIcon={customIcon}
      />,
    );

    // Config icon should be rendered
    expect(screen.getByTestId('config-icon')).toBeDefined();
    // Custom icon from prop should NOT be rendered
    expect(screen.queryByTestId('custom-icon')).toBeNull();
  });

  it('applies active class when isActiveCategory is true', () => {
    render(<CategoryButton {...defaultProps} isActiveCategory={true} />);
    const button = screen.getByRole('tab', { name: 'Smileys & People' });
    expect(button.className).toContain('epr-active');
  });

  it('sets correct tabIndex based on allowNavigation', () => {
    const { rerender } = render(
      <CategoryButton {...defaultProps} allowNavigation={true} />,
    );
    let button = screen.getByRole('tab', { name: 'Smileys & People' });
    expect(button.getAttribute('tabindex')).toBe('0');

    rerender(<CategoryButton {...defaultProps} allowNavigation={false} />);
    button = screen.getByRole('tab', { name: 'Smileys & People' });
    expect(button.getAttribute('tabindex')).toBe('-1');
  });

  it('calls onClick handler when clicked', () => {
    const onClick = vi.fn();
    render(<CategoryButton {...defaultProps} onClick={onClick} />);
    const button = screen.getByRole('tab', { name: 'Smileys & People' });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders SVG custom icon correctly', () => {
    const svgIcon = (
      <svg data-testid="svg-icon" width="20" height="20">
        <circle cx="10" cy="10" r="5" />
      </svg>
    );
    render(<CategoryButton {...defaultProps} customIcon={svgIcon} />);

    expect(screen.getByTestId('svg-icon')).toBeDefined();
    expect(screen.getByTestId('svg-icon').tagName.toLowerCase()).toBe('svg');
  });

  it('renders img custom icon correctly', () => {
    const imgIcon = (
      <img
        data-testid="img-icon"
        src="https://example.com/icon.png"
        alt="Custom"
      />
    );
    render(<CategoryButton {...defaultProps} customIcon={imgIcon} />);

    const img = screen.getByTestId('img-icon');
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toBe('https://example.com/icon.png');
    expect(img.getAttribute('alt')).toBe('Custom');
  });
});
