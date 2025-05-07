import { test, expect } from '@playwright/test';

// This test simulates the whole lifecycle of a request which covers: implementation,
// submission, approval, and reporting.
test.describe.configure({ mode: 'serial' });

// Generate unique text to help ensure that fields are being filled correctly.
let randNum = Math.random();
let uniqueText = `Travel ${randNum}`;

test('navigate to Workflow Editor and create a travel workflow', async ({ page }, testInfo) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/');

  await page.getByRole('button', { name: ' Workflow Editor Edit' }).click();

  // wait for async request to finish loading the first workflow
  await expect(page.locator('#workflow_editor')).toBeInViewport();

  // Click on the "New Workflow" button
  await page.getByRole('button', { name: 'New Workflow' }).click();

  // Fill in the Workflow Title
  await page.getByLabel('Workflow Title:').click();
  await page.getByLabel('Workflow Title:').fill(uniqueText);

  // Verify that the save button is visible and click it to save the workflow
  await expect(page.locator('#button_save')).toBeVisible();
  await page.locator('#button_save').click();

  // wait for async request to finish saving
  // Workaround: Since the drag handles can overlap sometimes (maybe due to async rendering
  // in the jsPlumb library?), we'll move the requestor step out of the way first.
  // TODO: fix the workflow editor since end-users might have the same issue
  await expect(page.locator('a').filter({ hasText: uniqueText })).toBeVisible();
  await expect(page.locator('rect').first()).toBeInViewport();

  // Add a new step to the workflow
  await page.getByRole('button', { name: 'New Step' }).click();
  await page.getByLabel('Step Title:').fill('Supervisor Review');

  // Save the step
  await expect(page.locator('#button_save')).toBeVisible();
  await page.locator('#button_save').click();

  // Ensure the newly added step is visible in the workflow editor
  await expect(page.getByLabel('workflow step: Supervisor')).toBeInViewport();

  // move the supervisor step to a typical location
  await page.getByLabel('workflow step: Supervisor').hover();
  await page.mouse.down();
  await page.mouse.move(650, 150);
  await page.mouse.up();

  // reload to workaround element order inconsistency (see above theory)
  await page.reload();

  let supervisorConnector = page.locator('.jtk-endpoint').nth(0);
  let requestorConnector = page.locator('.jtk-endpoint').nth(1);
  let endConnector = page.locator('.jtk-endpoint').nth(2);

  await requestorConnector.dragTo(supervisorConnector);
  await expect(page.getByText('Submit')).toBeInViewport();

  await supervisorConnector.dragTo(requestorConnector);
  await expect(page.getByText('Return to Requestor')).toBeInViewport();

  await supervisorConnector.dragTo(endConnector);
  await expect(endConnector).toBeInViewport();

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Approve')).toBeInViewport();

  // Add requirement to the Supervisor step
  await page.getByLabel('workflow step: Supervisor').click();
  await page.getByRole('button', { name: 'Add Requirement' }).click();
  await page.locator('a').filter({ hasText: 'Group A' }).click();
  await page.getByRole('option', { name: 'Service Chief' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect((page.locator('#step_requirements'))).toBeVisible();
  await expect(page.locator('#step_requirements')).toContainText('Service Chief');

  await expect(page.getByText('Service Chief', { exact: true })).toBeInViewport();
  let screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });

  // hide modal for screenshot
  await page.getByLabel('Close Modal').click();
  await expect(page.getByText('Service Chief', { exact: true })).not.toBeInViewport();
  screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
});

test('navigate to Form Editor and create a travel form', async ({ page }, testInfo) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/');

  // Click on the Form Editor button
  await page.getByRole('button', { name: ' Form Editor Create and' }).click();

  // Click on the "Create Form" button
  await page.getByRole('button', { name: 'Create Form' }).click();

  // Click on the form name field and enter a unique name
  await page.locator('#name').click();
  await page.locator('#name').fill(uniqueText);

  // Save the form
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByLabel('Form name')).toHaveValue(uniqueText);

  // Add a section to the form
  await page.getByRole('button', { name: 'Add Section' }).click();

  // Enter the field name for the question
  await page.getByLabel('Section Heading').click();
  await page.getByLabel('Section Heading').fill('Traveler');

  // Save the sectio
  await page.getByRole('button', { name: 'Save' }).click();

  // Add a question to the section
  await page.getByRole('button', { name: 'Add Question to Section' }).click();

  // Enter the field name for the question
  await page.getByLabel('Field Name').click();
  await page.getByLabel('Field Name').fill('Employee');
  await page.getByLabel('Input Format').selectOption('orgchart_employee');

  // Mark the field as required
  await page.getByText('Required').click();

  // Save the question
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('button', { name: 'Save' })).not.toBeVisible();
  await expect(page.getByText('Employee* Required')).toBeVisible();

  // Link the form to the workflow
  // selectOption only supports exact matches as of Playwright v.1.46, so
  // we need to retrieve the option's value first
  let optionToSelect = await page.locator('option', { hasText: uniqueText }).getAttribute('value');
  if (optionToSelect == null) {
    optionToSelect = '';
  }

  await page.locator('#workflowID').selectOption(optionToSelect);
  expect(page.locator('#workflowID')).toHaveValue(optionToSelect);

  // Publish the form
  let formOptionToSelect = await page.locator('option', { hasText: 'Available' }).getAttribute('value');
  if (formOptionToSelect == null) {
    formOptionToSelect = '';
  }

  await page.locator('#availability').selectOption(formOptionToSelect);
  expect(page.locator('#availability')).toHaveValue("1");

  const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
});

