/**
 * Visual Regression Tests for Storybook Stories
 *
 * Discovers every story tagged `visual` in Storybook's index and captures a
 * screenshot of each. Opt a story (or a whole file via its meta) in with:
 * ```
 * tags: ['visual']
 * ```
 * Tags, not parameters: Storybook's index.json carries tags but never
 * parameters, so a parameter-based filter silently matched nothing.
 *
 * @file storybook-visual.spec.ts
 */

import { expect, test } from '@playwright/test';

/** Storybook index.json entry structure */
type StoryIndexEntry = {
  id: string;
  type: string;
  tags?: string[];
};

/** Captures a screenshot for every story tagged `visual`. */
// One test walks every tagged story; give it room.
test.describe.configure({ timeout: 10 * 60 * 1000 });

test('captures visual snapshots for tagged stories', async ({
  page,
  request,
}) => {
  const response = await request.get('/index.json');
  await expect(response).toBeOK();
  const data = (await response.json()) as {
    stories?: Record<string, StoryIndexEntry>;
    entries?: Record<string, StoryIndexEntry>;
  };
  const entries = data.entries || data.stories || {};
  const stories = Object.values(entries).filter(
    (story) => story.type === 'story' && story.tags?.includes('visual'),
  );
  // An empty match means the opt-in mechanism broke; never pass vacuously.
  expect(stories.length).toBeGreaterThan(0);

  for (const story of stories) {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
    await page.locator('#storybook-root').waitFor();
    // Image emoji styles load from a CDN: wait until every image settled.
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() =>
      Array.from(document.images).every((image) => image.complete),
    );
    await page.waitForTimeout(
      story.tags?.includes('visual-slow') ? 3000 : 500,
    );
    await expect.soft(page.locator('#storybook-root')).toHaveScreenshot(
      `${story.id}.png`,
    );
  }
});
