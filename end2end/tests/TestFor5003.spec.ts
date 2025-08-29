import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/');
  
  // Change name of request to https://www.va.gov
  await page.locator('[id$="_957_title"]').getByRole('link', { name: 'Available for test case' }).click();
  await page.getByRole('button', { name: 'Edit Title' }).click();
  await page.locator('#title').click();
  await page.locator('#title').press('ControlOrMeta+a');
  await page.locator('#title').fill('https://www.va.gov');
  await page.getByRole('button', { name: 'Save Change' }).click();

  await page.getByRole('link', { name: 'Home' }).click();

  // Search for https://www.va.gov
  await page.getByLabel('Enter your search text').click();
  await page.getByLabel('Enter your search text').fill('https://www.va.gov');

  // Docker-optimized waiting
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Verify the correct request is found
  await expect(page.getByRole('link', { name: '957' })).toBeVisible();  
  
  // Verify there is only one request returned
  const requestTable = await page.getByRole('table');
  const tableBody = await requestTable.locator('tbody');
  const tableRows = await tableBody.locator('tr');

  const numRows = await tableRows.count();
  await expect(numRows).toEqual(1);

  // Rename the request back to 'Available for test case'
  await page.getByRole('link', { name: 'https://www.va.gov' }).click();
  await page.getByRole('button', { name: 'Edit Title' }).click();
  await page.locator('#title').click();
  await page.locator('#title').press('ControlOrMeta+a');
  await page.locator('#title').fill('Available for test case');
  await page.getByRole('button', { name: 'Save Change' }).click();

  // Clear search box
  await page.getByRole('link', { name: 'Home' }).click();
  await page.getByLabel('Enter your search text').click();
  await page.getByLabel('Enter your search text').press('ControlOrMeta+a');
  await page.getByLabel('Enter your search text').fill('');
  
});