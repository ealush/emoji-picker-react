/**
 * Visual Regression Tests for Storybook Stories
 *
 * This file dynamically discovers all Storybook stories that have the
 * `visualTest: true` parameter and captures screenshot snapshots for each.
 * This enables automated visual regression testing across all component states.
 *
 * Stories can opt-in to visual testing by adding to their parameters:
 * ```
 * parameters: {
 *   visualTest: true,
 *   visualTestDelay: 500  // optional delay before capture
 * }
 * ```
 *
 * @file storybook-visual.spec.ts
 */

import { expect, test } from '@playwright/test';

/** Storybook index.json entry structure */
type StoryIndexEntry = {
  id: string;
  parameters?: {
    visualTest?: boolean;
    visualTestDelay?: number;
  };
};

/**
 * Captures visual snapshots for all stories tagged with visualTest: true.
 * - Fetches the Storybook index.json to discover all available stories
 * - Filters to only stories with visualTest parameter enabled
 * - For each story, navigates to its iframe URL
 * - Waits for the story to render (with optional delay)
 * - Captures a screenshot and compares against baseline
 */
test('captures visual snapshots for tagged stories', async ({
  page,
  request
}) => {
  const baseURL =
    test.info().project.use.baseURL ?? 'http://localhost:6006';
  const response = await request.get(`${baseURL}/index.json`);
  const data = (await response.json()) as {
    stories?: Record<string, StoryIndexEntry>;
    entries?: Record<string, StoryIndexEntry>;
  };
  const entries = data.entries || data.stories || {};
  const stories = Object.values(entries).filter(
    story => story.parameters?.visualTest
  );

  for (const story of stories) {
    await page.goto(`${baseURL}/iframe.html?id=${story.id}&viewMode=story`);
    await page.locator('#storybook-root').waitFor();
    await page.waitForTimeout(story.parameters?.visualTestDelay ?? 300);
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      `${story.id}.png`
    );
  }
});
