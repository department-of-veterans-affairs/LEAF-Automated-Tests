import { test, expect, Page } from '@playwright/test';

import {
  getRandomId,
  createTestForm,
  selectChosenDropdownOption,
  loadForm,
  loadWorkflow,
  addFormQuestion,
  deleteTestFormByFormID,
  createBaseTestWorkflow
} from '../leaf_test_utils/leaf_util_methods.ts';

test.describe.configure({ mode: 'serial' });

// Generate unique text to help ensure that fields are being filled correctly.
const testId = getRandomId();
let uniqueText = `New Form ${testId}`;



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
  await page.getByRole('link', { name: uniqueText }).click({force:true});
  await page.getByLabel('Add Question to Section').click({force:true});
  await page.getByLabel('Field Name').click({force:true});
  await page.getByLabel('Field Name').fill('Are you a VA Employee?');
  await page.getByLabel('Short label for spreadsheet').click();
  await page.getByLabel('Short label for spreadsheet').fill('VA Employee?');

  // Choose radio button for the input
  await page.getByLabel('Input Format').selectOption('radio');
  await page.getByLabel('Options (One option per line)').click({force:true});

  // Make the choices Yes and No
  await page.getByLabel('Options (One option per line)').fill('Yes\nNo');
  await page.getByRole('button', { name: 'Save' }).click({force:true});

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
  await page.locator(`//a[normalize-space()='`+uniqueText+`']`).click();
  await page.locator("button[title='add sub-question']").click();
  await page.locator("#name").fill('Supervisor Name');
  await page.locator('#description').fill('Supervisor');

  // Choose the input format of 'Text'
  await page.getByLabel('Input Format').selectOption('text');
  await page.locator("#button_save").click();

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
  const fileChooser = page.locator('#formPacket');
  await fileChooser.setInputFiles('./forms/' + uniqueText + '.txt');
  
  // Click on the Import button
  await page.getByRole('button', { name: 'Import', exact: true }).click();

  // Verify the imported form is displayed
  await page.locator('#categoryName').click();
  await expect(page.locator('#categoryName')).toHaveValue(uniqueText + ' (Copy)');

  // Delete newly imported form to avoid confusion in future tests
  await page.getByLabel('delete this form').click();
  await page.getByRole('button', { name: 'Yes' }).click();
});

