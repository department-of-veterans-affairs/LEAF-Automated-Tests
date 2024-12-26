import { test, expect } from '@playwright/test';

test('Create a new workflow and add step', async ({ page }) => {
    // Generate unique workflow title
    const workflowTitle = `New_Workflow_${Math.floor(Math.random() * 10000)}`;

    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=1');

    await page.locator('#btn_newWorkflow').click();

    // Wait for the "Create new workflow" dialog to be visible
    const workflowCreateDialog = page.locator('span.ui-dialog-title:has-text("Create new workflow")');
    await workflowCreateDialog.waitFor({ state: 'visible' });

    await page.locator('#description').fill(workflowTitle);

    const saveButton = page.locator('#button_save');
    await saveButton.click();

    // Assert that the newly created workflow is visible
    await expect(page.locator('a').filter({ hasText: workflowTitle })).toBeVisible();

    // Create a new step
    await page.locator('#btn_createStep').click();

    // Wait for the "Create new Step" dialog to be visible
    const stepCreateDialog = page.locator('span.ui-dialog-title:has-text("Create new Step")');
    await stepCreateDialog.waitFor({ state: 'visible' });

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
    await actionDialog.waitFor({ state: 'visible' });

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
    await workflowCreateDialog.waitFor({ state: 'visible' });

    await page.locator('#description').fill(initialWorkflowTitle);

    const saveButton = page.locator('#button_save');
    await saveButton.click();

    // Assert that the newly created workflow is visible
    await expect(page.locator('a').filter({ hasText: initialWorkflowTitle })).toBeVisible();

    // Click on the 'Rename Workflow' button
    await page.locator('#btn_renameWorkflow').click();

    // Wait for the "Rename Workflow" dialog to be visible
    const renameWorkflowDialog = page.locator('span.ui-dialog-title:has-text("Rename Workflow")');
    await renameWorkflowDialog.waitFor({ state: 'visible' });

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
    await workflowCreateDialog.waitFor({ state: 'visible' });

    await page.locator('#description').fill(workflowTitle);

    const saveButton = page.locator('#button_save');
    await saveButton.click();

    // Assert that the newly created workflow is visible
    await expect(page.locator('a').filter({ hasText: workflowTitle })).toBeVisible();

    await page.locator('#btn_viewHistory').click();

    // Wait for the Workflow History dialog to become visible
    const workflowHistoryDialog = page.locator('span.ui-dialog-title:has-text("Workflow History")');
    await workflowHistoryDialog.waitFor({ state: 'visible' });

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
    await workflowCreateDialog.waitFor({ state: 'visible' });
    await page.locator('#description').fill(originalWorkflowTitle);

    // Save the new workflow and assert its visibility
    const saveButton = page.locator('#button_save');
    await saveButton.click();
    await expect(page.locator('a').filter({ hasText: originalWorkflowTitle })).toBeVisible();

    // Create a new step in the workflow
    await page.locator('#btn_createStep').click();

    // Wait for the "Create new Step" dialog to be visible, then create a step
    const stepCreateDialog = page.locator('span.ui-dialog-title:has-text("Create new Step")');
    await stepCreateDialog.waitFor({ state: 'visible' });
    const stepTitle = 'step1';
    await page.locator('#stepTitle').fill(stepTitle);
    await saveButton.click();

    // Verify that the new step is visible
    const stepElement = page.getByLabel(`workflow step: ${stepTitle}`, { exact: true });
    await expect(stepElement).toBeInViewport();

    // Hover over the new step and drag it to a desired position
    await stepElement.hover();
    await page.mouse.down();
    await page.mouse.move(300, 300);
    await page.mouse.up();

    // Connect the steps by dragging connectors
    const stepConnector = page.locator('.jtk-endpoint').nth(0);
    const requestorConnector = page.locator('.jtk-endpoint').nth(1);
    const endConnector = page.locator('.jtk-endpoint').nth(2);

    await requestorConnector.dragTo(stepConnector);
    await expect(page.getByText('Submit')).toBeInViewport();

    await stepConnector.dragTo(endConnector);

    // Wait for the "Create New Workflow Action" dialog and save the action
    const actionDialog = page.locator('span.ui-dialog-title:has-text("Create New Workflow Action")');
    await actionDialog.waitFor({ state: 'visible' });
    await saveButton.click();
    await expect(page.getByText('Approve')).toBeInViewport();

    // Click the 'Duplicate Workflow' button to start the copy process
    await page.locator('#btn_duplicateWorkflow').click();

    // Wait for the "Duplicate Workflow" dialog to appear
    const duplicateWorkflowDialog = page.locator('span.ui-dialog-title:has-text("Duplicate current workflow")');
    await duplicateWorkflowDialog.waitFor({ state: 'visible' });
    await page.locator('#description').fill(copiedWorkflowTitle);

    // Confirm that the copied workflow appears in the list
    await saveButton.click();
    await expect(page.locator('a').filter({ hasText: copiedWorkflowTitle })).toBeVisible();
});

