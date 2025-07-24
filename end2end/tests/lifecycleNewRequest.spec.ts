import { test, expect, Page } from '@playwright/test';

test.describe.configure({ mode: 'serial'});

let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
});

// Generate unique text to help ensure that fields are being filled correctly.
let randNum = Math.random();
let uniqueText = `My New Request ${randNum}`;

/**
 *  Verify the New Request page loads correctly
 */
test('Verify New Request Page', async () => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/');
    
    // Click on New Request button
    await page.getByText('New Request', { exact: true }).click();

    // Verify Create New Request Page displays
    await expect(page.locator('#record')).toContainText('Step 1 - General Information');

});

/**
 *  Verify a form with a status of 'Available' is available
 *  to be selected when creating a new request
 */
test('Available Form is Visible to New Request', async () => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
    await page.getByRole('link', { name: 'Simple form', exact: true }).click();

    // Set the status of the "Simple form" form to "Available"
    await page.getByLabel('Status:').selectOption('1');
    await page.getByRole('link', { name: 'Home' }).click();
    await page.getByText('New Request', { exact: true }).click();

    // Verify the form is a choice when creating a new request
    await expect(page.getByRole('heading', { name: 'Step 2 - Select type of' })).toBeVisible();
    await expect(page.getByText('Simple form')).toBeVisible();
});
 
/**
 *  Verify a new request can be edited 
 *  before being submitted
 */
test('Edit a New Request', async () => {
    // Create a new request
    await page.goto('https://host.docker.internal/Test_Request_Portal/?a=newform');
    await page.getByRole('cell', { name: 'Select an Option Service' }).locator('a').click();
    await page.getByRole('option', { name: 'Concrete Electronics' }).click();
    await page.getByLabel('Title of Request').click();
    await page.getByLabel('Title of Request').fill(uniqueText + ' to Edit, Copy, and Cancel');
    await page.locator('label').filter({ hasText: 'Simple form' }).locator('span').click();
    await page.getByRole('button', { name: 'Click here to Proceed' }).click();

    // Fill in the text with '12345'
    await page.getByLabel('single line text').click();
    await page.getByLabel('single line text').fill('12345');
    await page.locator('#nextQuestion2').click();

    // Verify the 'Single line text' is populated with '12345'
    await expect(page.locator('#data_11_1')).toContainText('12345');

    // Edit the form to replace '12345' with 'New Text'
    await page.getByRole('button', { name: 'Edit this form' }).click();
    await page.getByLabel('single line text').fill('New Text');
    await page.locator('#nextQuestion2').click();

    // Verify that 'single line text' is now populated with 'New Text'
    await expect(page.locator('#data_11_1')).toContainText('New Text');
});

/**
 *   Verify a request using a form whose status is
 *  'Available' can be copied
 */
test('Request With Available Form Can Be Copied', async () => {

    // Set the status of the 'Simple Form' to Available
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
    await page.getByRole('link', { name: 'Simple form' }).click();
    await expect(page.getByLabel('Status:')).toHaveValue('1');

    // Copy the request created in 'Edit a New Request'
    await page.getByRole('link', { name: 'Home' }).click();
    await page.getByRole('link', { name: uniqueText + ' to Edit, Copy, and Cancel' }).click();
    await page.getByRole('button', { name: 'Copy Request' }).click();
    await page.getByRole('button', { name: 'Save Change' }).click();

    // Change the value of 'single line text' in the copied request
    await page.getByLabel('single line text').click();
    await page.getByLabel('single line text').fill('New Text Available');
    await page.locator('#nextQuestion2').click();

    // Verify 'New Text Available' is displayed
    await expect(page.locator('#data_11_1')).toContainText('New Text Available');
    await page.getByRole('link', { name: 'Home' }).click();

    // Verify there are 2 requests with the name uniqueText + ' to Edit, Copy, and Cancel'
    await expect(page.getByRole('link', { name: uniqueText + ' to Edit, Copy, and Cancel' })).toHaveCount(2);
});

/**
 *  Verify a form with a status of 'Unpublished' is not available
 *  to be selected when creating a new request
 */
test('Unpublished Form Not Visible to New Request', async () => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
    await page.getByRole('link', { name: 'Simple form', exact: true }).click();

    // Set the status of the "Simple form" form to "Unpublished"
    await page.getByLabel('Status:').selectOption('-1');
    await page.getByRole('link', { name: 'Home' }).click();
    await page.getByText('New Request', { exact: true }).click();

    // Verify the form is not a choice when creating a new request
    await expect(page.getByRole('heading', { name: 'Step 2 - Select type of' })).toBeVisible();
    await expect(page.getByText('Simple form')).not.toBeVisible();
  });


