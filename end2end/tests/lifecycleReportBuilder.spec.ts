import { test, expect } from '@playwright/test';

/**
 *  Verify the Report Builder link from the
 *  Home Page is working
 */
test('Report Builder Link is Functional', async ({ page }) => {

  // Go to the LEAF Homepage
  await page.goto('https://host.docker.internal/Test_Request_Portal/');

  // Click on the Report Builder link
  await page.getByText('Report Builder').click();

  // Verify the Report Builder page is displayed
  await expect(page.getByText('Step 1: Develop search filter')).toBeVisible();
});

/**
 *  Verify the correct columns are available
 *  to select for the selected form type
 */
test('Correct Data Columns Available to Select', async ({ page}) => {

  // Go to Report Builder page
  await page.goto('https://host.docker.internal/Test_Request_Portal/?a=reports&v=3');

  // Filter by Type IS General Form
  await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();
  await page.getByRole('option', { name: 'Type' }).click();
  await page.getByRole('cell', { name: 'Complex Form' }).locator('a').click();
  await page.getByRole('option', { name: 'General Form' }).click();
  await page.getByRole('button', { name: 'Next Step' }).click();

  // Verify the "Assigned Group" column is listed under the "General Form"
  await page.locator('#indicatorList').getByText('General Form').click();
  await expect(page.getByText('Assigned Group')).toBeVisible();
});

/**
 *  Verify the selected columns
 *  are displayed in the report
 */
test('Correct Columns Displayed', async ({ page }) => {

  // Go to Report Builder
  await page.goto('https://host.docker.internal/Test_Request_Portal/?a=reports&v=3');

  // Filter by Type IS General Form
  await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();
  await page.getByRole('option', { name: 'Type' }).click();
  await page.getByRole('cell', { name: 'Complex Form' }).click();
  await page.getByRole('option', { name: 'General Form' }).click();
  await page.getByRole('button', { name: 'Next Step' }).click();

  // Select the "Assigned Group" column under "General Form"
  await page.locator('#indicatorList').getByText('General Form').click();
  await page.getByTitle('indicatorID: 9\nAssigned Group').locator('span').click();
  await page.getByRole('button', { name: 'Generate Report' }).click();

  // Verify the "Assigned Group" column is displayed
  await expect(page.getByLabel('Sort by Assigned Group')).toBeVisible();
});

/**
 *  Change the search criteria of an existing report 
 */
test('Modify Search', async ({ page }) => {

  // Go to an existing report which is filtered by "General Form" with
  // the "Assigned Group" column selected 
  await page.goto('https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJAYwIaQDmA9lAJ4CSAIiADQjEAO0Bp2AvHSDATgBbYAZqRgB9AKwQ8ABgDsXQgQjYAggDkaAX1rosiEBggAbCJCz0mLMG32d6PMPyTT6iyKo0hNAXXoArYjQAOwQUXxA4UjAkYG0QQlMqAjwkZBAAThBwozQYNGjEAEZpEvocvLAAeUFBOFNnTSA&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAgE5mtBvjABBFiwgBzKGRgACAOLpUAVwAOzNug54eAXSA%3D');
  
  // Click on "Modify Search"
  await page.getByRole('button', { name: 'Modify Search' }).click();

  // Add to the existing filter "And"
  await page.getByLabel('add logical and filter').click();

  // add filter Title != "Available for test case"
  await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();
  await page.getByRole('option', { name: 'Title' }).click();  
  await page.getByRole('cell', { name: 'CONTAINS' }).locator('a').click();
  await page.getByRole('option', { name: '!=' }).click();
  await page.getByLabel('text', { exact: true }).click();
  await page.getByLabel('text', { exact: true }).fill('Available for test case');
  await page.getByRole('button', { name: 'Next Step' }).click();

  // Keep existing column selections
  await page.getByRole('button', { name: 'Generate Report' }).click();

  // Verify that no results with "Available for test case" are shown
  const results = await page.getByText('Available for test case').all();
  for ( const result of results ) {
   await expect( result ).not.toBeVisible();
  }
   
});

/**
 *  Change the order and name of columns in a report
 */
