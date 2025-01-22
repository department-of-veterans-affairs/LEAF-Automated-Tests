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
