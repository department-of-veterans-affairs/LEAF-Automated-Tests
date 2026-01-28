import { test, expect } from '@playwright/test';

import {
  getRandomId,
  LEAF_URLS,
  createTestForm,
  selectChosenDropdownOption,
  loadForm,
  loadWorkflow,
  addFormQuestion,
  deleteTestFormByFormID,
  createBaseTestWorkflow,
  createTestRequest,
  deleteTestRequestByRequestID
} from '../leaf_test_utils/leaf_util_methods.ts';

test.describe.configure({ mode: 'serial' });

// Generate unique text to help ensure that fields are being filled correctly.
let testId:string = '';
let uniqueText:string = '';
let internalFormName:string = '';

test.beforeAll(() => {
  testId = getRandomId();
  uniqueText = `New Form ${testId}`;
  internalFormName = `Internal Form ${testId}`;
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
  const awaitNewIndicator = page.waitForResponse(res =>
    res.url().includes('formEditor/newIndicator') && res.status() === 200
  );
  await page.getByRole('button', { name: 'Save' }).click();
  const newIndicatorRes = await awaitNewIndicator;
  const indId = (await newIndicatorRes.text()).replaceAll('"', '');

  // Verify the section is added
  await expect(page.locator(`#format_label_${indId} .name`)).toHaveText(uniqueText + ' Section');
});


/**
 *  Add a new question 'Are you a VA Employee?' with radio button options
 *  Yes/No to the new section in the previous test
 */
test('Add Question to Form', async ({ page }) => {
  const fieldNameValue = 'Are you a VA Employee?';
  await page.goto(LEAF_URLS.FORM_EDITOR_FORM + newFormID);
  await expect(page.getByLabel('Form name')).toHaveValue(uniqueText);

  await expect(page.getByLabel('Add Question to Section')).toBeVisible();

  await page.getByLabel('Add Question to Section').click();
  await expect(page.getByLabel('Field Name')).toBeVisible();
  await page.getByLabel('Field Name').fill(fieldNameValue);

  // Choose radio button for the input. Make the choices Yes and No
  await page.getByLabel('Input Format').selectOption('radio');
  await page.getByLabel('Options (One option per line)').fill('Yes\nNo');
  const awaitNewIndicator = page.waitForResponse(res =>
    res.url().includes('formEditor/newIndicator') && res.status() === 200
  );
  await page.getByRole('button', { name: 'Save' }).click();
  const newIndicatorRes = await awaitNewIndicator;
  const indId = (await newIndicatorRes.text()).replaceAll('"', '');

  // Verify the question was added
  await expect(page.locator(`#format_label_${indId} .name`)).toHaveText(fieldNameValue);
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

  // Choose the input format of 'Text'
  await page.getByLabel('Input Format').selectOption('text');
  const awaitNewIndicator = page.waitForResponse(res =>
    res.url().includes('formEditor/newIndicator') && res.status() === 200
  );
  await page.getByRole('button', { name: 'Save' }).click();
  const newIndicatorRes = await awaitNewIndicator;
  const indId = (await newIndicatorRes.text()).replaceAll('"', '');

  // Verify the sub-quesiton was added
  await expect(page.locator(`#format_label_${indId} .name`)).toHaveText('Supervisor Name');
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
  await page.getByLabel('Form Name (up to 50').fill(internalFormName);
  await page.getByLabel('Form Description (up to 255').click();
  await page.getByLabel('Form Description (up to 255').fill(internalFormName + ' Description');
  await page.getByRole('button', { name: 'Save' }).click();

  const internalFormIDShort = 'Internal Form id_';
  await expect(page.locator(".internal_forms")).toContainText(internalFormIDShort);

  // Add a section to the internal form
  await page.getByLabel('Add Section').click();
  await page.getByLabel('Section Heading').fill(internalFormName + ' Section');
  await page.getByLabel('Input Format').selectOption('text');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText(internalFormName + ' Section')).toBeVisible();
  
});

/**
 * Verify the internal form added above is visible to steps in 
 * a workflow
 */
test('Internal Form is Visible to Workflow', async ({ page }) => {

  // Check form is available to the workflow
  
  await page.goto(LEAF_URLS.WORKFLOW_EDITOR_WF + GENERAL_WORKFLOW_ID);
  await page.getByLabel('workflow step: Step 2').click();
  
  // Confirm Form Field drop down contains the new Internal Form
  await expect(page.getByLabel('Form Field:')).toContainText(internalFormName + ': ' + internalFormName + ' Section');

});

