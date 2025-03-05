import { test, expect } from '@playwright/test';




test('View Organizational Chart', async ({ page }, testInfo) => {
  await page.goto('https://host.docker.internal/Test_Nexus/');
  await page.getByText('Browser View Organizational').click();
  await expect(page.getByRole('button', { name: 'Medical Center Director' })).toBeVisible();
  
  
  await page.locator('#pos396_1_numFTE').hover();
  await page.getByRole('link', {name: 'View Details' }).hover();
  await page.getByRole('link', { name: 'View Details' }).click();

});