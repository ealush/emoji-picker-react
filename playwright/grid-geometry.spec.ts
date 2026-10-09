/**
 * Grid geometry across every design (stories/recipes) and the default
 * picker: whatever emoji size, padding and spacing a design sets, the
 * measured row math must match what renders.
 *
 * - columns = floor(content width / emoji size);
 * - the leftover width is shared between columns, so the inset from the
 *   viewport edge is the same on the left and on the right (no gap
 *   collecting beside the scrollbar);
 * - no emoji overflows the category content box.
 *
 * Recipes are discovered from Storybook's index (plain-CSS variant of each
 * `recipe`-tagged story); designs without a grid (reactions-only bars,
 * typeahead) are skipped.
 */
import { expect, test } from '@playwright/test';

type IndexEntry = { id: string; type: string; tags?: string[] };

type Geometry = {
  columns: number;
  expectedColumns: number;
  leftInset: number;
  rightInset: number;
  overflow: number;
};

const DEFAULT_PICKER = 'picker-overview--default';

test('every design distributes grid columns evenly with no edge gap', async ({
  page,
  request,
}) => {
  test.setTimeout(240_000);
  const index = (await (await request.get('/index.json')).json()) as {
    entries: Record<string, IndexEntry>;
  };
  const ids = Object.values(index.entries)
    .filter(
      (entry) =>
        entry.type === 'story' &&
        entry.tags?.includes('recipe') &&
        entry.id.endsWith('--css'),
    )
    .map((entry) => entry.id);
  expect(ids.length).toBeGreaterThan(20);
  ids.push(DEFAULT_PICKER);

  let measured = 0;
  for (const id of ids) {
    await page.goto(`/iframe.html?id=${id}&viewMode=story`);
    await page.locator('#storybook-root aside').first().waitFor();
    // Let virtualization measure and fonts settle.
    await page.waitForTimeout(500);

    const geometry = await page.evaluate((): Geometry | null => {
      const viewport = document.querySelector('[data-epr-part="viewport"]');
      if (!viewport) return null;
      const content = Array.from(
        document.querySelectorAll<HTMLElement>(
          '[data-epr-part="category-content"]',
        ),
      ).find(
        (element) =>
          element.clientWidth > 0 &&
          element.querySelectorAll('[data-epr-part="emoji"]').length >
            Number(element.dataset.eprEmojisPerRow),
      );
      if (!content) return null;
      const emojis = Array.from(
        content.querySelectorAll<HTMLElement>('[data-epr-part="emoji"]'),
      ).map((emoji) => emoji.getBoundingClientRect());
      const size = emojis[0].width;
      const box = content.getBoundingClientRect();
      const inner = viewport.getBoundingClientRect().left + viewport.clientLeft;
      const innerRight = inner + viewport.clientWidth;
      const left = Math.min(...emojis.map((rect) => rect.left));
      const right = Math.max(...emojis.map((rect) => rect.right));
      return {
        columns: Number(content.dataset.eprEmojisPerRow),
        expectedColumns: Math.floor(content.clientWidth / size),
        leftInset: left - inner,
        rightInset: innerRight - right,
        overflow: Math.max(0, box.left - left, right - box.right),
      };
    });
    if (!geometry) continue;
    measured += 1;

    expect.soft(geometry.columns, `${id}: column count`).toBe(
      geometry.expectedColumns,
    );
    expect
      .soft(
        Math.abs(geometry.leftInset - geometry.rightInset),
        `${id}: left inset ${geometry.leftInset}px vs right ${geometry.rightInset}px`,
      )
      .toBeLessThanOrEqual(1);
    expect.soft(geometry.overflow, `${id}: emoji overflow`).toBeLessThanOrEqual(
      0.5,
    );
  }
  expect(measured).toBeGreaterThan(15);
});
