import { test, expect } from '@playwright/test';

test('Report Builder Link is Functional', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/');
  await page.getByText('Report Builder').click();
  await expect(page.getByText('Step 1: Develop search filter')).toBeVisible();
});

test('Correct Data Columns Available to Select', async ({ page}) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/?a=reports&v=3');
  await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();
  const optionType = await page.getByRole('option', { name: 'Type' }).click();
  await page.getByRole('cell', { name: 'Complex Form' }).locator('a').click();
  await page.getByRole('option', { name: 'General Form' }).click();
  await page.getByRole('button', { name: 'Next Step' }).click();
  await page.locator('#indicatorList').getByText('General Form').click();
  await expect(page.getByText('Assigned Group')).toBeVisible();
});

test('Correct Columns Displayed', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/?a=reports&v=3');
  await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();
  await page.getByRole('option', { name: 'Type' }).click();
  await page.getByRole('cell', { name: 'Complex Form' }).click();
  await page.getByRole('option', { name: 'General Form' }).click();
  await page.getByRole('button', { name: 'Next Step' }).click();
  await page.locator('#indicatorList').getByText('General Form').click();
  await page.getByTitle('indicatorID: 9\nAssigned Group').locator('span').click();
  await page.getByRole('button', { name: 'Generate Report' }).click();
  await expect(page.getByLabel('Sort by Assigned Group')).toBeVisible();
});

test('Modify Search', async ({ page }) => {
   await page.goto('https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJAYwIaQDmA9lAJ4CSAIiADQjEAO0Bp2AvHSDATgBbYAZqRgB9AKwQ8ABgDsXQgQjYAggDkaAX1rosiEBggAbCJCz0mLMG32d6PMPyTT6iyKo0hNAXXoArYjQAOwQUXxA4UjAkYG0QQlMqAjwkZBAAThBwozQYNGjEAEZpEvocvLAAeUFBOFNnTSA&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAgE5mtBvjABBFiwgBzKGRgACAOLpUAVwAOzNug54eAXSA%3D');
   await page.getByRole('button', { name: 'Modify Search' }).click();
   await page.getByLabel('add logical and filter').click();
   await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();
   
   await page.getByRole('option', { name: 'Title' }).click();  

   await page.getByRole('cell', { name: 'CONTAINS' }).locator('a').click();
   await page.getByRole('option', { name: '!=' }).click();
   await page.getByLabel('text', { exact: true }).click();
   await page.getByLabel('text', { exact: true }).fill('Available for test case');
   await page.getByRole('button', { name: 'Next Step' }).click();
   await page.getByRole('button', { name: 'Generate Report' }).click();

   const results = await page.getByText('Available for test case').all();
   for ( const result of results ) {
    await expect( result ).not.toBeVisible();
   }
   
});

test('Edit Labels', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/?a=reports&v=3');
  await page.getByRole('button', { name: 'Next Step' }).click();
  await page.getByText('General Form').click();
  await page.getByTitle('indicatorID: 9\nAssigned Group').locator('span').click();
  await page.getByTitle('indicatorID: 8\nAssigned Person').locator('span').click();
  await page.getByTitle('indicatorID: 10\nAssigned Person').locator('span').click();
  await page.getByRole('button', { name: 'Generate Report' }).click();
  await expect(page.locator('th').nth(2)).toContainText('Assigned Group');
  await page.getByRole('button', { name: 'Edit Labels' }).click();
  await expect(page.getByRole('button', { name: 'Save Change' })).toBeVisible();
  await page.getByRole('row', { name: '#d1dfff Assigned Group move' }).getByLabel('move column down').click();
  await page.getByRole('row', { name: '#d1dfff Assigned Group move' }).getByLabel('move column down').click();
  await page.getByRole('row', { name: '#d1dfff Assigned Person 2' }).getByLabel('edit header column text').click();
  await page.getByRole('row', { name: '#d1dfff Assigned Person 2' }).getByLabel('edit header column text').fill('Second Assigned Person');
  await page.getByRole('button', { name: 'Save Change' }).click();
  await expect(page.locator('th').nth(3)).toContainText('Second Assigned Person');
  await expect(page.locator('th').nth(4)).toContainText('Assigned Group');
  
});

test('Change Report Title', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/?a=reports&v=3');
  await page.getByRole('button', { name: 'Next Step' }).click();
  await page.getByRole('button', { name: 'Generate Report' }).click();
  await expect(page.getByPlaceholder('Untitled Report')).toBeEmpty();
  await page.getByPlaceholder('Untitled Report').click();
  await page.getByPlaceholder('Untitled Report').fill('Default Options Report');
  await page.getByPlaceholder('Untitled Report').press('Enter');
  await expect(page.getByPlaceholder('Untitled Report')).toHaveValue('Default Options Report');
});

// Generate unique text to help ensure that fields are being filled correctly.
// let randNum = Math.random();
// let uniqueText = `My New Request ${randNum}`;

/**
 * TODO: 
 * - Add Comments
 * - Change text of record count to actual count of records
 * - Remove hard coded 967 and find the cell through the HTML
 * 
 */
