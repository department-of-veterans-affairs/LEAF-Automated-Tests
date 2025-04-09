import { test, expect } from '@playwright/test';

test('Inbox Organized by Role, Custom Column', async ({ page }) => {
  // Setup precondition: Add site into sitemap
  await page.goto('https://host.docker.internal/Test_Request_Portal/report.php?a=LEAF_sitemaps_template');
  await page.getByRole('button', { name: '+ Add Site' }).click();
  await page.locator('#button-target').click();
  await page.locator('#button-target').fill('https://host.docker.internal/Test_Request_Portal/');
  await page.locator('#button-title').click();
  await page.locator('#button-title').fill('Temp Title');
  await page.getByRole('button', { name: 'Save Change' }).click();

  // Setup precondition: Add custom column
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_combined_inbox');
  await page.getByLabel('Select a form to add specific').selectOption('form_5ea07');
  await page.getByPlaceholder('Click to search. Limit 7').click();
  await page.getByRole('option', { name: 'General Form: Numeric (ID: 5' }).click();
  await expect(page.getByText('General Form: Numeric (ID: 5)Remove item')).toBeVisible();

  // Custom column should be visible in the "Organize by Role" view
  await page.goto('https://host.docker.internal/Test_Request_Portal/report.php?a=LEAF_Inbox&adminView&organizeByRole');
  await page.getByRole('button', { name: 'Adell Douglas View' }).click();
  await expect(page.locator('[id *= "_434_5"]')).toContainText('81354');

  // Clean up
  await page.goto('https://host.docker.internal/Test_Request_Portal/report.php?a=LEAF_sitemaps_template');
  await page.getByRole('heading', { name: 'Temp Title' }).click();
  await page.getByRole('button', { name: 'Delete Site' }).click();
});