let newRequestID = '';
/**
 * Test for LEAF 5054
 * Verify that the internal form is visible when choosing columns for
 * a quick review
 */
test("Internal Form is Visible in Quick Review", async ({ page }) => {

    // Create a new request using the form with the internal form
    const newRequestName = `New Request ${testId}`;
    newRequestID = await createTestRequest(page, 'Concrete Electronics', newRequestName, uniqueText);
    await page.locator('#nextQuestion2').click();

    // Submit the request
    await page.getByRole('button', { name: 'Submit Request' }).click();

    // Go to setup a Quick Review
    await page.getByRole('link', { name: 'Admin Panel' }).click();
    await page.getByRole('button', { name: 'Setup Quick Review Link' }).click();
    
    // Select the created form as the Form Type
    const selectFormType = page.locator('#forms');
    await selectFormType.selectOption({ label: uniqueText})

    // Select 'Step 1'
    const selectStep = page.locator('#steps')
    await selectStep.selectOption({ label: 'Step 1'});
    
    await page.getByRole('button', { name: 'Setup Quick Review' }).click();

    // Verify the Internal Form is included in the Field Names dropdown
    const fieldNameDropDown = page.locator('#fieldNames');
    await fieldNameDropDown.click();
    await expect(fieldNameDropDown.getByRole('option', {name: internalFormName})).toHaveCount(1);
    
})

/**
 * Test for LEAF 5054
 * Verify that the internal form is visible when choosing columns for
 * propose actions
 */
test("Internal Form is Visible in Propose Actions", async ({ page }) => {

  try{
      
      // Go to the Create Proposed Actions Page
      await page.goto(LEAF_URLS.PORTAL_HOME + 'report.php?a=LEAF_Propose_Actions');
      
      // Select the form created by the above tests as the Form Type
      const selectFormType = page.locator('#forms');
      await selectFormType.selectOption({ label: uniqueText})

      // Select 'Step 1'
      const selectStep = page.locator('#steps')
      await selectStep.selectOption({ label: 'Step 1'});

      await page.getByRole('button', { name: 'Setup Proposed Actions' }).click();

      // Verify the Internal Form is included in the Field Names dropdown
      const fieldNameDropDown = page.locator('#fieldNames');
      await fieldNameDropDown.click();
      await expect(fieldNameDropDown.getByRole('option', {name: internalFormName})).toHaveCount(1);

    } finally {

      // if a new request was created, cancel it
      if(newRequestID != '') {
        await deleteTestRequestByRequestID(page, newRequestID);
    }
  }
})

/**
 *  Export the created form to a new forms folder
 *  under the end2end directory
 */
test('Export Form', async ({ page }) => {
  await page.goto(LEAF_URLS.FORM_EDITOR_FORM + newFormID);
  await expect(page.getByLabel('Form name')).toHaveValue(uniqueText);

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
  await page.goto(LEAF_URLS.FORM_EDITOR_FORM + newFormID);
  await expect(page.getByLabel('Form name')).toHaveValue(uniqueText);

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
  await page.goto(LEAF_URLS.FORM_EDITOR);
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

  });
});

/**
 * Test for LEAF 5038 - no form modification when indicitor is used on workflow
 * and LEAF 5129 - indicate input format in message
 */
test('Elements attached to a workflow cannot be deleted from form', async ({ page }) => {
    test.setTimeout(180000);
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

      // Confirm that the Input Format dropdown is visible but disabled
      await expect(page.getByText('Input Format')).toBeVisible();
      await expect(page.getByTitle('Select a Format')).toBeDisabled();

      // Verify the Archive and Delete options are not available
      await expect(page.getByText('Archive', { exact: true })).not.toBeVisible();
      await expect(page.getByText('Delete', { exact: true })).not.toBeVisible();

      // Verify the user messages are displayed
      await expect(page.locator('#input-format')).toContainText('This field is used in a workflow and must be removed from there before you can change its format.');
      await expect(page.locator('#indicator-editing-attributes')).toContainText('This field is used in a workflow and must be removed from there before you can Archive or Delete it.');
      await page.getByRole('button', { name: 'Cancel' }).click();

      // Confirm the Archive and Delete are not available on the Single Line Text
      await page.getByTitle('edit indicator ' + textSectionID).click();
      await expect(page.getByText('Archive', { exact: true })).not.toBeVisible();
      await expect(page.getByText('Delete', { exact: true })).not.toBeVisible();

      // Confirm the message is displayed to the user
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