test("Request with Unpublished Form Cannot Be Copied", async () => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
    await page.getByRole('link', { name: 'Simple form' }).click();
    await expect(page.getByLabel('Status:')).toHaveValue('-1');
    await page.getByRole('link', { name: 'Home' }).click();
    await page.getByRole('link', { name: uniqueText + ' to Edit, Copy, and Cancel' }).first().click();
    await page.getByRole('button', { name: 'Copy Request' }).click();
    await page.getByRole('button', { name: 'Save Change' }).click();
    await expect(page.getByText('Request could not be copied:')).toBeVisible();
})
  
/**
 *  Verify a form with a status of 'Hidden' is not available
 *  to be selected when creating a new request 
 */
test('Hidden Form Not Visible to New Request', async () => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
  await page.getByRole('link', { name: 'Simple form', exact: true }).click();

  // Set the status of the "Simple form" form to "Hidden"
  await page.getByLabel('Status:').selectOption('0');
  await page.getByRole('link', { name: 'Home' }).click();
  await page.getByText('New Request', { exact: true }).click();

   // Verify the form is not a choice when creating a new request
  await expect(page.getByRole('heading', { name: 'Step 2 - Select type of' })).toBeVisible();
  await expect(page.getByText('Simple form')).not.toBeVisible();
});

test("Request with Hidden Form Can Be Copied", async () => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
  await page.getByRole('link', { name: 'Simple form' }).click();
  await expect(page.getByLabel('Status:')).toHaveValue('0');
  await page.getByRole('link', { name: 'Home' }).click();
  await page.getByRole('link', { name: uniqueText + ' to Edit, Copy, and Cancel' }).first().click();
  await page.getByRole('button', { name: 'Copy Request' }).click();
  await page.getByRole('button', { name: 'Save Change' }).click();
  await page.getByLabel('single line text').click();
  await page.getByLabel('single line text').fill('New Text Hidden');
  await page.locator('#nextQuestion2').click();
  await expect(page.locator('#data_11_1')).toContainText('New Text Hidden');
  await page.getByRole('link', { name: 'Home' }).click();
  // Verify there are 3 requests now with the name uniqueText + ' to Edit, Copy, and Cancel'
  await expect(page.getByRole('link', { name: uniqueText + ' to Edit, Copy, and Cancel' })).toHaveCount(3);
})

/**
 *  Verify copied request in can be cancelled
 */
test('Cancel Requests', async () => {

  // Select previously created request
  await page.goto('https://host.docker.internal/Test_Request_Portal/');
  await expect(page.getByRole('link', { name: uniqueText + ' to Edit, Copy, and Cancel' })).toHaveCount(3);

  const requests = await page.getByRole('link', { name: uniqueText + ' to Edit, Copy, and Cancel' });

  let numRequests = await requests.count();

  while(numRequests--) {
    
    // Cancel request
    await requests.nth(numRequests).click();
    await page.getByRole('button', { name: 'Cancel Request' }).click();
    await page.getByPlaceholder('Enter Comment').click();
    await page.getByPlaceholder('Enter Comment').fill('No longer needed');
    await page.getByRole('button', { name: 'Yes' }).click();

    // Verify cancellation page appears
    await expect(page.locator('#bodyarea')).toContainText('has been cancelled!');
    await page.getByRole('link', { name: 'Home' }).click();
  }
 
  // Verify request no longer appears on the home page
  //await page.getByRole('link', { name: 'Home' }).click();
  await expect(page.getByText('New Request', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: uniqueText + ' to Edit, Copy, and Cancel' })).toHaveCount(0);
});

/**
 *  Test for 4665
 *  Verify that a negative amount is allowed for currency
 *  in a new request
 */
test('Negative Currency Allowed in New Request', async () => {
    
    await page.goto('https://host.docker.internal/Test_Request_Portal/?a=newform');
    await page.getByRole('cell', { name: 'Select an Option Service' }).locator('a').click();
    await page.getByRole('option', { name: 'Concrete Music' }).click();
    await page.getByLabel('Title of Request').click();
    await page.getByLabel('Title of Request').fill(uniqueText + ' to Test Negative Currency');

    // Choose the Input Formats form
    await page.locator('label').filter({ hasText: 'Input Formats (For testing' }).locator('span').click();
    await page.getByRole('button', { name: 'Click here to Proceed' }).click();
    await page.getByLabel('currency').click();

    // Fill in a negative number for the currency
    await page.getByLabel('currency').fill('-300');

    // After saving, verify the negative number is still visible 
    await page.locator('#save_indicator').click();
    await expect(page.getByLabel('currency')).toHaveValue('-300.00');

    // Verify negative number is still visible after the request is created
    await page.getByRole('button', { name: 'Show single page' }).click();
    await expect(page.locator('#data_37_1')).toContainText('-$300.00');
});

