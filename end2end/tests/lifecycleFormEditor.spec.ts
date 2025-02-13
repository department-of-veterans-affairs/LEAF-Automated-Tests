import { test, expect, Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

// Generate unique text to help ensure that fields are being filled correctly.
let randNum = Math.random();
let uniqueText = `New Form ${randNum}`;

/**
 *  Create a new form with name in the variable 'uniqueText'
 *  and verify it is displayed in the Form Browser list
 */
test('Create New Form', async ({ page }) => {

  // Create a new form
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
  await page.getByRole('button', { name: 'Create Form' }).click();
  await page.getByLabel('Form Name (up to 50').fill(uniqueText);
  await page.getByLabel('Form Name (up to 50').press('Tab');
  await page.getByLabel('Form Description (up to 255').fill(uniqueText + ' Description');
  await page.getByRole('button', { name: 'Save' }).click();

  // Confirm form has name and description that were given
  await expect(page.getByLabel('Form name')).toHaveValue(uniqueText);
  await expect(page.getByLabel('Form description')).toHaveValue(uniqueText + ' Description');

  // Confirm the new form is visible in the list of forms
  await page.getByRole('link', { name: 'Form Browser' }).click();
  await expect(page.getByRole('link', { name: uniqueText })).toBeVisible(); 
});

/**
 *  Add a section to the form created in the previous test
 *  and verify it was added
 */
test('Add Section to Form', async ({ page }) => {

  // Add a new section to the form
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
  await page.getByRole('link', { name: uniqueText }).click();
  await page.getByLabel('Add Section').click();
  await page.getByLabel('Section Heading').click();
  await page.getByLabel('Section Heading').fill(uniqueText + ' Section');
  await page.getByRole('button', { name: 'Save' }).click();

  // Verify the section is added
  await expect(page.getByLabel('Section Heading')).toHaveText(uniqueText + ' Section');
});


/**
 *  Add a new question 'Are you a VA Employee?' with radio button options
 *  Yes/No to the new section in the previous test
 */
test('Add Question to Form', async ({ page }) => {

  // Add a question to the form
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
  await page.getByRole('link', { name: uniqueText }).click();
  await page.getByLabel('Add Question to Section').click();
  await page.getByLabel('Field Name').click();
  await page.getByLabel('Field Name').fill('Are you a VA Employee?');
  await page.getByLabel('Short label for spreadsheet').click();
  await page.getByLabel('Short label for spreadsheet').fill('VA Employee?');

  // Choose radio button for the input
  await page.getByLabel('Input Format').selectOption('radio');
  await page.getByLabel('Options (One option per line)').click();

  // Make the choices Yes and No
  await page.getByLabel('Options (One option per line)').fill('Yes\nNo');
  await page.getByRole('button', { name: 'Save' }).click();

  // Verify the question was added
  await expect(page.getByText('Are you a VA Employee?')).toBeVisible();
});

/**
 *  Add a sub-question to the question above:
 *  'Supervisor' with a text input
 */
test('Add Sub-Question to Form', async ({ page }) => {

  // Add a sub-question to the form 
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
  await page.getByRole('link', { name: uniqueText }).click();
  await page.getByLabel('add sub-question').click();
  await page.getByLabel('Field Name').fill('Supervisor Name');
  await page.getByLabel('Short label for spreadsheet').click();
  await page.getByLabel('Short label for spreadsheet').fill('Supervisor');

  // Choose the input format of 'Text'
  await page.getByLabel('Input Format').selectOption('text');
  await page.getByRole('button', { name: 'Save' }).click();

  // Verify the sub-quesiton was added
  await expect(page.getByText('Supervisor Name')).toBeVisible();
});

/**
 *  Add pre-filled if/then logic to the questions added above.
 *  If the answer to 'Are you a VA Employee?' is Yes then display
 *  the sub-question "Supervisor" prefilled with the answer "Jane Doe"
 */
test('Create Pre-Filled If/Then Question', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
  await page.getByRole('link', { name: uniqueText }).click();

  // Modify the main question to only show the sub-question in certain conditions
  await page.getByText('Modify Logic').last().click();
  await page.getByLabel('New Condition').click();
  await page.getByLabel('Select an outcome').selectOption('pre-fill');
  
  // Make selectOption more readable
  let optionToSelect = await page.locator('option', {hasText: 'Are you a VA Employee?'}).textContent();
  
  // remove trailing space
  const optionToSelectNoSpace = optionToSelect?.trim();

  // Add condition where the sub-question will only be visible if the user selects "Yes"
  await page.getByTitle('select controller question').selectOption({label: optionToSelectNoSpace});
  await page.getByLabel('select condition').selectOption('==');
  await page.getByLabel('select a value').selectOption('Yes');

  // When the sub-question is displayed, pre-fill the answer as "Jane Doe"
  await page.getByLabel('Enter a pre-fill value').click();
  await page.getByLabel('Enter a pre-fill value').fill('Jane Doe');
  await page.getByText('Close').focus();

  // Verify the if/then statement
  await expect(page.locator('#condition_editor_inputs')).toContainText('THEN \'Supervisor Name\' will have the value \'Jane Doe\'');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByLabel('Conditions For Supervisor').getByRole('listitem')).toContainText('If \'Are you a VA Employee?\' is Yes then pre-fill this question.');
  await page.getByText('Close').click();
})


