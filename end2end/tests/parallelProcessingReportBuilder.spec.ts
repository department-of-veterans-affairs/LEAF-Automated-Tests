import { test, expect } from '@playwright/test';
import { creatInitialForm, addFormQuestion, selectChosenDropdownOption } from '../leaf_test_utils/leaf_util_methods.ts';


//Run test in order
test.describe.configure({ mode: 'serial' });

//Global Variables
const randNum = Math.random();
const uniqueFormName = `Parallel_Process_${randNum}`;
const uniqueFormDescr = `Parallel Processing testing_${randNum}`;
const questionOrgEmpLabel = 'Please select an employee';
const questionOrgPosLabel = 'Please enter a position';
const questionTextContent = 'PPRB - Please select a group';
const questionWithHTML = `<p><span style="color: rgb(128, 100, 162);">${questionTextContent}</span></p>`;
const workflowTitle = `Workflow_${randNum}`;
const newStepTitle = `ParallelTest_${randNum}`;
const newRequestForm = `Request Form_${randNum}`;

let newFormID = '';
let parallelApproverIndID = '';

test ('Create a New Form', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
  await creatInitialForm(page, uniqueFormName, uniqueFormDescr);
  await addFormQuestion(page, 'Add Section', 'Section 1', '');
  await addFormQuestion(page, 'Add Question to Section', questionOrgEmpLabel, 'orgchart_employee');
  await addFormQuestion(page, 'Add Question to Section', questionOrgPosLabel, 'orgchart_position');
  await addFormQuestion(page, 'Add Question to Section', questionWithHTML, 'orgchart_group');
  await page.getByLabel('Status:').selectOption('1');
  await page.getByLabel('Form Type:').selectOption('parallel_processing');
  newFormID = await page.locator('#edit-properties-panel .form-id').innerText() ?? '';
});


//Set up Workflow
test('Create Workflow', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=workflow');
  await expect(page.getByRole('button', { name: 'New Workflow' })).toBeVisible();

  //Create Workflow
  await page.getByRole('button', { name: 'New Workflow' }).click();
  await expect(page.getByText('Create new workflow')).toBeVisible();
  await page.getByRole('textbox', { name: 'Workflow Title:' }).fill(workflowTitle);
  await page.getByRole('button', { name: 'Save' }).click();

  //Create New Step
  await page.getByRole('button', { name: 'New Step' }).click();
  await expect(page.getByText('Create new Step')).toBeVisible();
  await page.getByRole('textbox', { name: 'Step Title:' }).fill(newStepTitle);
  await page.getByRole('button', { name: 'Save' }).click();

  // Verify that the new step is visible
  const stepElement = page.getByLabel(`workflow step: ${newStepTitle}`, { exact: true });
  await expect(stepElement).toBeInViewport();

  // Hover over the new step and drag it to the desired position
  await page.reload();
  await stepElement.hover();
  await page.mouse.down();
  await page.mouse.move(300, 300);
  await page.mouse.up();

  // Locate connectors and drag them to connect steps
  const stepConnector = page.locator('.jtk-endpoint').nth(0);
  const endConnector = page.locator('.jtk-endpoint').nth(2);
  await stepConnector.dragTo(endConnector);

  await selectChosenDropdownOption(page, '#actionType_chosen', 'Approve');
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible(); 
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.locator('.workflowAction', { hasText: 'Approve' })).toBeVisible();

  await expect(page.getByRole('button', { name: newStepTitle })).toBeVisible();
  await page.getByRole('button', { name: newStepTitle }).click();

  await expect(page.getByRole('button', { name: 'Add Requirement' })).toBeVisible();
  await page.getByRole('button', { name: 'Add Requirement' }).click();

  await selectChosenDropdownOption(page, '#dependencyID_chosen', 'Group Designated by the Requestor');
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByRole('button', { name: 'Set Data Field' })).toBeVisible();
  await page.getByRole('button', { name: 'Set Data Field' }).click();
  const option = page.locator('select > option', { hasText: uniqueFormName }).first();

  parallelApproverIndID = await option.getAttribute('value') ?? '';
  await page.locator('#indicatorID').selectOption(parallelApproverIndID);
  await page.getByRole('button', { name: 'Save' }).click();
});


test('Update Form workflow', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/forms?formID=' + newFormID);
  const workflowLocator = page.locator('select > option', { hasText: workflowTitle });
  const workflowValue = await workflowLocator.getAttribute('value');
  await expect(page.locator('#edit-properties-other-properties')).toBeVisible();
  await page.getByLabel('Workflow: No Workflow. Users').selectOption(workflowValue);
});

//Create New Request
test('Create New Request', async ({ page }, testInfo) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/?a=newform');
  await expect(page.locator('#step1_questions')).toBeVisible();
  await selectChosenDropdownOption(page, '#service_chosen', 'Bronze Kids');
  await page.getByRole('textbox', { name: 'Title of Request' }).fill(newRequestForm);
  await page.getByText(uniqueFormName).click();
  await page.getByRole('button', { name: 'Click here to Proceed' }).click();
  await expect(page.getByText('Form completion progress: 0% Next Question')).toBeVisible();

  await page.getByRole('searchbox', { name: 'Search for user to add as ' + questionOrgEmpLabel }).fill('t');
  await page.getByRole('cell', { name: 'Bins, Terina Corkery. Dynamic' }).click();

  await page.getByRole('searchbox', { name: 'Search for user to add as ' + questionOrgPosLabel }).fill('t');
  await page.getByRole('cell', { name: 'Accountability Officer (GS 14' }).click();

  await page.getByRole('searchbox', { name: 'Search for user to add as ' + questionTextContent }).fill('t');
  await page.getByRole('cell', { name: '2911 TEST Group', exact: true }).click();
  await page.locator('#nextQuestion2').click();

  await expect(page.getByText('Please review your request')).toBeVisible();
  await expect(page.locator('#indicator_selector')).toBeVisible();

  await page.locator('#indicator_selector').selectOption(parallelApproverIndID);

  await page.getByRole('searchbox', { name: 'Search for user to add as' }).fill('t');
  await page.locator('#btn202').click();
  await page.locator('#btn63').click();
  await page.locator('#btn78').click();
  await page.locator('#btn19').click();

   //**Add a check */
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Send Request to Selected' }).click();

  //Verify Report is displayed 
  await expect(page.getByText('Requests have been assigned to these people 4 recordsStop and show results')).toBeVisible();
});