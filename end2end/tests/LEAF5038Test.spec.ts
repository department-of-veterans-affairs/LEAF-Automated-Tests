import { test, expect, Page } from '@playwright/test';

import {
  getRandomId,
  createTestForm,
  loadForm,
  loadWorkflow,
  addFormQuestion
} from '../leaf_test_utils/leaf_util_methods.ts';

const testId = getRandomId();

test('Need to come up with a name', async ({ page }) => {

    // Create the form and add sections
    const formEditorFieldsFormID = await createTestForm(page, `form_name_${testId}`, `form_descr_${testId}`);
    const personSectionID = await addFormQuestion(page, 'Add Section', 'Assigned Person', 'Orgchart Employee');
    const groupSectionID = await addFormQuestion(page, 'Add Section', 'Assigned Group', 'Orgchart Group');
    const textSectionID = await addFormQuestion(page, 'Add Section', 'Single line text', 'Single line text');

    // Create workflow
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=1');

    const workflowName = `workflow_name_${testId}`;
    await page.getByRole('button', { name: 'New Workflow' }).click();
    await page.getByLabel('Workflow Title:').fill(workflowName);
    const saveButton = await page.getByRole('button', { name: 'Save' });
    await saveButton.click();

    // Attach workflow to form
    await loadForm(page, formEditorFieldsFormID);
    await page.getByLabel('Workflow: No Workflow. Users').selectOption('5');

    // Create Step
    await loadWorkflow(page, '5');
    await page.getByRole('button', { name: 'New Step' }).click();

    const stepTitle = "Step 1";
    await page.getByLabel('Step Title:').fill(stepTitle);
    saveButton.click();

    const stepElement = page.getByLabel(`workflow step: ${stepTitle}`, { exact: true });
    await expect(stepElement).toBeInViewport();

    // Hover over the new step and drag it to the desired position
    await stepElement.hover();
    await page.mouse.down();
    await page.mouse.move(300, 300);
    await page.mouse.up();

    // Locate connectors and drag them to connect steps
    const stepConnector = page.locator('.jtk-endpoint').nth(0);
    const requestorConnector = page.locator('.jtk-endpoint').nth(1);
    const endConnector = page.locator('.jtk-endpoint').nth(2);

    await requestorConnector.dragTo(stepConnector);
    await expect(page.getByText('Submit')).toBeInViewport();

    await stepConnector.dragTo(endConnector);

    // Wait for the "Create New Workflow Action" dialog and save the action
    const actionDialog = page.locator('span.ui-dialog-title:has-text("Create New Workflow Action")');
    await expect(actionDialog).toBeVisible();  

    // Save the workflow action and verify its visibility
    await saveButton.click();
    await expect(page.getByText('Approve')).toBeInViewport();

     // Add Data field and option to workflow
    stepElement.click();
    await page.getByRole('button', { name: 'Add Requirement' }).click();
    await page.getByLabel('Add requirement to a workflow').locator('a').click();
    await page.getByRole('option', { name: 'Person Designated by the' }).click();
    saveButton.click();

    await page.getByRole('button', { name: 'Set Data Field' }).click();
    saveButton.click();
    
    stepElement.click();
    await page.getByLabel('Form Field:').selectOption('56');
    stepElement.click();
    

    // Confirm that the Input Form and Delete/Archive options are not available

    // Delete the step from the workflow

    // Delete the form

    // Delete the workflow
    
});