test('navigate to Homepage, create and submit a travel request', async ({ page }, testInfo) => {
  // Navigate to the request portal
  await page.goto('https://host.docker.internal/Test_Request_Portal/');

  // Click on 'New Request' button
  await page.getByText('New Request', { exact: true }).click();

  // Select a service option
  await expect(page.getByRole('cell', { name: 'Select an Option Service' }).locator('a')).toBeInViewport();
  await page.getByRole('cell', { name: 'Select an Option Service' }).locator('a').click();

  await expect(page.getByRole('option', { name: 'Cotton Computers' })).toBeInViewport();
  await page.getByRole('option', { name: 'Cotton Computers' }).click();

  // Fill in the request title
  await expect(page.getByLabel('Title of Request')).toBeVisible();
  await page.getByLabel('Title of Request').click();
  await page.getByLabel('Title of Request').fill('e2e travel request');
  await page.locator('label').filter({ hasText: uniqueText }).locator('span').click();

  // Proceed to the next step
  await expect(page.getByRole('button', { name: 'Click here to Proceed' })).toBeVisible();
  await page.getByRole('button', { name: 'Click here to Proceed' }).click();

  // Search and select a user
  await expect(page.getByLabel('Search for user to add as')).toBeVisible();
  await page.getByLabel('Search for user to add as').click();
  await page.getByLabel('Search for user to add as').fill('a');
  await page.getByRole('cell', { name: 'Altenwerth, Ernest Bernier.' }).click();

  // Wait for async loading to complete
  await expect(page.getByText('*** Loading... ***')).not.toBeVisible();

  // Navigate to the next question
  await page.getByRole('button', { name: 'Next Question', exact: true }).first().click();

  // Verify 'Submit Request' button is visible
  await expect(page.getByRole('button', { name: 'Submit Request' })).toBeInViewport();

  // Submit the request
  await page.getByRole('button', { name: 'Submit Request' }).click();
  await expect(page.getByRole('button', { name: 'Submit Request' })).not.toBeVisible();

  // Verify submission status
  await expect(page.getByText('Pending Service Chief')).toBeInViewport();

  // Capture and attach a screenshot
  const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
});

test('navigate to Inbox, review and approve the travel request', async ({ page }, testInfo) => {
  // Navigate to the request portal
  await page.goto('https://host.docker.internal/Test_Request_Portal/');

  // Open the Inbox review section
  await page.getByText('Inbox Review and apply').click();

  // View the request as an admin
  await page.getByRole('button', { name: 'View as Admin' }).click();

  // Verify the request is present in the inbox
  await expect(page.locator('#inbox')).toContainText(uniqueText);

  // Open the specific request
  await page.getByRole('button', { name: uniqueText }).click();

  // Click on 'Take Action' button
  await page.getByRole('button', { name: 'Take Action' }).click();

  // Approve the request
  await page.getByRole('button', { name: 'Approve' }).click();

  // Ensure 'Take Action' button is no longer visible after approval
  await expect(page.getByRole('button', { name: 'Take Action' })).not.toBeVisible();

  // Capture and attach a screenshot
  const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
});

test('navigate to the travel request and check approval status', async ({ page }, testInfo) => {
  // Navigate to the request portal
  await page.goto('https://host.docker.internal/Test_Request_Portal/');

  // Open the specific travel request
  await page.getByText(uniqueText).click();

  // Verify the approval status
  await expect(page.locator('#workflowbox_lastAction')).toContainText('Service Chief: Approved');

  // Ensure the approval status is visible in the viewport
  await expect(page.getByText('Service Chief: Approved')).toBeInViewport();

  // Capture and attach a screenshot
  const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
});

test('navigate to the Report Builder, find the travel request, and check status', async ({ page }, testInfo) => {
  // Navigate to the request portal
  await page.goto('https://host.docker.internal/Test_Request_Portal/');

  // Open the Report Builder
  await page.getByText('Report Builder').click();

  // Click on the "Current Status" link
  await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();

  // Select the "Type" option
  await page.getByRole('option', { name: 'Type' }).click();

  // After clicking Type, we should expect the dropdown containing "Resolved" to be replaced
  await expect(page.getByRole('cell', { name: 'Resolved' }).locator('a')).not.toBeVisible();

  // Select "Complex Form" from the list
  await page.locator('td').nth(4).click();

  // The list might be very long, so search for it
  await page.keyboard.type(uniqueText);
  // Choose the specific travel request
  await page.getByRole('option', { name: uniqueText }).click();

  // Proceed to the next step
  await page.getByRole('button', { name: 'Next Step' }).click();

  // Open the status indicator list
  await page.locator('#indicatorList').getByText('Current Status').click();
  await page.locator('#indicatorList').getByText(uniqueText, { exact: true }).click();

  // Verify the request details are visible
  await expect(page.locator('.formLabel').getByText(uniqueText)).toBeInViewport();

  /* TODO: Find a working locator for selecting "Employee" in the middle column
           and verify the correct employee appears in the view.
           May require retrieving the indicatorID from an earlier step.
  */

  // Generate the report
  await page.getByRole('button', { name: 'Generate Report' }).click();

  // Confirm the approval status is visible
  await expect(page.getByRole('cell', { name: 'Approved' })).toBeInViewport();

  // Capture and attach a screenshot
  const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
});
