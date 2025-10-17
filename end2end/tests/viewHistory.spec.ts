import { test, expect } from '@playwright/test';
import {
    LEAF_URLS, 
    getRandomId,
    createBaseTestWorkflow, 
    selectChosenDropdownOption
} from '../leaf_test_utils/leaf_util_methods';


const testId = getRandomId();

test('', async ({ page }) => {

    const workflowName = `workflow_name_${testId}`;
    const stepTitle = "Step 1";
    const stepElement = page.getByLabel(`workflow step: ${stepTitle}`, { exact: true });

    const workflowID = createBaseTestWorkflow(page, workflowName, stepTitle);
    expect(stepElement).toBeVisible();
    stepElement.click();

});