import { expect, test } from '@playwright/test';

type StoryIndexEntry = {
  id: string;
  parameters?: {
    visualTest?: boolean;
    visualTestDelay?: number;
  };
};

test('captures visual snapshots for tagged stories', async ({
  page,
  request
}) => {
  const baseURL =
    test.info().project.use.baseURL ?? 'http://localhost:6006';
  const response = await request.get(`${baseURL}/index.json`);
  const data = (await response.json()) as {
    stories: Record<string, StoryIndexEntry>;
  };
  const stories = Object.values(data.stories).filter(
    story => story.parameters?.visualTest
  );

  for (const story of stories) {
    await page.goto(`${baseURL}/?path=/story/${story.id}`);
    await page.locator('#storybook-root').waitFor();
    await page.waitForTimeout(story.parameters?.visualTestDelay ?? 300);
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      `${story.id}.png`
    );
  }
});
