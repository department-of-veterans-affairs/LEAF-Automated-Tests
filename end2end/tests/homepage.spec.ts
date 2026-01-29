import { test, expect } from '@playwright/test';
import {
  LEAF_URLS,
  createTestRequest,
  deleteTestRequestByRequestID,
  getRandomId
} from '../leaf_test_utils/leaf_util_methods';

test('search record ID using quick search', async ({ page }, testInfo) => {
  await page.goto(LEAF_URLS.PORTAL_HOME);

  await page.getByLabel('Enter your search text').click();

  // Use .pressSequentially since the UX does search-as-you-type
  await page.getByLabel('Enter your search text').pressSequentially('500');
  await expect(page.getByRole('link', { name: '500', exact: true })).toBeInViewport();

  const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
});

test('search record ID using advanced options', async ({ page }, testInfo) => {
  await page.goto(LEAF_URLS.PORTAL_HOME);

  await page.getByRole('button', { name: 'Advanced Options' }).click();
  await expect(page.getByRole('button', { name: 'Apply Filters' })).toBeInViewport();
  await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();  
  await expect(page.getByRole('option', { name: 'Record ID' })).toBeInViewport();
  await page.getByRole('option', { name: 'Record ID' }).click();
  await page.getByLabel('text', { exact: true }).click();
  await page.getByLabel('text', { exact: true }).fill('500');
  await page.getByRole('button', { name: 'Apply Filters' }).click();
  await expect(page.getByRole('link', { name: '500', exact: true })).toBeInViewport();

  const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });

});

test('new record', async ({ page }, testInfo) => {

  let requestID = '';
  
  try {

  let randNum = getRandomId();
  let uniqueText = `New e2e request ${randNum}`;
 
  requestID = await createTestRequest(page, 'Iron Sports', uniqueText, 'Simple form');

  await page.getByLabel('single line text').fill('single line');
  await page.getByRole('button', { name: 'Next Question', exact: true }).first().click();
  await expect(page.locator('#requestTitle')).toContainText(uniqueText);

  const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });

  } finally {

    if(requestID != '')
    {
      await deleteTestRequestByRequestID(page, requestID);
    }
    
  }

});

test('table header background color is inverted when scrolled down', async ({ page }, testInfo) => {
  await page.goto(LEAF_URLS.PORTAL_HOME);

  // The homepage runs an async request, and we need to wait for it to complete
  // before navigating to the end of the page.
  // TODO: maybe this this locator can be improved to avoid relying on the "Searching for records" text
  await expect(page.locator('#searchContainer')).not.toContainText('Searching for records');
  await page.keyboard.press('End');

  // Check filter instead of background-color, since the actual color shift is implemented via CSS filter
  await expect(page.getByLabel('Sort by Title')).toHaveCSS('filter', 'invert(1) grayscale(1)');

  const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
});

test('show more records', async ({ page }, testInfo) => {
  await page.goto(LEAF_URLS.PORTAL_HOME);

  // Wait for async load
  await expect(page.locator('#searchContainer')).not.toContainText('Searching for records');

  await expect(page.getByRole('link', { name: '5', exact: true })).not.toBeVisible(); // arbitrary record that would be on the bottom of the full list
  await page.getByRole('button', { name: 'Show more records' }).click();
  await expect(page.getByRole('button', { name: 'Show more records' })).not.toBeVisible();
  await page.keyboard.press('End');
  await expect(page.getByRole('link', { name: '5', exact: true })).toBeVisible();;
});
