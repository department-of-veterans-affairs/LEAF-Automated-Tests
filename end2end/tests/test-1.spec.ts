import { test, expect } from '@playwright/test';

test('test', async ({ page, context }) => {

  // Go to Template Editory
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_templates&file=view_homepage.tpl');
  await expect(page.locator('#filename')).toHaveText('view_homepage');
  
  // Create a promise that resolves when a new page is opened
  const pagePromise = context.waitForEvent('page');

  // Click the template initial_form with the middle mouse button to open in a new tab
  await page.getByRole('link', { name: 'initial_form' }).click({
    button: 'middle'
  });

  // Await the new page object
  const newPage = await pagePromise;

  // Wait for the new page to load its content
  await newPage.waitForLoadState();

  // Confirm that the new tab is the initial_form template
  await expect(newPage).toHaveURL('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_templates&file=initial_form.tpl'); // Example assertion
  await expect(newPage.locator('#filename')).toHaveText('initial_form');
});