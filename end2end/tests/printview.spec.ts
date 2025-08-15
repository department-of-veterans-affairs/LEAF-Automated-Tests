import { test, expect } from '@playwright/test';

test('workflow form fields load after subsequent getWorkflow() executions', async ({ page }, testInfo) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=14');

  // Wait for relevant section to fully load
  await expect(page.locator(`(//div[@class='printheading'] //span)[1]`)).toContainText('Single line Text');

  // Simulate getWorkflow() invocation from a custom script
  await page.evaluate(() => workflow.getWorkflow(14));
await page.reload();
  // The workflow form fields should still be visible
  await expect(page.locator(`(//div[@class='printheading'] //span)[1]`)).toContainText('Single line Text');

  const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
});

test('links in user content are visible', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=15');
  await expect(page.getByRole('link', { name: 'https://va.gov' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'https://va.gov' }).nth(3)).toBeVisible();
  await expect(page.locator('#data_4_1')).toContainText('<a href="https://va.gov">va.gov</a>');
});