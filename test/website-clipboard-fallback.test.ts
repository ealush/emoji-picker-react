import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  legacyCopy,
  writeToClipboard,
} from '../website/src/lib/clipboard';

function mockClipboard(writeText: () => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
}

function clearClipboardMock() {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: undefined,
  });
}

afterEach(() => {
  clearClipboardMock();
  vi.restoreAllMocks();
});

describe('writeToClipboard', () => {
  it('uses the async Clipboard API when it succeeds', async () => {
    const writeText = vi.fn(async (_text: string) => {});
    mockClipboard(writeText);
    const execCommand = vi.fn(() => true);
    document.execCommand = execCommand;

    await writeToClipboard('copied!');
    expect(writeText).toHaveBeenCalledWith('copied!');
    expect(execCommand).not.toHaveBeenCalled();
  });

  it('falls back to the legacy path when writeText rejects', async () => {
    mockClipboard(async (_text: string) => {
      throw new DOMException('denied', 'NotAllowedError');
    });
    const execCommand = vi.fn(() => true);
    document.execCommand = execCommand;

    await expect(writeToClipboard('fallback!')).resolves.toBeUndefined();
    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  it('falls back to the legacy path without a Clipboard API', async () => {
    clearClipboardMock();
    const execCommand = vi.fn(() => true);
    document.execCommand = execCommand;

    await expect(writeToClipboard('no-api')).resolves.toBeUndefined();
    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  it('rejects when every path fails', async () => {
    mockClipboard(async (_text: string) => {
      throw new DOMException('denied', 'NotAllowedError');
    });
    document.execCommand = vi.fn(() => false);

    await expect(writeToClipboard('doomed')).rejects.toThrow(
      'Copy unavailable',
    );
  });

  it('legacyCopy cleans up its scratch node', async () => {
    document.execCommand = vi.fn(() => true);
    const before = document.body.querySelectorAll('textarea').length;

    await legacyCopy('tidy');
    expect(document.body.querySelectorAll('textarea').length).toBe(before);
  });
});
