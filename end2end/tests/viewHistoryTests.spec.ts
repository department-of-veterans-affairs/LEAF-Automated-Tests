import { test, expect } from '@playwright/test';
import {
    getRandomId,
    createBaseTestWorkflow, 
    createTestForm,
    addFormQuestion,
    loadWorkflow,
    deleteTestFormByFormID
} from '../leaf_test_utils/leaf_util_methods';

const testId = getRandomId();

test('Changing Form Field appears in Workflow History', async ({ page }) => {

    let formID = '';
    let workflowID = '';
    let stepID = '';

    const workflowName = `workflow_name_${testId}`;
    const stepTitle = "Step 1";
    const stepElement = await page.getByLabel(`workflow step: ${stepTitle}`, { exact: true });

    try {

        // Create workflow with one step
        const workflowAndStepID = await createBaseTestWorkflow(page, workflowName, stepTitle);
        workflowID = workflowAndStepID[0];
        stepID = workflowAndStepID[1];
        await expect(stepElement).toBeVisible();

        // Create form and add a section with a Single line text
        formID = await createTestForm(page, `form_name_${testId}`, `form_descr_${testId}`);
        const textSectionID = await addFormQuestion(page, 'Add Section', 'Single line text', 'Single line text');
        await page.getByLabel('Workflow: No Workflow. Users').selectOption(workflowID);

        // Go back to the workflow
        await loadWorkflow(page, workflowID);
        await expect(stepElement).toBeVisible();

        // Set the Single Line Text form field on the step
        await stepElement.click();
        await page.getByLabel('Form Field:').selectOption(textSectionID);
        await stepElement.click();

        // View History and verify that the form field change is listed
        await page.getByRole('button', { name: 'View History' }).click();
        const historyText = `Tester Tester changed form field to ${textSectionID} in workflow step: ${stepID}`;
        await expect(page.locator('tbody')).toContainText(historyText);
        await page.getByRole('button', { name: 'Close' }).click();

    } finally {
        
        if(workflowID != '') {
            
            if(stepID != '') {

                // If workflow and step were created, delete the step
                await expect(stepElement).toBeVisible();
                await stepElement.click();
                await page.getByLabel('Remove Step').click();
                await page.getByRole('button', { name: 'Yes' }).click();
            }
        }

        if(formID != '') {

            // if the form was created, delete the form
            await deleteTestFormByFormID(page, formID);
        }
        
        if(workflowID != '') {

            // If the workflow was created, delete it
            await loadWorkflow(page, workflowID);
            await page.getByRole('button', { name: 'Delete Workflow' }).click();
            await page.getByRole('button', { name: 'Yes' }).click();
        }
        
    }
    
});