/**
 *  Test for 4665
 *  Verify that a negative amount is allowed for currency
 *  when editing a request
 */

test("Negative Currency Allowed When Editing a Request", async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/');

  const recordLink = page.getByRole('link', { name: uniqueText + ' to Test Negative Currency' });
  await recordLink.waitFor({ state: 'visible', timeout: 10000 });
  await recordLink.click();

  const editButton = page.getByRole('button', { name: 'Edit Basic input types field' });
  await editButton.waitFor({ state: 'visible', timeout: 10000 });
  await editButton.click();

  const currencyInput = page.getByLabel('currency');
  await currencyInput.waitFor({ state: 'visible', timeout: 10000 });
  await currencyInput.click();
  await currencyInput.fill('-50');

  const saveButton = page.getByRole('button', { name: 'Save Change' });
  await saveButton.waitFor({ state: 'visible', timeout: 10000 });
  await saveButton.click();

  const updatedField = page.locator('#data_37_1');
  await expect(updatedField).toHaveText('-$50.00', { timeout: 10000 });
});

/**
 * Test for LEAF 4913 
 */
test('Closing pop up window does not cause active form to disappear', async () => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=965');
  await expect(page.locator('#format_label_4').getByText('Multi line text', { exact: true })).toBeVisible();
  //await page.getByRole('button', { name: 'View History' }).click();
  await page.getByText('View History').click();
  await expect(page.getByText('History of Request ID#:')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.locator('#format_label_4').getByText('Multi line text', { exact: true })).toBeVisible();
});

/**
 *    Set of tests which do the following:
 *    1. Create a request with the "Multiple Person Designated" form
 *    2. Add values to both the "Reviewer 1" and "Reviewer 2" fields
 *    3. Archive the "Reviewer 2" field and verify the report still shows the entered value
 *    4. Restore the "Reviewer 2" field and verify the request still has the old value
 */
