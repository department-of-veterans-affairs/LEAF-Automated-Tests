import { test, expect, Page } from '@playwright/test';

import {
  LEAF_URLS,
  getRandomId,
  createTestForm,
  loadForm,
  loadWorkflow,
  deleteTestFormByFormID,
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
    await page.getByRole('button', { name: 'Save' }).click();

    // Attach workflow to form
    await loadForm(page, formEditorFieldsFormID);
    await page.getByLabel('Workflow: No Workflow. Users').selectOption('5');

    // Add Data field and option to workflow
    await loadWorkflow(page, '5');
    await page.getByRole('button', { name: 'New Step' }).click();
    await page.getByLabel('Step Title:').fill('Step 1');
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Confirm that the Input Form and Delete/Archive options are not available

    // Delete the step from the workflow

    // Delete the form

    // Delete the workflow
    
});