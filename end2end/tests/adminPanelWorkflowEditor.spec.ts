import { test, expect } from '@playwright/test';

test('Create a new workflow and add step', async ({ page }) => {
    // Generate unique workflow title
    const workflowTitle = `New_Workflow_${Math.floor(Math.random() * 10000)}`;

    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=1');

    await page.locator('#btn_newWorkflow').click();

    // Wait for the "Create new workflow" dialog to be visible
    const workflowCreateDialog = page.locator('span.ui-dialog-title:has-text("Create new workflow")');
    await expect(workflowCreateDialog).toBeVisible();

    await page.locator('#description').fill(workflowTitle);

    const saveButton = page.locator('#button_save');
    await saveButton.click();

    // Assert that the newly created workflow is visible
    await expect(page.locator('a').filter({ hasText: workflowTitle })).toBeVisible();

    // Create a new step
    await page.locator('#btn_createStep').click();

    // Wait for the "Create new Step" dialog to be visible
    const stepCreateDialog = page.locator('span.ui-dialog-title:has-text("Create new Step")');
    await expect(stepCreateDialog).toBeVisible();

    const stepTitle = 'step1';
    await page.locator('#stepTitle').fill(stepTitle);
    await saveButton.click();

    // Verify that the new step is visible
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
});

test('Rename workflow', async ({ page }) => {
    // Generate unique workflow title
    const initialWorkflowTitle = `New_Workflow_${Math.floor(Math.random() * 10000)}`;
    const updatedWorkflowTitle = `Updated_Workflow_${Math.floor(Math.random() * 10000)}`;

    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=1');

    await page.locator('#btn_newWorkflow').click();

    // Wait for the "Create new workflow" dialog to be visible
    const workflowCreateDialog = page.locator('span.ui-dialog-title:has-text("Create new workflow")');
    await expect(workflowCreateDialog).toBeVisible();

    await page.locator('#description').fill(initialWorkflowTitle);

    const saveButton = page.locator('#button_save');
    await saveButton.click();

    // Assert that the newly created workflow is visible
    await expect(page.locator('a').filter({ hasText: initialWorkflowTitle })).toBeVisible();

    // Click on the 'Rename Workflow' button
    await page.locator('#btn_renameWorkflow').click();

    // Wait for the "Rename Workflow" dialog to be visible
    const renameWorkflowDialog = page.locator('span.ui-dialog-title:has-text("Rename Workflow")');
    await expect(renameWorkflowDialog).toBeVisible();

    // Fill in the new workflow name
    const renameInput = page.locator('#workflow_rename');
    await renameInput.fill(updatedWorkflowTitle);
    await saveButton.click();

    // Assert that the renamed workflow is visible
    await expect(page.locator('a').filter({ hasText: updatedWorkflowTitle })).toBeVisible();
});

test('View workflow history', async ({ page }) => {
    // Generate unique workflow title
    const workflowTitle = `New_Workflow_${Math.floor(Math.random() * 10000)}`;

    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=1');

    await page.locator('#btn_newWorkflow').click();

    // Wait for the "Create new workflow" dialog to be visible
    const workflowCreateDialog = page.locator('span.ui-dialog-title:has-text("Create new workflow")');
    await expect(workflowCreateDialog).toBeVisible();

    await page.locator('#description').fill(workflowTitle);

    const saveButton = page.locator('#button_save');
    await saveButton.click();

    // Assert that the newly created workflow is visible
    await expect(page.locator('a').filter({ hasText: workflowTitle })).toBeVisible();

    await page.locator('#btn_viewHistory').click();

    // Wait for the Workflow History dialog to become visible
    const workflowHistoryDialog = page.locator('span.ui-dialog-title:has-text("Workflow History")');
    await expect(workflowHistoryDialog).toBeVisible();

    // Verify if the new workflow name appears in the history
    await expect(page.locator('#historyName')).toContainText(workflowTitle);
});

test('Copy workflow', async ({ page }) => {
    // Generate unique workflow title for original and copied workflow
    const originalWorkflowTitle = `New_Workflow_${Math.floor(Math.random() * 10000)}`;
    const copiedWorkflowTitle = `Copy_of_${originalWorkflowTitle}`;

    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=1');

    // Click on the 'Create new workflow' button to open the workflow creation dialog
    await page.locator('#btn_newWorkflow').click();

    // Wait for the "Create new workflow" dialog to be visible
    const workflowCreateDialog = page.locator('span.ui-dialog-title:has-text("Create new workflow")');
    await expect(workflowCreateDialog).toBeVisible();
    await page.locator('#description').fill(originalWorkflowTitle);

    // Save the new workflow and assert its visibility
    const saveButton = page.locator('#button_save');
    await saveButton.click();
    await expect(page.locator('a').filter({ hasText: originalWorkflowTitle })).toBeVisible();

    const requestorConnector = page.locator('.jtk-endpoint').nth(0);
    const endConnector = page.locator('.jtk-endpoint').nth(1);

    await requestorConnector.dragTo(endConnector);
    await expect(page.getByText('Submit')).toBeInViewport();

    // Click the 'Copy Workflow' button to start the copy process
    await page.reload();
    const copyWorkflowButton = page.locator('#btn_duplicateWorkflow');
    await expect(copyWorkflowButton).toBeVisible();
    await copyWorkflowButton.click();

    // Wait for the "Duplicate Workflow" dialog to appear
    const duplicateWorkflowDialog = page.locator('span.ui-dialog-title:has-text("Duplicate current workflow")');
    await expect(duplicateWorkflowDialog).toBeVisible();
    await page.locator('#description').fill(copiedWorkflowTitle);

    // Confirm that the copied workflow appears in the list
    await saveButton.click();
    await expect(page.locator('a').filter({ hasText: copiedWorkflowTitle })).toBeVisible();
});
