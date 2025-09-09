import { test, expect } from '@playwright/test';

test('workflow form fields load after subsequent getWorkflow() executions', async ({ page }, testInfo) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=14');

  // Wait for relevant section to fully load
  await expect(page.locator('div[id^="workflowStepModule"][id$="_container"]')).toContainText('Single line text');

  // Simulate getWorkflow() invocation from a custom script
  await page.evaluate(() => workflow.getWorkflow(14));

  // The workflow form fields should still be visible
  await expect(page.locator('div[id^="workflowStepModule"][id$="_container"]')).toContainText('Single line text');

  const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
});

test('links in user content are visible', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=15');

  // there should be 5 links (nth is 0-index based)
  await expect(page.getByRole('link', { name: 'https://va.gov' }).nth(4)).toBeVisible();

  // check explicit tags
  await expect(page.locator('#data_4_1')).toContainText('<a href="https://va.gov">va.gov</a>');
});