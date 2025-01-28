import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial'});

// Generate unique text to help ensure that fields are being filled correctly.
let randNum = Math.random();
let uniqueText = `My New Request ${randNum}`;

/**
 *  Verify the New Request page loads correctly
 */
test('Verify New Request Page', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/');
    
    // Click on New Request button
    await page.getByText('New Request', { exact: true }).click();

    // Verify Create New Request Page displays
    await expect(page.locator('#record')).toContainText('Step 1 - General Information');

});

 /**
  *     Verify a form with a status of 'Unpublished' is not available
  *     to be selected when creating a new request
  */
 test('Unpublished Form Not Visible to New Request', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
    await page.getByRole('link', { name: 'Multiple person designated', exact: true }).click();

    // Set the status of the "Multiple Person Designated" form to "Unpublished"
    await page.getByLabel('Status:').selectOption('-1');
    await page.getByRole('link', { name: 'Home' }).click();
    await page.getByText('New Request', { exact: true }).click();

    // Verify the form is not a choice when creating a new request
    await expect(page.getByText('Multiple person designated')).not.toBeVisible();
  });
  
 /**
  * Verify a form with a status of 'Hidden' is not available
  * to be selected when creating a new request
  */
  test('Hidden Form Not Visible to New Request', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
    await page.getByRole('link', { name: 'Multiple person designated', exact: true }).click();

    // Set the status of the "Multiple Person Designated" form to "Hidden"
    await page.getByLabel('Status:').selectOption('0');
    await page.getByRole('link', { name: 'Home' }).click();
    await page.getByText('New Request', { exact: true }).click();

     // Verify the form is not a choice when creating a new request
    await expect(page.getByText('Multiple person designated')).not.toBeVisible();
  });
  
 /**
  * Verify a form with a status of 'Available' is available
  * to be selected when creating a new request
  */
  test('Available Form is Visible to New Request', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
    await page.getByRole('link', { name: 'Multiple person designated', exact: true }).click();

    // Set the status of the "Multiple Person Designated" form to "Available"
    await page.getByLabel('Status:').selectOption('1');
    await page.getByRole('link', { name: 'Home' }).click();
    await page.getByText('New Request', { exact: true }).click();

    // Verify the form is a choice when creating a new request
    await expect(page.getByText('Multiple person designated')).toBeVisible();
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
    
    test('Create and Submit Request', async ({ page }) => {
        
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
        await expect(page.locator('#loadingIndicator_15')).not.toBeVisible();
        await page.locator('#nextQuestion2').click();
        
        // Verify the request is populated with the correct users
        await expect(page.locator('#data_14_1')).toContainText('Adam Bauch');
        await expect(page.locator('#data_15_1')).toContainText('Dorian Balistreri');

        // Submit the request and verify it has been submitted
        await page.getByRole('button', { name: 'Submit Request' }).click();
        await expect(page.locator('#workflowbox_dep-1')).toContainText('Pending action from Adam Bauch');
    });

    test('Archived Question Not Visible to New Request', async ({ page }) => {
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

    test('Value Still Visible in Report After Archiving Question', async ({ page }) => {
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

    test('Previous Value Still Available to Request After Restoring Question', async ({ page }) => {

        test.slow();
        // Restore the Reviewer 2 field
        await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
        await page.getByRole('link', { name: 'Multiple person designated', exact: true }).click();

        // Verify the 'Multiple person designated' form loaded
        await expect(page.getByLabel('Form name (24)')).toHaveValue('Multiple person designated');
        await page.getByRole('link', { name: 'Restore Fields' }).click();
        await page.reload();
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

/**
 * Verify a new request can be edited 
 * before being submitted
 */
test('Edit a New Request', async ({ page }) => {
    // Create a new request
    await page.goto('https://host.docker.internal/Test_Request_Portal/?a=newform');
    await page.getByRole('cell', { name: 'Select an Option Service' }).locator('a').click();
    await page.getByRole('option', { name: 'Concrete Electronics' }).click();
    await page.getByLabel('Title of Request').click();
    await page.getByLabel('Title of Request').fill(uniqueText + ' to Edit and Cancel');
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
})

/**
 *  Verify request in previous test can be cancelled
 */
test('Cancel Request', async ({ page }) => {

    // Select previously created request
    await page.goto('https://host.docker.internal/Test_Request_Portal/');
    await page.getByRole('link', { name: uniqueText + ' to Edit and Cancel' }).click();

    // Cancel request
    await page.getByRole('button', { name: 'Cancel Request' }).click();
    await page.getByPlaceholder('Enter Comment').click();
    await page.getByPlaceholder('Enter Comment').fill('No longer needed');
    await page.getByRole('button', { name: 'Yes' }).click();

    // Verify cancellation page appears
    await expect(page.locator('#bodyarea')).toContainText('has been cancelled!');

    // Verify request no longer appears on the home page
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page.getByRole('link', { name: uniqueText + ' to Edit and Cancel' })).not.toBeVisible();
})