test.describe('Tests for LEAF 4697', () => {

  test('Verify breadcrumb and delete button locations', async ({ page }) => {
    
    // Go to Form Editor
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
    
    // Choose 'Simple Form'
    await page.getByRole('link', { name: 'Simple form' }).click();
    await expect(page.getByLabel('Form name (39)')).toBeVisible();

    // Verify breadcrumb availability
    const breadcrumb = page.locator('#page_breadcrumbs');
    const breadcrumbText = await breadcrumb.innerText();
    expect(breadcrumbText).toContain('Admin');

    const coordinatesOfBreadcrumb = await breadcrumb.boundingBox();
    const breadcrumbY = coordinatesOfBreadcrumb ? coordinatesOfBreadcrumb.y : 0;

    // Verify menu options in the navigation bar
    const viewHistoryOption = page.locator("//button[@title='view form history']");
    const customizeWriteAccessBtn = page.locator("//button[@title='Edit Special Write Access']");
    const exportFormBtn = page.locator("//button[@title='export form']");
    const RestoreField = page.locator("//li //a[@class='router-link']");
    const deleteFormButton = page.locator("//button[@title='delete this form']");
    
    await expect(viewHistoryOption).toBeVisible();
    await expect(customizeWriteAccessBtn).toBeVisible();
    await expect(exportFormBtn).toBeVisible();
    await expect(RestoreField).toBeVisible();
    await expect(deleteFormButton).toBeVisible();
    
    const navBar = page.locator("//nav[@id='top-menu-nav']");
    const coordinatesOfNavBar = await navBar.boundingBox();
    const navBarY = coordinatesOfNavBar ? coordinatesOfNavBar.y : 0;

    // Validate breadcrumb is above the NavBar
    expect(breadcrumbY).toBeLessThan(navBarY);

    // Validate delete button is on right side of the NavBar
    const deleteFormButtonPosition = await deleteFormButton.boundingBox();
    const deleteFormButtonX = deleteFormButtonPosition ? deleteFormButtonPosition.x : 0;

    const RestoreFieldPosition = await RestoreField.boundingBox();
    const RestoreFieldX = RestoreFieldPosition ? RestoreFieldPosition.x : 0;
    expect(deleteFormButtonX).toBeGreaterThan(RestoreFieldX);
  });

  test('Swapping to formatted code does not dissappear after typing in Advanced Formatting', async ( { page }) => {
      
    // Go to Form Editor
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
    
    // Choose 'Simple Form'
    await page.getByRole('link', { name: 'Simple form' }).click();
    await expect(page.getByLabel('Form name (39)')).toBeVisible();

    const formEditorLink = page.locator("(//div[@class='name_and_toolbar form-header'] //button)[1]");
    await formEditorLink.click();

    const formattedCodeBtn = page.locator("button#rawNameEditor");
    const advancedFormattingTab = page.locator("//div[@contenteditable='true']");
    const advancedFormattingButton = page.locator("//button[@title='use advanced text editor']");
    const formattedCodeInput = page.locator("//textarea[@id='name']");
    const inputTitle = "This is a test paragraph with list content.";
    
    await advancedFormattingButton.click();
    await advancedFormattingTab.click();
    await advancedFormattingTab.clear();

    await page.keyboard.type(inputTitle);
    await formattedCodeBtn.click();
    await formattedCodeInput.waitFor({ state: 'visible' });
    const formattedCodeText = await formattedCodeInput.inputValue();
    expect(formattedCodeText).toContain(inputTitle);

  });

  test('List in Field Name is bulleted when using the Advanced Formatter', async ({ page }) => {

    // Go to Form Editor
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
    
    // Choose 'Simple Form'
    await page.getByRole('link', { name: 'Simple form' }).click();
    await expect(page.getByLabel('Form name (39)')).toBeVisible();

    const formEditorLink = page.locator("(//div[@class='name_and_toolbar form-header'] //button)[1]");
    await formEditorLink.click();

    // Verify Bullet List Formatting
    const bulletListButton = page.locator("//button[@title='Unordered list']");
    const formattedCodeBtn = page.locator("button#rawNameEditor");
    const advancedFormattingTab = page.locator("//div[@contenteditable='true']");
    const advancedFormattingButton = page.locator("//button[@title='use advanced text editor']");
    const formattedCodeInput = page.locator("//textarea[@id='name']");
    
    await advancedFormattingButton.click();
    await advancedFormattingTab.click();
    await advancedFormattingTab.clear();
    await bulletListButton.click();
    
    await page.keyboard.type('Bullet item 1');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Bullet item 2');
    await formattedCodeBtn.click();
    await formattedCodeInput.waitFor({ state: 'visible' });
    const formattedCodeText = await formattedCodeInput.inputValue();
    expect(formattedCodeText).toContain('<ul><li>Bullet item 1</li><li>Bullet item 2</li></ul>');

  });

  test('List in Field Name is numbered when using the Advanced Formatter', async ({ page }) => {

    // Go to Form Editor
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
    
    // Choose 'Simple Form'
    await page.getByRole('link', { name: 'Simple form' }).click();
    await expect(page.getByLabel('Form name (39)')).toBeVisible();

    const formEditorLink = page.locator("(//div[@class='name_and_toolbar form-header'] //button)[1]");
    await formEditorLink.click();

    // Verify Numbered List Formatting
    const numberedListButton = page.locator("//button[@title='Ordered list']");  
    const advancedFormattingButton = page.locator("//button[@title='use advanced text editor']");
    const advancedFormattingTab = page.locator("//div[@contenteditable='true']");
    const formattedCodeInput = page.locator("//textarea[@id='name']");
    const formattedCodeBtn = page.locator("button#rawNameEditor");

    await advancedFormattingButton.click();
    await advancedFormattingTab.waitFor({ state: 'visible' });
    
    await advancedFormattingTab.click();
    await advancedFormattingTab.clear();
    await numberedListButton.click();

    await page.keyboard.type('Numbered item 1');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Numbered item 2');

    await formattedCodeBtn.click();
    await formattedCodeInput.waitFor({ state: 'visible' });

    const numberedFormattedCodeText = await formattedCodeInput.inputValue();
    expect(numberedFormattedCodeText).toContain('<ol><li>Numbered item 1</li><li>Numbered item 2</li></ol>');

    // await page.getByRole('button', { name: 'Cancel' }).click();
    // await expect(page.getByText('single line text')).toBeVisible();
    
  });
});

/**
 * Test for LEAF 5038 - no form modification when indicitor is used on workflow
 */
