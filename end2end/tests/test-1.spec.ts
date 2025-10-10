import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_file_manager');
  await page.getByRole('button', { name: 'Upload File' }).click();
  await page.getByLabel('Select file to upload').setInputFiles('./LEAF-Automated-Tests/end2end/artifacts/LEAF-5086.mjs');

  await expect(page.locator("[id$='_0_file']")).toContainText('../files/LEAF-5086.mjs');

  const filePromise = page.waitForResponse(
        res => res.url().includes('files/LEAF-5086.mjs') && res.status() === 200
  );
    
  await page.getByRole('link', { name: '../files/LEAF-5086.mjs' }).click();
  await expect(page.getByText('This is a test file for LEAF 5075 / LEAF 5086')).toBeVisible();

  const fileRes = await filePromise;
  const headerContentType = fileRes.headers()?.['content-type'] ?? '';
  expect(headerContentType).toBe('text/javascript');

  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_file_manager');
  await page.locator("[id$='_0_delete']").getByRole('link', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();

});