test('Create a new workflow and delete it', async ({ page }) => {
    const uniqueWorkflowName = `New_Workflow_${Math.floor(Math.random() * 10000)}`;

    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=1');

    // Create new workflow
    await page.locator('#btn_newWorkflow').click();
    const workflowCreateDialog = page.locator('span.ui-dialog-title:has-text("Create new workflow")');
    await workflowCreateDialog.waitFor({ state: 'visible' });

    await page.locator('#description').fill(uniqueWorkflowName);
    await page.locator('#button_save').click();

    const workflowsDropdown = page.locator('#workflows_chosen');
    await expect(workflowsDropdown).toContainText(uniqueWorkflowName);

    // Delete the workflow
    await page.locator('#btn_deleteWorkflow').click();
    const confirmationDialog = page.locator('span.ui-dialog-title:has-text("Confirmation required")');
    await confirmationDialog.waitFor({ state: 'visible' });

    // Confirm the deletion
    await page.locator('#confirm_button_save').click();

    // Verify the workflow was deleted
    await expect(workflowsDropdown).not.toContainText(uniqueWorkflowName);
});

test('Edit a step from the choose a step edit dropdown', async ({ page }) => {
    const uniqueWorkflowName = `New_Workflow_${Math.floor(Math.random() * 10000)}`;

    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=1');

    // Create a new workflow
    await page.locator('#btn_newWorkflow').click();
    const workflowCreateDialog = page.locator('span.ui-dialog-title:has-text("Create new workflow")');
    await workflowCreateDialog.waitFor({ state: 'visible' });

    await page.locator('#description').fill(uniqueWorkflowName);
    await page.locator('#button_save').click();

    // Verify the newly created workflow appears in the dropdown
    await expect(page.locator('#workflows_chosen')).toContainText(uniqueWorkflowName);

    // Select a step from the dropdown
    await page.locator('#workflow_steps_chosen').click();
    const requestorOption = page.locator('li[data-option-array-index="1"]');
    await requestorOption.click();

    // Verify the step information section is visible
    const stepInfo = page.locator('#stepInfo_-1');
    await stepInfo.waitFor({ state: 'visible' });

    await page.locator('#toggleManageActions').click();

    // Add an action from the dropdown
    const addActionDropdown = page.locator('#create_route');
    await addActionDropdown.selectOption('0');

    // Verify the "Submit" action is in the viewport
    const submitButton = page.locator('div:has-text("Submit")').nth(1);
    await expect(submitButton).toBeInViewport();
});

test('Create and remove an action between steps', async ({ page }) => {
    const uniqueWorkflowName = `New_Workflow_${Math.floor(Math.random() * 10000)}`;

    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=1');

    // Create a new workflow
    await page.locator('#btn_newWorkflow').click();
    const workflowCreateDialog = page.locator('span.ui-dialog-title:has-text("Create new workflow")');
    await workflowCreateDialog.waitFor({ state: 'visible' });

    await page.locator('#description').fill(uniqueWorkflowName);
    await page.locator('#button_save').click();

    // Verify the newly created workflow appears in the dropdown
    const workflowDropdown = page.locator('#workflows_chosen');
    await expect(workflowDropdown).toContainText(uniqueWorkflowName);

    // Drag connectors to connect steps
    const requestorConnector = page.locator('.jtk-endpoint').nth(0);
    const endConnector = page.locator('.jtk-endpoint').nth(1);
    await requestorConnector.dragTo(endConnector);

    // Verify 'Submit' action appears and click it
    const submitAction = page.getByText('Submit', { exact: true });
    await expect(submitAction).toBeInViewport();
    await submitAction.click();

    // Wait for the action removal dialog and click 'Remove Action'
    const removeActionDialog = page.locator('#stepInfo_-1');
    await removeActionDialog.waitFor({ state: 'visible' });
    await page.locator('button', { hasText: 'Remove Action' }).click();

    // Confirm the action removal
    const confirmationDialog = page.locator('span.ui-dialog-title:has-text("Confirm action removal")');
    await confirmationDialog.waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Yes' }).click();

    // Verify the action is removed and is no longer in the viewport
    await expect(submitAction).not.toBeInViewport();
});

test('Add event to an action', async ({ page }) => {
    const uniqueWorkflowName = `New_Workflow_${Math.floor(Math.random() * 10000)}`;

    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=1');

    // Create a new workflow
    await page.locator('#btn_newWorkflow').click();
    const workflowCreateDialog = page.locator('span.ui-dialog-title:has-text("Create new workflow")');
    await workflowCreateDialog.waitFor({ state: 'visible' });

    await page.locator('#description').fill(uniqueWorkflowName);
    const saveButton = page.locator('#button_save');
    await saveButton.click();

    // Verify the newly created workflow appears in the dropdown
    const workflowDropdown = page.locator('#workflows_chosen');
    await expect(workflowDropdown).toContainText(uniqueWorkflowName);

    // Drag connectors to connect steps
    const requestorConnector = page.locator('.jtk-endpoint').nth(0);
    const endConnector = page.locator('.jtk-endpoint').nth(1);
    await requestorConnector.dragTo(endConnector);

    // Verify 'Submit' action appears and click it
    const submitAction = page.getByText('Submit', { exact: true });
    await expect(submitAction).toBeInViewport();
    await submitAction.click();

    const removeActionDialog = page.locator('#stepInfo_-1');
    await removeActionDialog.waitFor({ state: 'visible' });

    await page.getByRole('button', { name: 'Add Event' }).click();

    const addEventDialog = page.locator('span.ui-dialog-title:has-text("Add Event")');
    await addEventDialog.waitFor({ state: 'visible' });
    await saveButton.click();
    await expect(page.locator('#stepInfo_-1')).toContainText('Email - test edited event description');
});