/**
 *  Add an Internal Use Form to the form and verify
 *  it is visible to steps in the workflow
 */
test('Add Internal Use Form', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
  await page.getByRole('link', { name: uniqueText }).click();

  // Add a workflow to the form
  await page.getByLabel('Workflow: No Workflow. Users').selectOption('1');

  // Add an internal form
  await page.getByRole('button', { name: 'Add Internal-Use' }).click();
  await page.getByLabel('Form Name (up to 50').fill('My Internal Form');
  await page.getByLabel('Form Description (up to 255').click();
  await page.getByLabel('Form Description (up to 255').fill('My Internal Form Description');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.locator(".internal_forms")).toContainText('My Internal Form');

  // Check form is available to the workflow
  await page.getByLabel(uniqueText + ', main form').click();
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'View Workflow' }).click();
  const page1 = await page1Promise;
  await page1.getByLabel('workflow step: Step 2').click();
  
  // Confirm Form Field drop down contains the new Internal Form
  let optionArray = page1.getByLabel('Form Field:');
  await expect(page1.getByLabel('Form Field:')).toContainText(uniqueText + ': ' + uniqueText + ' Section');
});


/**
 *  Export the created form to a new forms folder
 *  under the end2end directory
 */
test('Export Form', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');

  // Choose the form and verify the correct form was selected
  await page.getByRole('link', { name: uniqueText }).click();
  await expect(page.getByText(uniqueText + ' Section')).toBeVisible();

  // Export the form to ./forms/
  const downloadPromise = page.waitForEvent('download');
  await page.getByLabel('export form').click();
  const download = await downloadPromise;
  await download.saveAs('./forms/' + uniqueText + '.txt');
});

/**
 *  Delete the new form
 */
test('Delete Form', async ({ page }) => {

  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');

  // Select the form to delete and verify the Form Browser page is loaded
  await page.getByRole('link', { name: uniqueText }).click();
  await expect(page.getByRole('heading', { name: 'Admin  Form Browser  Form' })).toBeVisible();

  // Delete the form
  await page.getByLabel('delete this form').click();
  await page.getByRole('button', { name: 'Yes' }).click();
  await expect(page.locator('#createFormButton')).toContainText('Create Form');

  // Verify form is no longer listed
  await expect(page.getByRole('link', { name: uniqueText })).not.toBeVisible();
});

/**
 *  Import the form that was exported and then 
 *  delete it
 */
test('Import Form', async ({ page }) => {

  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
  await page.getByRole('button', { name: 'Import Form' }).click();

  // Get the form to import
  const fileChooser = await page.locator('#formPacket');
  fileChooser.setInputFiles('./forms/' + uniqueText + '.txt');
  
  // Click on the Import button
  await page.getByRole('button', { name: 'Import', exact: true }).click();

  // Verify the imported form is displayed
  await expect(page.getByLabel('Form name')).toHaveValue(uniqueText + ' (Copy)');

  // Delete newly imported form to avoid confusion in future tests
  await page.getByLabel('delete this form').click();
  await page.getByRole('button', { name: 'Yes' }).click();
});