test('Elements attached to a workflow cannot be deleted from form', async ({ page }) => {

    let formEditorFieldsFormID = '';
    let workflowID = '';
    let stepID = '';

    const workflowName = `workflow_name_${testId}`;
    const stepTitle = "Step 1";
    const stepElement = page.getByLabel(`workflow step: ${stepTitle}`, { exact: true });

    try {
      // Create the form and add sections
      formEditorFieldsFormID = await createTestForm(page, `form_name_${testId}`, `form_descr_${testId}`);
      const personSectionID = await addFormQuestion(page, 'Add Section', 'Assigned Person', 'Orgchart Employee');
      const groupSectionID = await addFormQuestion(page, 'Add Section', 'Assigned Group', 'Orgchart Group');
      const textSectionID = await addFormQuestion(page, 'Add Section', 'Single line text', 'Single line text');

      // Create workflow
      const workflowAndStepIDs = await createBaseTestWorkflow(page, workflowName, stepTitle);
      workflowID = workflowAndStepIDs[0];
      stepID = workflowAndStepIDs[1];

      // Attach workflow to form
      await loadForm(page, formEditorFieldsFormID);
      await page.getByLabel('Workflow: No Workflow. Users').selectOption(workflowID);

      // Go back to the workflow
      await loadWorkflow(page, workflowID);
      await expect(stepElement).toBeVisible();
      stepElement.click();

      // Add Person designated requirement
      const addRequirement = await page.getByRole('button', { name: 'Add Requirement' });
      await expect(addRequirement).toBeVisible()
      await addRequirement.click();

      await selectChosenDropdownOption(page, '#dependencyID_chosen', 'Person Designated by the Requestor');
      
      const saveButton = await page.getByRole('button', { name: 'Save' });
      saveButton.click();

      // Set the Available Person data field
      const setDataField = await page.getByRole('button', { name: 'Set Data Field' });
      await expect(setDataField).toBeVisible();
      setDataField.click();

      await expect(page.getByText('Set Indicator ID')).toBeVisible();
      await page.locator('#indicatorID').selectOption(personSectionID);
      await saveButton.click();
      await expect(stepElement).toBeVisible();

      // Set the Single Line Text form field
      await stepElement.click();
      await page.getByLabel('Form Field:').selectOption(textSectionID);
      await stepElement.click();
      
      // Confirm that the Input Form and Delete/Archive options are not available on Assigned Person
      await loadForm(page, formEditorFieldsFormID);
      await expect(page.getByText('Assigned Person')).toBeVisible();
      await page.getByTitle('edit indicator ' + personSectionID).click();
      await expect(page.locator('#input-format')).toContainText('This field is used in a workflow and must be removed from there before you can change its format.');
      await expect(page.locator('#indicator-editing-attributes')).toContainText('This field is used in a workflow and must be removed from there before you can Archive or Delete it.');
      await page.getByRole('button', { name: 'Cancel' }).click();

      // Confirm the Archive and Delete are not available on the Single Line Text
      await page.getByTitle('edit indicator ' + textSectionID).click();
      await expect(page.locator('#indicator-editing-attributes')).toContainText('This field is used in a workflow and must be removed from there before you can Archive or Delete it.');
      await page.getByRole('button', { name: 'Cancel' }).click();

      // Confirm the Archive/Delete and Input Dropdown are avaiable on the Assigned Group
      await page.getByTitle('edit indicator ' + groupSectionID).click();
      await expect(page.getByText('Input Format')).toBeVisible();
      await expect(page.getByText('Archive', { exact: true })).toBeVisible();
      await expect(page.getByText('Delete', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Cancel' }).click();

    } finally {

      // Delete the work flow if it was created
      if(workflowID != '') {
        
        await loadWorkflow(page, workflowID);

        // Delete the step if it was created
        if(stepID != '') {
          
          await expect(stepElement).toBeVisible();
          stepElement.click();

          await expect(page.locator(`id=stepInfo_${stepID}`)).toBeVisible();
          await page.getByLabel('Remove Step').click();
          await page.getByRole('button', { name: 'Yes' }).click();
          await expect(stepElement).not.toBeVisible();
        }
      }
      
      if(formEditorFieldsFormID != '') {

        // Delete the form
        await deleteTestFormByFormID(page, formEditorFieldsFormID);
      }

      if(workflowID != '') {

        // Delete the workflow
        await loadWorkflow(page, workflowID);
        await page.getByRole('button', { name: 'Delete Workflow' }).click();
        await page.getByRole('button', { name: 'Yes' }).click();
      }
    }
    
});

/**
 * Test for LEAF 5109 - Enable "Need to Know" by Default for All 
 *  LEAF forms
 */
test('Verify Default Form Values are set', async ({ page }) => {

  let formID = '';

  try {

  // Constants for dropdown values
  const NO_WORKFLOW = '0';
  const UNPUBLISHED = '-1';
  const NEED_TO_KNOW_ON = '1';
  const FORM_TYPE_STANDARD = '';

  // Create a new form
  formID = await createTestForm(page, `form_name_${testId}`, `form_descr_${testId}`);

  // Check that the Select Workflow dropdown is set to 'No Workflow. Users cannot submit requests' 
  const selectWorkflow = page.locator('#workflowID');
  await expect(selectWorkflow).toHaveValue(NO_WORKFLOW);

  // Check that Select Availability is set to 'Unpublished'
  const selectAvailability = page.locator('#availability');
  await expect(selectAvailability).toHaveValue(UNPUBLISHED);

  // Check that Need to Know is set to 'On'
  const needToKnow = page.locator('#needToKnow');
  await expect(needToKnow).toHaveValue(NEED_TO_KNOW_ON);

  // Check that Form Type is set to 'Standard'
  const formType = page.locator('#formType');
  await expect(formType).toHaveValue(FORM_TYPE_STANDARD);

  } finally {

    // If the form was created, delete it
    if(formID != '')
      await deleteTestFormByFormID(page, formID);

  }
});