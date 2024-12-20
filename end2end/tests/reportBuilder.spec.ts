import { test, expect } from '@playwright/test';

// When the underlying issue is fixed, we should expect this test to pass.
// Tests should be tagged with an associated ticket or PR reference
test('column order is maintained after modifying the search filter', async ({ page }, testInfo) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJBghmXEAGhDQDsM0BjfAeygEkARbAVmJFoAdo6psAPBxj4qAC2wBOAAyyOAc3wRsAQQByLAL5F0WRDggAbCJCwluvMPWwBeYaImJpJRZFUaQmgLokAVrXIEFB8QOHowJGBtEHkTJnxCFBAAFg4ARjSOdhDDNBg0CMQ02WcQXPywAHkAM2q4EyRpTSA%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAgBZmtBvjABZAK4kiAAhLQyy5GQAeHam3Qc8ARl79YCFBhwzjxyfUatoAc3Kr1mnXtbt8AJjNICyFrUTAAVgdpAgA5eQZ0BGYDIwBmbgBdIA%3D%3D&sort=N4Ig1gpgniBcIFYQBoQHsBOATCG4hwGcBjEAXyA%3D');

  await expect(page.getByLabel('Sort by Numeric')).toBeInViewport();
  await expect(page.locator('th').nth(4)).toContainText('Numeric');

  // Screenshot the original state
  let screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
  const modifyButton = page.getByRole('button', { name: 'Modify Search' });
  await modifyButton.click();

  const textArea = page.getByLabel('text', { exact: true });
  await textArea.waitFor();
  await textArea.fill('8000');

  const nextStepButton = page.getByRole('button', { name: 'Next Step' });
  await nextStepButton.click();

  // step 2
  const selectDataColumns = page.locator('#step_2');
  await selectDataColumns.waitFor();

  const generateReportButton = page.getByRole('button', { name: 'Generate Report' });
  await generateReportButton.click();

  // results 
  const results  = page.locator('#results');
  await results.waitFor({state: 'visible'});

  await page.reload();

  const numericHeaderColumn = page.getByLabel('Sort by Numeric');
  await numericHeaderColumn.waitFor();
  await expect(numericHeaderColumn).toBeInViewport();

  // Screenshot the new state. The column order should be the same.
  screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
  await expect(page.locator('th').nth(4)).toContainText('Numeric');
});

test('Selected columns are added in the search results', async ({ page }) => {
  await page.goto("https://host.docker.internal/Test_Request_Portal/");
  const reportBuilderButton = page.locator('//span[text()="Report Builder"]');
  await expect(reportBuilderButton).toBeVisible();
  await reportBuilderButton.click();

  // step 1
  const developSearchFilter = page.locator('#step_1');
  await developSearchFilter.waitFor();
  const nextButton = page.getByRole('button', { name: 'Next Step' });
  await expect(nextButton).toBeVisible();
  await nextButton.click();

  // step 2
  const selectDataColumns = page.locator('#step_2');
  await selectDataColumns.waitFor();

  // select service, current status and type of request checkbox
  const serviceCheckbox = page.locator('label[for="indicators_service"]');
  await serviceCheckbox.click();
  await expect(serviceCheckbox).toBeChecked();

  const currentStatusCheckbox = page.locator('label[for="indicators_status"]');
  await currentStatusCheckbox.click();
  await expect(currentStatusCheckbox).toBeChecked();

  const typeOfRequestCheckbox = page.locator('label[for="indicators_type"]');
  await typeOfRequestCheckbox.click();
  await expect(typeOfRequestCheckbox).toBeChecked();

  // Generate Report 
  const generateReportButton = page.locator('#generateReport');
  await generateReportButton.click();

  // verify table columns
  const serviceHeader = await page.locator('[aria-label="Sort by Service"]').textContent();
  const currentSatusHeader = await page.locator('[aria-label="Sort by Current Status"]').textContent();
  const typeHeader = await page.locator('[aria-label="Sort by Type"]').textContent();

  expect(serviceHeader).toBe('Service');
  expect(currentSatusHeader).toBe('Current Status');
  expect(typeHeader).toBe('Type');
});

test('Redirect to search filter and Generate Report with Approval History column', async ({ page }) => {
  await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBCAXjJBjoGMALbKCHAoAbAG4Qs5AOZ0I2AIIA5EgF9S6LIhAYIwiJEmVqUOg2xtynMLyQAGabIXKQKgLrkAVhTQA7BChwwOgBXBHJfNDA0UyhFGhg5dxwGMCRgNRBhNBhIpABGW0LyLJywAHkAMwq4fTsVIA%3D%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAi2QoAri2a0G%2BMMzboOeHn0iwEKDDgXRiEHeln1Gi6stU8AukA");

  const modifyButton = page.getByRole('button', { name: 'Modify Search' });
  await modifyButton.waitFor();
  await modifyButton.click();

  // step 1
  const developSearchFilter = page.locator('#step_1');
  await developSearchFilter.waitFor();

  // Choose "Data Field" from "Current Status"
  const currentStatusLink = page.getByRole('cell', { name: 'Current Status' }).locator('a');
  await expect(currentStatusLink).toBeVisible();
  await currentStatusLink.click();

  const dataFieldOption = page.getByRole('option', { name: 'Data Field' });
  await dataFieldOption.waitFor();
  await dataFieldOption.click();

  // Click on the data Field link
  const dataFieldLink = page.locator('a', { hasText: 'Any standard data field' });
  await expect(dataFieldLink).toBeVisible();
  await dataFieldLink.click();

  // Select the role option
  const roleOption = page.getByRole('option', { name: 'LEAF Developer Console: Supervisor' });
  await expect(roleOption).toBeVisible();
  await roleOption.click();

  // Proceed to the next step
  const nextStepButton = page.getByRole('button', { name: 'Next Step' });
  await expect(nextStepButton).toBeVisible();
  await nextStepButton.click();

  // select approval history checkbox
  const approvalhistoryCheckbox = page.locator('label[for="indicators_approval_history"]');
  await approvalhistoryCheckbox.click();
  await expect(approvalhistoryCheckbox).toBeChecked();

  // Generate Report 
  const generateReportButton = page.locator('#generateReport');
  await generateReportButton.click();

  // validate approval history column
  const approvalhistoryHeader = await page.locator('[aria-label="Sort by Approval History"]').textContent();
  expect(approvalhistoryHeader).toBe('Approval History');
});

