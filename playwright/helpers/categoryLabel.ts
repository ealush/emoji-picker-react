import type { Page } from '@playwright/test';

// Category titles are visual only (aria-hidden: the grid rowgroup carries
// the category name), so they are located by their stable part, not by a
// heading role.
export function categoryLabel(page: Page, name: string) {
  return page.locator('[data-epr-part="category-label"]').filter({
    hasText: name,
  });
}
