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
        const workflowAndStepID = await createBaseTestWorkflow(page, workflowName, stepTitle);
        workflowID = workflowAndStepID[0];
        stepID = workflowAndStepID[1];
        await expect(stepElement).toBeVisible();

        formID = await createTestForm(page, `form_name_${testId}`, `form_descr_${testId}`);
        const textSectionID = await addFormQuestion(page, 'Add Section', 'Single line text', 'Single line text');
        await page.getByLabel('Workflow: No Workflow. Users').selectOption(workflowID);

        // Go back to the workflow
        await loadWorkflow(page, workflowID);
        await expect(stepElement).toBeVisible();

        // Set the Single Line Text form field
        await stepElement.click();
        await page.getByLabel('Form Field:').selectOption(textSectionID);
        await stepElement.click();

        await page.getByRole('button', { name: 'View History' }).click();
        const historyText = `Tester Tester changed form field to ${textSectionID} in workflow step: ${stepID}`;
        await expect(page.locator('tbody')).toContainText(historyText);
        await page.getByRole('button', { name: 'Close' }).click();

    } finally {
        
        if(workflowID != '') {
            
            if(stepID != '') {
                await stepElement.click();
                await page.getByLabel('Remove Step').click();
                await page.getByRole('button', { name: 'Yes' }).click();
            }
        }

        if(formID != '') {
            await deleteTestFormByFormID(page, formID);
        }
        
        if(workflowID != '') {
            await loadWorkflow(page, workflowID);
            await page.getByRole('button', { name: 'Delete Workflow' }).click();
            await page.getByRole('button', { name: 'Yes' }).click();
        }
        
    }
    
});