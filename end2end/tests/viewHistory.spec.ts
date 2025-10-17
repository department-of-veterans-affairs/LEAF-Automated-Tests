import { test, expect } from '@playwright/test';
import {
    getRandomId,
    createBaseTestWorkflow, 
    createTestForm,
    addFormQuestion,
    loadWorkflow
} from '../leaf_test_utils/leaf_util_methods';


const testId = getRandomId();

test('Changing Form Field appears in Workflow History', async ({ page }) => {

    const workflowName = `workflow_name_${testId}`;
    const stepTitle = "Step 1";
    const stepElement = await page.getByLabel(`workflow step: ${stepTitle}`, { exact: true });

    const workflowAndStepID = await createBaseTestWorkflow(page, workflowName, stepTitle);
    const workflowID = workflowAndStepID[0];
    console.log("The workflowID is " + workflowID);
    const stepID = workflowAndStepID[1];
    console.log("The stepID is " + stepID);
    await expect(stepElement).toBeVisible();
    //await stepElement.click();

    const formID = await createTestForm(page, `form_name_${testId}`, `form_descr_${testId}`);
    const textSectionID = await addFormQuestion(page, 'Add Section', 'Single line text', 'Single line text');
    console.log("The textSectionID is " + textSectionID);
    await page.getByLabel('Workflow: No Workflow. Users').selectOption(workflowID);

    // Go back to the workflow
    await loadWorkflow(page, workflowID);
    await expect(stepElement).toBeVisible();
    //await stepElement.click();

    // Set the Single Line Text form field
    await stepElement.click();
    await page.getByLabel('Form Field:').selectOption(textSectionID);
    await stepElement.click();

    await page.getByRole('button', { name: 'View History' }).click();
    const historyText = `Tester Tester changed form field to ${textSectionID} in workflow step: ${stepID}`;
    await expect(page.locator('tbody')).toContainText(historyText);
    await page.getByRole('button', { name: 'Close' }).click();

    
});