import { test, expect } from '@playwright/test';

import {
  getRandomId,
  LEAF_URLS
} from '../leaf_test_utils/leaf_util_methods.ts';

test.describe.configure({ mode: 'serial' });

// Generate unique text to help ensure that fields are being filled correctly.
let testId:string = '';
let uniqueText:string = '';
let internalFormID:string = '';
test.beforeAll(() => {
  testId = getRandomId();
  uniqueText = `New Form ${testId}`;
  internalFormID = `Internal Form ${testId}`;
});

const GENERAL_WORKFLOW_ID = '1';
let newFormID = ''; //set in first test.  tests are serial (1 worker)

/**
 *  Create a new form with name in the variable 'uniqueText'
 *  and verify it is displayed in the Form Browser list
 */
test('Create New Form', async ({ page }) => {
  await page.goto(LEAF_URLS.FORM_EDITOR);
  await page.getByRole('button', { name: 'Create Form' }).click();
  await expect(page.getByLabel('Form Name (up to 50')).toBeVisible();

  await page.getByLabel('Form Name (up to 50').fill(uniqueText);
  await page.getByLabel('Form Description (up to 255').fill(uniqueText + ' Description');
  await page.getByRole('button', { name: 'Save' }).click();

  // Confirm form has name and description that were given
  await expect(page.getByLabel('Form name')).toHaveValue(uniqueText);
  await expect(page.getByLabel('Form description')).toHaveValue(uniqueText + ' Description');

  // Set form Status to available
  const AVAILABLE_STATUS = '1';
  await page.getByLabel('Status:').selectOption(AVAILABLE_STATUS);

  // Confirm the new form is visible in the list of forms
  await page.getByRole('link', { name: 'Form Browser' }).click();
  await expect(page.getByRole('link', { name: uniqueText })).toBeVisible();
  //nav is functional. Get id for direct nav for remaining tests.
  await page.getByRole('link', { name: uniqueText }).click();
  await expect(page.getByLabel('Form name')).toHaveValue(uniqueText);
  newFormID = await page.locator('#edit-properties-panel .form-id').innerText() ?? '';
});

/**
 *  Add a section to the form created in the previous test
 *  and verify it was added
 */
test('Add first Section to Form', async ({ page }) => {
  await page.goto(LEAF_URLS.FORM_EDITOR_FORM + newFormID);
  await expect(page.getByLabel('Form name')).toHaveValue(uniqueText);

  //the only option for a new form should be Add Section
  await expect(page.getByLabel('Add Section')).toBeVisible();
  await expect(page.getByLabel('Add Question to Section')).not.toBeVisible();
  await expect(page.getByLabel('add sub-question')).not.toBeVisible();

  await page.getByLabel('Add Section').click();
  await expect(page.getByLabel('Section Heading')).toBeVisible();
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
  await page.goto(LEAF_URLS.FORM_EDITOR_FORM + newFormID);
  await expect(page.getByLabel('Form name')).toHaveValue(uniqueText);

  await expect(page.getByLabel('Add Question to Section')).toBeVisible();

  await page.getByLabel('Add Question to Section').click();
  await expect(page.getByLabel('Field Name')).toBeVisible();
  await page.getByLabel('Field Name').fill('Are you a VA Employee?');
  await page.getByLabel('Short label for spreadsheet').fill('VA Employee?');

  // Choose radio button for the input. Make the choices Yes and No
  await page.getByLabel('Input Format').selectOption('radio');
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
  await page.goto(LEAF_URLS.FORM_EDITOR_FORM + newFormID);
  await expect(page.getByLabel('Form name')).toHaveValue(uniqueText);

  await expect(page.getByLabel('add sub-question')).toBeVisible();

  await page.getByLabel('add sub-question').click();
  await expect(page.getByLabel('Field Name')).toBeVisible();
  await page.getByLabel('Field Name').fill('Supervisor Name');
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
  await page.goto(LEAF_URLS.FORM_EDITOR_FORM + newFormID);
  await expect(page.getByLabel('Form name')).toHaveValue(uniqueText);

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
  await page.getByRole('searchbox', { name: 'parent value choices'}).click();
  await page.getByRole('option', { name: 'Yes Press to select' }).click();

  // When the sub-question is displayed, pre-fill the answer as "Jane Doe"
  await page.getByLabel('Enter a pre-fill value').click();
  await page.getByLabel('Enter a pre-fill value').fill('Jane Doe');
  await page.getByText('Close').focus();

  // Verify the if/then statement
  await expect(page.locator('#condition_editor_inputs')).toContainText('THEN \'Supervisor Name\' will have the value \'Jane Doe\'');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByLabel('Conditions For Supervisor').getByRole('listitem')).toContainText(`\'Are you a VA Employee?\' includes Yes`);
  await page.getByText('Close').click();
})


/**
 *  Add an Internal Use Form to the form and verify
 *  it is visible to steps in the workflow
 */
test('Add Internal Use Form', async ({ page }) => {

  await page.goto(LEAF_URLS.FORM_EDITOR_FORM + newFormID);
  await expect(page.getByLabel('Form name')).toHaveValue(uniqueText);

  // Add a workflow to the form
  await page.getByLabel('Workflow: No Workflow. Users').selectOption(GENERAL_WORKFLOW_ID);

  // Add an internal form
  await page.getByRole('button', { name: 'Add Internal-Use' }).click();
  await page.getByLabel('Form Name (up to 50').fill(internalFormID);
  await page.getByLabel('Form Description (up to 255').click();
  await page.getByLabel('Form Description (up to 255').fill(internalFormID + ' Description');
  await page.getByRole('button', { name: 'Save' }).click();

  const internalFormIDShort = 'Internal Form id_';
  await expect(page.locator(".internal_forms")).toContainText(internalFormIDShort);

  // Add a section to the internal form
  await page.getByLabel('Add Section').click();
  await page.getByLabel('Section Heading').fill(internalFormID + ' Section');
  await page.getByLabel('Input Format').selectOption('text');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText(internalFormID + ' Section')).toBeVisible();
  
});

test('Verify Internal Form is Visible to Workflow', async ({ page }) => {

  // Check form is available to the workflow
  
  await page.goto(LEAF_URLS.WORKFLOW_EDITOR_WF + GENERAL_WORKFLOW_ID);
  await page.getByLabel('workflow step: Step 2').click();
  
  // Confirm Form Field drop down contains the new Internal Form
  await expect(page.getByLabel('Form Field:')).toContainText(internalFormID + ': ' + internalFormID + ' Section');

});