import { test, expect } from '@playwright/test';

test('Mass Actions Filter - test for LEAF 4841', async ({ page }) => {

  // Go to Mass Actions page 
  await page.goto('https://host.docker.internal/Test_Request_Portal/report.php?a=LEAF_mass_action');

  // Choose Cancel
  await page.getByLabel('Choose Action').selectOption('cancel');

  // Display Advanced Search Options
  await page.getByRole('button', { name: 'Advanced Options' }).click();
  await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();

  // Set Search to 'Any standard data field CONTAINS 76258'
  await page.getByRole('option', { name: 'Data Field' }).click();
  await page.getByLabel('text', { exact: true }).click();
  await page.getByLabel('text', { exact: true }).click();
  await page.getByLabel('text', { exact: true }).fill('76258');
  await page.getByRole('button', { name: 'Apply Filters' }).click();

  // Verify the request 955 using General Form is displayed
  await expect(page.getByRole('link', { name: '955' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'General Form' })).toBeVisible();

  // Remove the Advanced Search Options so a clean page is displayed
  // next time Mass Actions is loaded
  await page.getByLabel('remove filter row').click();
  await page.getByRole('button', { name: 'Close advanced search' }).click();

  // Verify the 'Advance Options' button is now visible
  await expect(page.getByRole('button', { name: 'Advanced Options' })).toBeVisible();
});