test('Add a New Row and Populate', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/?a=reports&v=3');
  await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();
  await page.getByRole('option', { name: 'Type' }).click();
  await page.getByRole('cell', { name: 'Complex Form' }).locator('a').click();
  await page.getByRole('option', { name: 'Input Formats' }).click();
  await page.getByRole('button', { name: 'Next Step' }).click();
  await page.locator('#indicatorList').getByText('Input Formats').click();
  await page.getByTitle('indicatorID: 45\ncheckboxes (LEAF-check)').locator('span').click();
  await page.getByRole('button', { name: 'Generate Report' }).click();
  await expect(page.locator('#reportStats')).toContainText('4 records');
  await page.getByRole('button', { name: 'Create Row' }).click();
  await expect(page.locator('#reportStats')).toContainText('5 records');
  await page.getByRole('cell', { name: 'untitled' }).click();
  await page.getByLabel('Report Title').click();
  await page.getByLabel('Report Title').fill('My New Request');
  await page.getByRole('button', { name: 'Save Change' }).click();

  await expect(page.locator('[id*="_967_title"]')).toContainText('My New Request');
  
  await page.locator('[data-record-id="967"]').click();
  await page.locator('label').filter({ hasText: '5' }).locator('span').click();
  await page.locator('label').filter({ hasText: '6' }).locator('span').click();
  await page.getByRole('button', { name: 'Save Change' }).click();
  await expect(page.locator('[data-record-id="967"]')).toContainText('5, 6');

  // Cancel the created 'My New Request"
  await page.getByRole('link', { name: 'Home' }).click();
  await page.getByRole('link', { name: 'My New Request' }).click();
  await page.getByRole('button', { name: 'Cancel Request' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();
});

/**
 *  Test for 4665
 *  Verify that a negative currency is 
 *  allowed to be added to a report
 *  
 *  TODO: Remove hard coded 962 and find the cell through HTML
 */
test('Report Allows Negative Currency', async ({ page}) => {

  // Create a new report
  await page.goto("https://host.docker.internal/Test_Request_Portal/")
  await page.getByText('Report Builder Create custom').click();
  await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();
  await page.getByRole('option', { name: 'Type' }).click();

  // Choose reports which use the Input Formats form
  await page.getByRole('cell', { name: 'Complex Form' }).locator('a').click();
  await page.getByRole('option', { name: 'Input Formats' }).click();
  await page.getByRole('button', { name: 'Next Step' }).click();
  await page.locator('#indicatorList').getByText('Input Formats').click();

  // Choose currency as one of the columns
  await page.getByText('currency', { exact: true }).click();
  await page.getByRole('button', { name: 'Generate Report' }).click();
  await page.locator('[data-record-id="962"]').click();

  // Input a negative currency 
  await page.getByRole('textbox', { name: 'currency' }).click();
  await page.getByRole('textbox', { name: 'currency' }).fill('-200');
  await page.getByRole('button', { name: 'Save Change' }).click();

  // Verify the negative currency is displayed
  await expect(page.locator('[data-record-id="962"]')).toContainText('-200.00');

  // Clear out the currency value as to not affect other tests
  await page.locator('[data-record-id="962"]').click();
  await page.getByRole('textbox', { name: 'currency' }).click();
  await page.getByRole('textbox', { name: 'currency' }).fill('');
  await page.getByRole('button', { name: 'Save Change' }).click();
});

test('Go to UID Link', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/?a=reports&v=3');
  await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();
  await page.getByRole('option', { name: 'Type' }).click();
  await page.getByRole('cell', { name: 'Complex Form' }).locator('a').click();
  await page.getByRole('option', { name: 'General Form' }).click();
  await page.getByLabel('add logical and filter').click();
  await page.getByRole('cell', { name: 'Current Status', exact: true }).locator('a').click();  
  await page.locator('[id*="_widgetTerm_1-chosen-search-result-5"]').click();
  await page.getByLabel('text', { exact: true }).click();
  await page.getByLabel('text', { exact: true }).fill('Tester');
  await page.getByLabel('add logical or filter').click();
  await page.getByRole('cell', { name: 'Current Status', exact: true }).locator('a').click();
  await page.locator('[id*="_widgetTerm_2-chosen-search-result-5"]').click();
  await page.getByRole('row', { name: 'remove filter row OR Title' }).getByLabel('text').click();
  await page.getByRole('row', { name: 'remove filter row OR Title' }).getByLabel('text').fill('Character');
  await page.getByRole('button', { name: 'Next Step' }).click();
  await page.locator('#indicatorList').getByText('General Form').click();
  await page.getByTitle('indicatorID: 3\nSingle line text').click();
  await page.getByRole('button', { name: 'Generate Report' }).click();
  await expect(page.locator('[id^="LeafFormGrid"]').locator('[id$="_964_3"]')).toContainText('This is an otter');
  await page.getByRole('link', { name: '964' }).click();
  await expect(page.locator('#data_3_1')).toContainText('This is an otter');
});
