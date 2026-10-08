import { expect, test } from '@playwright/test';

test('touch long press opens tones; movement and cancellation do not', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=v5-acceptance--plug-and-play-default&viewMode=story',
  );
  await page
    .getByRole('textbox', { name: 'Type to search for an emoji' })
    .fill('thumbs up');
  const cell = page
    .getByRole('gridcell', { name: 'thumbs up', exact: true })
    .first();
  await expect(cell).toBeVisible();
  // PointerEvents exercise the same delegated handlers on every engine.
  const press = () =>
    cell.dispatchEvent('pointerdown', {
      pointerType: 'touch',
      isPrimary: true,
      clientX: 20,
      clientY: 20,
      bubbles: true,
    });
  await press();
  await cell.dispatchEvent('pointermove', {
    pointerType: 'touch',
    isPrimary: true,
    clientX: 40,
    clientY: 20,
    bubbles: true,
  });
  await page.waitForTimeout(550);
  await expect(
    page.locator('[data-epr-part="variation-picker"]'),
  ).not.toBeVisible();
  await press();
  await cell.dispatchEvent('pointercancel', {
    pointerType: 'touch',
    isPrimary: true,
    bubbles: true,
  });
  await page.waitForTimeout(550);
  await expect(
    page.locator('[data-epr-part="variation-picker"]'),
  ).not.toBeVisible();
  await press();
  await expect(
    page.locator('[data-epr-part="variation-picker"]'),
  ).toBeVisible();
  await cell.dispatchEvent('pointerup', {
    pointerType: 'touch',
    isPrimary: true,
    bubbles: true,
  });
});

test(
  'a real touch gesture opens variations and scrolling cancels the press',
  { tag: '@real-touch' },
  async ({ page, context }) => {
    await page.goto(
      '/iframe.html?id=v5-acceptance--plug-and-play-default&viewMode=story',
    );
    await page
      .getByRole('textbox', { name: 'Type to search for an emoji' })
      .fill('thumbs up');
    const cell = page
      .getByRole('gridcell', { name: 'thumbs up', exact: true })
      .first();
    const box = await cell.boundingBox();
    expect(box).toBeTruthy();
    const cdp = await context.newCDPSession(page);
    const point = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [point],
    });
    await expect(
      page.locator('[data-epr-part="variation-picker"]'),
    ).toBeVisible();
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
    await expect(
      page.locator('[data-epr-part="variation-picker"]'),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [point],
    });
    await page.locator('[data-epr-part="viewport"]').dispatchEvent('scroll');
    await page.waitForTimeout(550);
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
    await expect(
      page.locator('[data-epr-part="variation-picker"]'),
    ).not.toBeVisible();
  },
);
