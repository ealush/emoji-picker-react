
import React from 'react';
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ErrorBoundary from '../../src/components/ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders children when no error', () => {
    const { container } = render(
      <ErrorBoundary>
        <div>Content</div>
      </ErrorBoundary>
    );

    expect(container.textContent).toBe('Content');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('renders nothing and logs error when error occurs', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(container.textContent).toBe('');
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
