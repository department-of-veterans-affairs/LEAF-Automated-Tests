import { test, expect, Page } from '@playwright/test';

import {
  getRandomId,
  createTestForm,
  loadForm,
  loadWorkflow,
  addFormQuestion,
  deleteTestFormByFormID,
  createBaseTestWorkflow
} from '../leaf_test_utils/leaf_util_methods.ts';

const testId = getRandomId();

test('Elements attached to a workflow cannot be deleted from form', async ({ page }) => {

    // Create the form and add sections
    const formEditorFieldsFormID = await createTestForm(page, `form_name_${testId}`, `form_descr_${testId}`);
    const personSectionID = await addFormQuestion(page, 'Add Section', 'Assigned Person', 'Orgchart Employee');
    const groupSectionID = await addFormQuestion(page, 'Add Section', 'Assigned Group', 'Orgchart Group');
    const textSectionID = await addFormQuestion(page, 'Add Section', 'Single line text', 'Single line text');

    // Create workflow
    const workflowName = `workflow_name_${testId}`;
    const stepTitle = "Step 1";
    const workflowAndStepIDs = await createBaseTestWorkflow(page, workflowName, stepTitle);
    const workflowID = workflowAndStepIDs[0];
    console.log("The workflow ID is " + workflowID);

    // Attach workflow to form
    await loadForm(page, formEditorFieldsFormID);
    await page.getByLabel('Workflow: No Workflow. Users').selectOption(workflowID);

    // Go back to the workflow
    await loadWorkflow(page, workflowID);
    const stepElement = page.getByLabel(`workflow step: ${stepTitle}`, { exact: true });
    await expect(stepElement).toBeVisible();
    stepElement.click();

    // Add Person designated requirement
    const addRequirement = await page.getByRole('button', { name: 'Add Requirement' });
    await expect(addRequirement).toBeVisible()
    await addRequirement.click();

    await page.getByLabel('Add requirement to a workflow').locator('a').click();
    await page.getByRole('option', { name: 'Person Designated by the' }).click();
    
    const saveButton = await page.getByRole('button', { name: 'Save' });
    saveButton.click();

    // Set the Available Person data field
    const setDataField = await page.getByRole('button', { name: 'Set Data Field' });
    await expect(setDataField).toBeVisible();
    setDataField.click();

    await expect(page.getByText('Set Indicator ID')).toBeVisible();
    await page.locator('#indicatorID').selectOption('54');
    await saveButton.click();
    await expect(stepElement).toBeVisible();

    // Set the Single Line Text form field
    await stepElement.click();
    await page.getByLabel('Form Field:').selectOption('56');
    await stepElement.click();
    
    // Confirm that the Input Form and Delete/Archive options are not available on Assigned Person
    await loadForm(page, formEditorFieldsFormID);
    await expect(page.getByText('Assigned Person')).toBeVisible();
    await page.getByTitle('edit indicator 54').click();
    await expect(page.locator('#input-format')).toContainText('This field is used in a workflow and must be removed from there before you can change its format.');
    await expect(page.locator('#indicator-editing-attributes')).toContainText('This field is used in a workflow and must be removed from there before you can Archive or Delete it.');
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Confirm the Archive and Delete are not available on the Single Line Text
    await page.getByTitle('edit indicator 56').click();
    await expect(page.locator('#indicator-editing-attributes')).toContainText('This field is used in a workflow and must be removed from there before you can Archive or Delete it.');
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Confirm the Archive/Delete and Input Dropdown are avaiable on the Assigned Group
    await page.getByTitle('edit indicator 55').click();
    await expect(page.getByText('Input Format')).toBeVisible();
    await expect(page.getByText('Archive', { exact: true })).toBeVisible();
    await expect(page.getByText('Delete', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Delete the step from the workflow
    await loadWorkflow(page, workflowID);
    await expect(stepElement).toBeVisible();
    stepElement.click();

    await expect(page.locator('#stepInfo_10').getByText('Step 1')).toBeVisible();
    await page.getByLabel('Remove Step').click();
    await page.getByRole('button', { name: 'Yes' }).click();
    await expect(stepElement).not.toBeVisible();

    // Delete the form
    await deleteTestFormByFormID(page, formEditorFieldsFormID);

    // Delete the workflow
    await loadWorkflow(page, workflowID);
    await page.getByRole('button', { name: 'Delete Workflow' }).click();
    await page.getByRole('button', { name: 'Yes' }).click();
    
});