test('Edit Labels', async ({ page }) => {

  // Go to Report Builder
  await page.goto('https://host.docker.internal/Test_Request_Portal/?a=reports&v=3');

  // Keep default search filter
  await page.getByRole('button', { name: 'Next Step' }).click();

  // Select the columns "Assigned Group", "Assigned Person", and "Assigned Person 2"
  // from under "General Form"
  await page.getByText('General Form').click();
  await page.getByTitle('indicatorID: 9\nAssigned Group').locator('span').click();
  await page.getByTitle('indicatorID: 8\nAssigned Person').locator('span').click();
  await page.getByTitle('indicatorID: 10\nAssigned Person').locator('span').click();
  await page.getByRole('button', { name: 'Generate Report' }).click();

  // Verify the third column in the report is "Assigned Group"
  await expect(page.locator('th').nth(2)).toContainText('Assigned Group');

  // Click on "Edit Labels" and verify the window is displayed
  await page.getByRole('button', { name: 'Edit Labels' }).click();
  await expect(page.getByRole('button', { name: 'Save Change' })).toBeVisible();

  // Move the "Assigned Group" column to the end
  await page.getByRole('row', { name: '#d1dfff Assigned Group move' }).getByLabel('move column down').click();
  await page.getByRole('row', { name: '#d1dfff Assigned Group move' }).getByLabel('move column down').click();

  // Rename "Assigned Person 2" to "Second Assigned Person"
  await page.getByRole('row', { name: '#d1dfff Assigned Person 2' }).getByLabel('edit header column text').click();
  await page.getByRole('row', { name: '#d1dfff Assigned Person 2' }).getByLabel('edit header column text').fill('Second Assigned Person');

  // Save the changes
  await page.getByRole('button', { name: 'Save Change' }).click();

  // Verify that the 4th column is now named "Second Assigned Person"
  await expect(page.locator('th').nth(3)).toContainText('Second Assigned Person');

  // Verify that "Assigned Group" is now the 5th column
  await expect(page.locator('th').nth(4)).toContainText('Assigned Group');
  
});

/**
 *  Update the title of a report
 */
test('Change Report Title', async ({ page }) => {

  // Go to Report Builder page
  await page.goto('https://host.docker.internal/Test_Request_Portal/?a=reports&v=3');

  // Keep default options on both pages
  await page.getByRole('button', { name: 'Next Step' }).click();
  await page.getByRole('button', { name: 'Generate Report' }).click();

  // Verify the title of the report is empty
  await expect(page.getByPlaceholder('Untitled Report')).toBeEmpty();

  // Change the title to "Default Options Report"
  await page.getByPlaceholder('Untitled Report').click();
  await page.getByPlaceholder('Untitled Report').fill('Default Options Report');
  await page.getByPlaceholder('Untitled Report').press('Enter');

  // Verify the title is now "Default Options Report"
  await expect(page.getByPlaceholder('Untitled Report')).toHaveValue('Default Options Report');
});

// Generate unique text to help ensure that fields are being filled correctly.
let randNum = Math.random();
let uniqueText = `My New Request ${randNum}`;

/**
 *  Add a new row to the generated report, change 
 *  the title, and add data.
 *  Afterwards, cancel the new request
 */