test.describe('Archive and Restore Question',() => {

  // Subsequent tests will make changes that will cause previous tests 
  // to fail so no retries
  test.describe.configure({ retries: 0});
  
  /**
   *  Create and submit the initial request
   *  with data in the field that is going to be archived
   */
  test('Create and Submit Request', async () => {
      
    // Create a new request with the form "Multiple Person Designated"
    await page.goto('https://host.docker.internal/Test_Request_Portal/?a=newform');
    await page.getByRole('cell', { name: 'Select an Option Service' }).locator('a').click();
    await page.getByRole('option', { name: 'Bronze Music' }).click();
    await page.getByLabel('Title of Request').click();
    await page.getByLabel('Title of Request').fill(uniqueText + ' to Create');
    await page.locator('label').filter({ hasText: 'Multiple person designated' }).locator('span').click();
    await page.getByRole('button', { name: 'Click here to Proceed' }).click();

    // Add Adam Bauch and Dorian Balistreri as Reviewers by username
    await page.getByLabel('Search for user to add as Reviewer 1').click();
    await page.getByLabel('Search for user to add as Reviewer 1').fill('userName:VTRSHHZOFIA');
    await page.getByLabel('Search for user to add as Reviewer 2').click();
    await page.getByLabel('Search for user to add as Reviewer 2').fill('userName:VTRUXEJAMIE');

    // Verify the correct users were found
    await expect(page.getByTitle('87 - VTRSHHZOFIA')).toContainText('Bauch, Adam Koelpin');
    await expect(page.getByTitle('25 - VTRUXEJAMIE')).toContainText('Balistreri, Dorian Dickens');

    // Ensure page has completely loaded before clicking the Next Question button
    await expect(page.locator('#loadingIndicator_15')).not.toBeVisible();
    await page.locator('#nextQuestion2').click();
        
    // Verify the request is populated with the correct users
    await expect(page.locator('#data_14_1')).toContainText('Adam Bauch');
    await expect(page.locator('#data_15_1')).toContainText('Dorian Balistreri');

    // Submit the request and verify it has been submitted
    await page.getByRole('button', { name: 'Submit Request' }).click();
    await expect(page.locator('#workflowbox_dep-1')).toContainText('Pending action from Adam Bauch');
  });

  /**
   *  After archiving the form question, 
   *  verify the data is no longer visible on the 
   *  original request
   */
  test('Archived Question Not Visible to New Request', async () => {
        
    // Archive the Reviewer 2 field
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
    await page.getByRole('link', { name: 'Multiple person designated', exact: true }).click();
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.locator('label').filter({ hasText: 'Archive' }).locator('span').click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('span').filter({ hasText: 'Reviewer 2,'})).not.toBeVisible();
    await page.getByRole('link', { name: 'Home' }).click();

    // Verify the Reviewer 1 field is visible but the Reviewer 2 field is not in the created request
    await page.getByRole('link', { name: uniqueText + ' to Create' }).click();
    await expect(page.getByText('Reviewer 1', { exact: true })).toBeVisible();
    await expect(page.getByText('Reviewer 2', { exact: true })).not.toBeVisible();
  });

  /**
   *  Show that despite the data of the archived question 
   *  not being visible in the original request, it is still 
   *  visible in a report.
   */
  test('Value Still Visible in Report After Archiving Question', async () => {
        
    // Create a new report containing the created request
    await page.goto('https://host.docker.internal/Test_Request_Portal/?a=reports&v=3');
    await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();
    await page.getByRole('option', { name: 'Title' }).click();
    await page.getByLabel('text', { exact: true }).click();
    await page.getByLabel('text', { exact: true }).fill(uniqueText + ' to Create');
    await page.getByRole('button', { name: 'Next Step' }).click();

    // Ensure both Reviewer fields are displayed in the report
    await page.getByText('Multiple person designated', { exact: true }).click();
    await page.getByTitle('indicatorID: 14\nReviewer').locator('span').click();
    await page.getByTitle('indicatorID: 15\nReviewer 2 (Archived)').locator('span').click();
    await page.getByRole('button', { name: 'Generate Report' }).click();

    // Verify the Reviewer 2 field is populated despite being archived
    await expect(page.locator('[data-indicator-id="15"]')).toContainText('Dorian Balistreri');
  });

  /**
   *  After restoring the form question, verify
   *  that the value is once again visible on the 
   *  original request.
   */
  test('Previous Value Still Available to Request After Restoring Question', async () => {

    // Restore the Reviewer 2 field
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
    await page.getByRole('link', { name: 'Multiple person designated', exact: true }).click();

    // Verify the 'Multiple person designated' form loaded
    await expect(page.getByLabel('Form name (24)')).toHaveValue('Multiple person designated');
    await page.getByRole('link', { name: 'Restore Fields' }).click();
    await page.getByRole('button', { name: 'Restore this field' }).click();
        
    // Verify the Reviewer 2 field is no longer on the 'Restore Fields' page 
    await expect(page.getByText('Reviewer 2')).not.toBeVisible();
    await page.getByRole('link', { name: 'Form Browser' }).click();
    await page.getByRole('link', { name: 'Multiple person designated', exact: true }).click();

    // Verify 'Reviewer 2' is once again on the form
    await expect(page.getByText('Reviewer 2')).toBeVisible();
    await page.getByRole('link', { name: 'Home' }).click();
    await page.getByRole('link', { name: uniqueText + ' to Create' }).click();

    // Verify Reviewer 2 is again visible on the created request and 
    // its value is 'Dorian Balistreri' as before
    await expect(page.getByText('Reviewer 2')).toBeVisible();
    await expect(page.locator('#data_15_1')).toContainText('Dorian Balistreri');
  });
});

test.afterAll(async () => {

    // Set status of Simple Form back to 'Available'
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
    await page.getByRole('link', { name: 'Simple form', exact: true }).click();
    await page.getByLabel('Status:').selectOption('1');

    // Cancel created form
    await page.getByRole('link', { name: 'Home' }).click();
    // await page.getByRole('link', { name: uniqueText + ' to Create' }).click({force:true}); { delay: 200 }
    const searchBar = page.locator('div#searchContainer div input');
    const magnifierIcon = page.locator('img.searchIcon').nth(0);

    await searchBar.type(uniqueText + ' to Create');
    await magnifierIcon.waitFor({ state: 'visible' });
    await page.locator('((//td)[2] //a)[2]').first().click();
    await page.getByRole('button', { name: 'Cancel Request' }).click({force:true});
    await page.getByPlaceholder('Enter Comment').click();
    await page.getByPlaceholder('Enter Comment').fill('No longer needed');
    await page.getByRole('button', { name: 'Yes' }).click();
    await expect(page.locator('#bodyarea')).toContainText('has been cancelled!');

    // Cancel the form used for testing negative currency
    await page.goto('https://host.docker.internal/Test_Request_Portal/');
    // await page.getByRole('link', { name: uniqueText + ' to Test Negative Currency' }).click();
    await searchBar.clear();
    await searchBar.type(uniqueText + ' to Test Negative Currency');
    await magnifierIcon.waitFor({ state: 'visible' }); 
    await page.locator('((//td)[2] //a)[2]').first().click();

    await page.getByRole('button', { name: 'Cancel Request' }).click();
    await page.getByRole('button', { name: 'Yes' }).click();

    // Close the page
    await page.close();
  });

