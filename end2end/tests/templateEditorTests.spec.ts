import { test, expect } from '@playwright/test';


  /**
   * Test for LEAF 4960
   * Ensure changes to print_subindicators and print_subindicators_ajax templates are applied
  */
  test('Add customization to print_subindicators templates', async ({ page }) => {

    // Confirm customization has not been added
    await page.goto('https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=966');
    await expect(page.locator('#xhrIndicator_20_1')).toHaveText('test');

    // Go to Template Editor
    await page.getByRole('link', { name: 'Home' }).click();
    await page.getByRole('link', { name: 'Admin Panel' }).click();
    await page.getByRole('button', { name: ' Template Editor Edit HTML' }).click();

    // Add 'AAAAA' to the beginning of the print_subindicators template
    await page.getByRole('button', { name: 'print_subindicators', exact: true }).click();
    await expect(page.locator('#filename')).toHaveText('print_subindicators');
    await page.reload();
    await expect(page.getByText('<!--{strip}-->')).toBeVisible();
    await page.getByText('<!--{strip}-->').click();
    await page.getByLabel('Template Editor coding area.').press('ArrowLeft');
    await page.getByLabel('Template Editor coding area.').press('ArrowLeft');
    await page.getByLabel('Template Editor coding area.').press('ArrowLeft');
    await page.getByLabel('Template Editor coding area.').press('ArrowLeft');
    await page.getByLabel('Template Editor coding area.').press('ArrowLeft');
    await page.getByLabel('Template Editor coding area.').press('ArrowLeft');
    await page.getByLabel('Template Editor coding area.').press('ArrowLeft');
    await page.getByLabel('Template Editor coding area.').press('ArrowUp');
    await page.getByLabel('Template Editor coding area.').fill('AAAAA');
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Add 'BBBBB' to the beginning of the print_subindicators_ajax template
    // Using the URL because Playwright will not click on the 'print_subindicators_ajax' link
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_templates&file=print_subindicators_ajax.tpl');
    await expect(page.locator('#filename')).toHaveText('print_subindicators_ajax');
    await expect(page.getByText('<!--{**}-->')).toBeVisible();
    await page.getByText('<!--{**}-->').click();
    await page.getByLabel('Template Editor coding area.').press('ArrowLeft');
    await page.getByLabel('Template Editor coding area.').press('ArrowLeft');
    await page.getByLabel('Template Editor coding area.').press('ArrowLeft');
    await page.getByLabel('Template Editor coding area.').press('ArrowLeft');
    await page.getByLabel('Template Editor coding area.').press('ArrowLeft');
    await page.getByLabel('Template Editor coding area.').press('ArrowUp');
    await page.getByLabel('Template Editor coding area.').fill('BBBBB');
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Confirm the 'AAAAA' and 'BBBBB' are visible on the request
    await page.getByRole('link', { name: 'Home' }).click();
    await page.getByRole('link', { name: 'TestForm_GetProgressChecking' }).click();
    await expect(page.locator('#xhrIndicator_20_1')).toContainText('BBBBB test AAAAA');

    // Restore the templates back to their original states
    await page.getByRole('link', { name: 'Admin Panel' }).click();
    await page.getByRole('button', { name: ' Template Editor Edit HTML' }).click();
    await page.getByRole('button', { name: 'print_subindicators', exact: true }).click();
    await page.getByRole('button', { name: 'Restore Original' }).click();
    await page.getByRole('button', { name: 'Yes' }).click();
    await page.getByRole('button', { name: 'print_subindicators_ajax' }).click();
    await page.getByRole('button', { name: 'Restore Original' }).click();
    await page.getByRole('button', { name: 'Yes' }).click();

    // Confirm the customization has been removed
    await page.getByRole('link', { name: 'Home' }).click();
    await page.getByRole('link', { name: 'TestForm_GetProgressChecking' }).click();
    await expect(page.locator('#xhrIndicator_20_1')).toContainText('test');
  });

  /**
   * Test for LEAF 5053
   * Verify that the correct template opens in a new tab
   * when using the middle mouse button
   */
  test('Template Link Opens in New Tab', async ({ page, context }) => {

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
  await newPage.bringToFront();

  // Confirm that the new tab is the initial_form template
  await expect(newPage).toHaveURL('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_templates&file=initial_form.tpl'); // Example assertion
  await expect(newPage.locator('#filename')).toHaveText('initial_form');
});