test('Add a New Row and Populate', async ({ page }) => {

  // Go to Report Builder page
  await page.goto('https://host.docker.internal/Test_Request_Portal/?a=reports&v=3');

  // Set filter to Type IS Input Formats
  await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();
  await page.getByRole('option', { name: 'Type' }).click();
  await page.getByRole('cell', { name: 'Complex Form' }).locator('a').click();
  await page.getByRole('option', { name: 'Input Formats' }).click();
  await page.getByRole('button', { name: 'Next Step' }).click();

  // Choose the column 'checkboxes (LEAF-check)' from under 'Input Formats'
  await page.locator('#indicatorList').getByText('Input Formats').click();
  await page.getByTitle('indicatorID: 45\ncheckboxes (LEAF-check)').locator('span').click();
  await page.getByRole('button', { name: 'Generate Report' }).click();

  // Wait until the records text appears
  await expect(page.locator('#reportStats')).toContainText('records');
  
  // Get the number of rows in the original report
  const initialRows = await page.locator('table tbody tr').count();
  
  // Click 'Create Row' button
  await page.getByRole('button', { name: 'Create Row' }).click();

  // Wait until the "Stop and show results button" appears and dissappears
  await expect(page.getByRole('button', { name: 'Stop and show results'})).toBeVisible();
  await expect(page.getByRole('button', { name: 'Stop and show results'})).not.toBeVisible();
  
  // Get the rows for the new table after adding a row
  const newTable = await page.getByRole('table');
  const tableBody = await newTable.locator('tbody');
  const newRows = await tableBody.locator('tr');  
  
  // Get the number of rows that is expected
  const expectedRows = await initialRows.valueOf() + 1;

  // Get the number of actual rows
  const numNewRows = await newRows.count();

  // Verify that the number of rows in the new report matches the number
  // of expected rows
  await expect(numNewRows).toEqual(expectedRows);

  // Find the maximum UID
  // Get all the cells that contain UIDs
  const uidCells = await tableBody.locator('tr td:first-child').all();

  // Assume the new row is the first row and the max UID is the first element in uidCells
  let rowAdded = await newRows.first();
  let maxUID = Number( await uidCells[0].innerText());
  
  // For each UID in the UID array, if the number in the array is bigger than the
  // previous UID, set the max UID to that number and set the new row to the 
  // corresponding row in the report
  for(let i = 1; i < uidCells.length; i++) {
    let numCompare = Number(await uidCells[i].textContent());

    if(numCompare > maxUID) {
      maxUID = numCompare;
      rowAdded = await newRows.nth(i);
    }
  }
  
  // Update the title of the added row to the uniqueText
  const titleCell = await rowAdded.locator('td').nth(1);
  await titleCell.click();
  await page.getByLabel('Report Title').click();
  await page.getByLabel('Report Title').fill(uniqueText);
  await page.getByRole('button', { name: 'Save Change' }).click();

  // Verify the new title matches the uniqueText
  await expect(titleCell).toContainText(uniqueText);
  
  // Check the values 5 and 6 in the 'checkboxes (LEAF-check)'
  const dataCell = await rowAdded.locator('td').nth(2);
  await dataCell.click();

  expect(page.locator('#confirm_loadIndicator')).not.toBeVisible();
  //await page.locator('label').filter({ hasText: '5' }).locator('span').click();
  await page.locator('label').getByText('5', { exact: true}).locator('span').click();
  await page.locator('label').getByText('6', { exact: true}).locator('span').click();
  await page.getByRole('button', { name: 'Save Change' }).click();

  // Verify the values in the new row contain '5, 6'
  await expect(dataCell).toContainText('5, 6');

  // Cancel the created 'My New Request"
  await page.getByRole('link', { name: 'Home' }).click();
  await page.getByRole('link', { name: uniqueText }).click();
  await page.getByRole('button', { name: 'Cancel Request' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();
});

/**
 *  Test for 4665
 *  Verify that a negative currency is 
 *  allowed to be added to a report
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

/**
 *  Verify the UID link goes to the correct 
 *  corresponding request
 */
test('Go to UID Link', async ({ page }) => {

  // Go to Report Builder page
  await page.goto('https://host.docker.internal/Test_Request_Portal/?a=reports&v=3');

  // Change search filter to Type IS General Form
  await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();
  await page.getByRole('option', { name: 'Type' }).click();
  await page.getByRole('cell', { name: 'Complex Form' }).locator('a').click();
  await page.getByRole('option', { name: 'General Form' }).click();

  // Add 'AND'to the search filter
  await page.getByLabel('add logical and filter').click();

  // Set second portion of search to Title CONTAINS Tester
  await page.getByRole('cell', { name: 'Current Status', exact: true }).locator('a').click();  
  await page.locator('[id*="_widgetTerm_1-chosen-search-result-5"]').click();
  await page.getByLabel('text', { exact: true }).click();
  await page.getByLabel('text', { exact: true }).fill('Tester');

  // Add an 'OR' to the search filter
  await page.getByLabel('add logical or filter').click();
  await page.getByRole('cell', { name: 'Current Status', exact: true }).locator('a').click();

  // Set third search filter to Titla CONTAINS Character
  await page.locator('[id*="_widgetTerm_2-chosen-search-result-5"]').click();
  await page.getByRole('row', { name: 'remove filter row OR Title' }).getByLabel('text').click();
  await page.getByRole('row', { name: 'remove filter row OR Title' }).getByLabel('text').fill('Character');
  await page.getByRole('button', { name: 'Next Step' }).click();

  // Select the column named "Single Line Text" under "General Form"
  await page.locator('#indicatorList').getByText('General Form').click();
  await page.getByTitle('indicatorID: 3\nSingle line text').click();
  await page.getByRole('button', { name: 'Generate Report' }).click();

  // Verify that the contents of the "Single line text" cell for 
  // row with UID 964 starts with "This is an otter"
  await expect(page.locator('[id^="LeafFormGrid"]').locator('[id$="_964_3"]')).toContainText('This is an otter');

  // Click on the 964 link to go to the request
  await page.getByRole('link', { name: '964' }).click();

  // Confirm that the 'Single line text' in the request also 
  // contains 'This is an otter'
  await expect(page.locator('#data_3_1')).toContainText('This is an otter');
});

test('verify the newly created row is highlighted and contains "untitled"', async ({ page }) => {
  // 1) Navigate & build the report…
  await page.goto('https://host.docker.internal/Test_Request_Portal/?a=reports&v=3');
  await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();
  await page.getByRole('option', { name: 'Type' }).click();
  await page.getByRole('cell', { name: 'Complex Form' }).locator('a').click();
  await page.getByRole('option', { name: 'Input Formats' }).click();
  await page.getByRole('button', { name: 'Next Step' }).click();
  await page.locator('#indicatorList').getByText('Input Formats').click();
  await page.getByTitle('indicatorID: 45\ncheckboxes (LEAF-check)').locator('span').click();
  await page.getByRole('button', { name: 'Generate Report' }).click();
  await expect(page.locator('#reportStats')).toContainText('records');
  await page.waitForSelector('table tbody tr');

  // 2) Create the new row
  await page.getByRole('button', { name: /Create Row/i }).click();

  // 3) Target the yellow-highlighted "untitled" row
  const highlightedRow = page.locator(
    'table tbody tr[style*="background-color"]',
    { hasText: 'untitled' }
  );

  // 4) Wait for it and assert
  await expect(highlightedRow).toBeVisible();
  await expect(highlightedRow).toContainText('untitled');
});