test('Update and revert report title from pop-up window', async ({ page }) => {
  await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBCAXjJBjoGMALbKCHAoAbAG4Qs5AOZ0I2AIIA5EgF9S6LIhAYIwiJEmVqUOg2xtynMLyQAGabIXKQKgLrkAVhTQA7BChwwOgBXBHJfNDA0UyhFGhg5dxwGMCRgNRBhNBhIpABGW0LyLJywAHkAMwq4fTsVIA%3D%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAi2QoAri2a0G%2BMMzboOeHn0iwEKDDgXRiEHeln1Gi6stU8AukA");

  // Select the first report title
  const initialReportTitle = page.getByRole('cell', { name: 'Available for test case' }).first();
  await initialReportTitle.waitFor();
  await initialReportTitle.click();

  // Edit report title
  const reportTitleInput = page.getByLabel('Report Title');
  await expect(reportTitleInput).toBeVisible();
  await reportTitleInput.fill('Available for test change title');

  // Save changes
  const saveButton = page.getByRole('button', { name: 'Save Change' });
  await saveButton.waitFor();
  await saveButton.click();
  await page.reload();

  // Verify the report title is updated
  const changedReportTitle = page.getByRole('cell', { name: 'Available for test change title' }).first();
  await changedReportTitle.waitFor();
  await expect(changedReportTitle).toHaveText('Available for test change title');
  await changedReportTitle.click();

  // Revert the report title
  await reportTitleInput.fill('Available for test case');
  await saveButton.click();

  await expect(initialReportTitle).toHaveText('Available for test case');
});

test('Navigation to record page on UID link click', async ({ page }) => {
  await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBCAXjJBjoGMALbKCHAoAbAG4Qs5AOZ0I2AIIA5EgF9S6LIhAYIwiJEmVqUOg2xtynMLyQAGabIXKQKgLrkAVhTQA7BChwwOgBXBHJfNDA0UyhFGhg5dxwGMCRgNRBhNBhIpABGW0LyLJywAHkAMwq4fTsVIA%3D%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAi2QoAri2a0G%2BMMzboOeHn0iwEKDDgXRiEHeln1Gi6stU8AukA");

  // UID Link
  const UID = page.getByRole('link', { name: '956' });
  await UID.waitFor();
  await UID.click();

  // Validate the record page opens with the correct UID
  await expect(page.locator('#headerTab')).toContainText('Request #956');
});

test('Update current status to Initiator to generate report with no result', async ({ page }) => {
  await page.goto("https://host.docker.internal/Test_Request_Portal/");
  const reportBuilderButton = page.locator('//span[text()="Report Builder"]');
  await expect(reportBuilderButton).toBeVisible();
  await reportBuilderButton.click();

  // Verify step 1
  const developSearchFilter = page.locator('#step_1');
  await developSearchFilter.waitFor();

  // click "Current Status" and choose "Initiator"
  const currentStatusLink = page.getByRole('cell', { name: 'Current Status' }).locator('a');
  await expect(currentStatusLink).toBeVisible();
  await currentStatusLink.click();

  const initiatorOption = page.getByRole('option', { name: 'Initiator' });
  await expect(initiatorOption).toBeVisible();
  await initiatorOption.click();

  //  Proceed to next step
  const nextButton = page.getByRole('button', { name: 'Next Step' });
  await expect(nextButton).toBeVisible();
  await nextButton.click();

  // Verify step 2
  const selectDataColumns = page.locator('#step_2');
  await selectDataColumns.waitFor();

  // Select "Group Designated" checkbox
  const groupDesignatedCheckbox = page.locator('label[for="indicators_stepID_4"]');
  await groupDesignatedCheckbox.click();
  await expect(groupDesignatedCheckbox).toBeChecked();

  // genrate report
  const generateReportButton = page.locator('#generateReport');
  await generateReportButton.click();

 // Wait for the #reportStats element containing "Loading..." to be hidden
 await page.locator('#reportStats:has-text("Loading...")').waitFor({ state: 'hidden' });

 // Verify number of records displayed in the search results
 await page.locator('#reportStats').waitFor({ state: 'visible' });
 const reportText = await page.locator('#reportStats').textContent();
 expect(reportText).toBe('0 records');
});
