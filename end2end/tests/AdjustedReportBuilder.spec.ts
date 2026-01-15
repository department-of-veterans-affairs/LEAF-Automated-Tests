import { test, expect } from '@playwright/test';
import {
  LEAF_URLS,
  createTestRequest,
  getRandomId,
  selectChosenDropdownOption
} from '../leaf_test_utils/leaf_util_methods';


test('Comment approval functionality and comment visibility on record page', async ({ page }) => {
  const testId = getRandomId();
  const testComment = `testing purpose ${testId}`;
  const requestTitle = `test request ${testId}`;

  //create and submit a request to move it to an actionable step where approval/comments will be made
  const testRequestID = await createTestRequest(page, 'Cotton Computers', requestTitle, 'Simple Form');
  await page.getByLabel('single line text').fill(`test entry ${testId}`);
  await page.getByRole('button', { name: 'Next Question' }).first().click();
  await expect(page.getByRole('button', { name: 'Submit Request' })).toBeVisible();
  const awaitSubmit = page.waitForResponse(res => 
    res.url().includes(`form/${testRequestID}/submit`) && res.status() === 200
  );
  await page.getByRole('button', { name: 'Submit Request' }).click();
  await awaitSubmit;

  await page.goto(LEAF_URLS.REPORT_BUILDER);
  await expect(page.getByRole('button', { name: 'Next Step' })).toBeVisible();
  const selectLocator = page.locator('table[id$="_searchTerms"] tr td select').first();
  const selectID = await selectLocator.getAttribute('id') ?? "";
  const chosenID = `#${selectID}_chosen`;
  await selectChosenDropdownOption(page, chosenID, 'Record ID');
  await page.getByLabel('text', { exact: true }).fill(testRequestID);
  await page.getByRole('button', { name: 'Next Step' }).click();
  await page.locator('label[for="indicators_actionButton"]').click();
  await page.locator('#generateReport').click();

  const row = page.locator('table tr').filter({ hasText: requestTitle });
  const actionBtn = row.getByText('Take Action', { exact: true })
  const expectedNumContainers = 2; //this is the number of requirements on workflow step 1
  let approvedCount = 0;
  let commentsAdded:Array<string> = [];

  for (let i = 0; i < expectedNumContainers; i++) {
    const comment = `test-${i}--${testComment}`;
    const container = page.locator('div[id^="form_dep_container"]').first();
    const awaitActionSuccess = page.waitForResponse(res =>
      res.url().includes(`formWorkflow/${testRequestID}/apply`) && res.status() === 200
    );
    await expect(row).toBeVisible();
    await actionBtn.click();
    await expect(page.locator('.mainform')).toBeVisible(); //there is a form field we need to wait for

    await expect(page.locator('div[id^="form_dep_container"]')).toHaveCount(expectedNumContainers - approvedCount);
    await expect(container.getByRole('button', { name: 'Approve' })).toBeVisible();
    await expect(container.locator('textarea')).toBeVisible();
    await expect(container.getByRole('button', { name: 'Approve' })).toBeEnabled();
    await container.locator('textarea').fill(comment);
    await container.getByRole('button', { name: 'Approve' }).click();
    await awaitActionSuccess;
    commentsAdded.push(comment);
    approvedCount++;
    await page.reload();
  }

  await page.goto(LEAF_URLS.PRINTVIEW_REQUEST + testRequestID);
  for (let i = 0; i < commentsAdded.length; i++) {
    await expect(page.locator('#comments')).toContainText(commentsAdded[i]);
  }
});


test('column order is maintained after modifying the search filter', async ({ page }, testInfo) => {
  await page.goto(`${LEAF_URLS.REPORT_BUILDER}&query=N4IgLgpgTgtgziAXAbVASwCZJBghmXEAGhDQDsM0BjfAeygEkARbAVmJFoAdo6psAPBxj4qAC2wBOAAyyOAc3wRsAQQByLAL5F0WRDggAbCJCwluvMPWwBeYaImJpJRZFUaQmgLokAVrXIEFB8QOHowJGBtEHkTJnxCFBAAFg4ARjSOdhDDNBg0CMQ02WcQXPywAHkAM2q4EyRpTSA%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAgBZmtBvjABZAK4kiAAhLQyy5GQAeHam3Qc8ARl79YCFBhwzjxyfUatoAc3Kr1mnXtbt8AJjNICyFrUTAAVgdpAgA5eQZ0BGYDIwBmbgBdIA%3D%3D&sort=N4Ig1gpgniBcIFYQBoQHsBOATCG4hwGcBjEAXyA%3D`);
  await expect(page.locator('table[id^="LeafFormGrid"] tbody tr').first()).toBeVisible();
  await expect(page.getByText("Building report")).toHaveCount(0);

  await expect(page.getByLabel('Sort by Numeric')).toBeInViewport();
  await expect(page.locator('th').nth(4)).toContainText('Numeric');

  let screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
  
  await page.getByRole('button', { name: 'Modify Search' }).click();

  const textArea = page.getByLabel('text', { exact: true });
  await textArea.waitFor();
  await textArea.fill('8000');

  await page.getByRole('button', { name: 'Next Step' }).click();

  const selectDataColumns = page.locator('#step_2');
  await selectDataColumns.waitFor();
  await expect(page.getByLabel('Title of Request')).toBeChecked();
  await page.getByRole('button', { name: 'Generate Report' }).click();
  await expect(page.locator('table[id^="LeafFormGrid"] tbody tr').first()).toBeVisible();
  await expect(page.getByText("Building report")).toHaveCount(0);

  const results = page.locator('#results');
  await results.waitFor({ state: 'visible' });

  await page.reload();
  await expect(page.locator('table[id^="LeafFormGrid"] tbody tr').first()).toBeVisible();
  await expect(page.getByText("Building report")).toHaveCount(0);

  const numericHeaderColumn = page.getByLabel('Sort by Numeric');
  await numericHeaderColumn.waitFor();
  await expect(numericHeaderColumn).toBeInViewport();

  screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
  await expect(page.locator('th').nth(4)).toContainText('Numeric');
});

test('Selected columns are added in the search results', async ({ page }) => {
  await page.goto(LEAF_URLS.PORTAL_HOME);
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
  await page.goto(`${LEAF_URLS.REPORT_BUILDER}&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBCAXjJBjoGMALbKCHAoAbAG4Qs5AOZ0I2AIIA5EgF9S6LIhAYIwiJEmVqUOg2xtynMLyQAGabIXKQKgLrkAVhTQA7BChwwOgBXBHJfNDA0UyhFGhg5dxwGMCRgNRBhNBhIpABGW0LyLJywAHkAMwq4fTsVIA%3D%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAi2QoAri2a0G%2BMMzboOeHn0iwEKDDgXRiEHeln1Gi6stU8AukA`);

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
  const dataFieldLink = page.locator('a span', { hasText: 'Any standard data field' });
  await expect(dataFieldLink).toBeVisible();
  await dataFieldLink.click();

  // Select the role option
  const roleOption = page.locator('ul.chosen-results li.active-result:nth-child(1)').first();
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
  const originalTitle = 'Available for test case';
  const testEditTitle = 'Available for test change title';
  await page.goto(`${LEAF_URLS.REPORT_BUILDER}&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBCAXjJBjoGMALbKCHAoAbAG4Qs5AOZ0I2AIIA5EgF9S6LIhAYIwiJEmVqUOg2xtynMLyQAGabIXKQKgLrkAVhTQA7BChwwOgBXBHJfNDA0UyhFGhg5dxwGMCRgNRBhNBhIpABGW0LyLJywAHkAMwq4fTsVIA%3D%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAi2QoAri2a0G%2BMMzboOeHn0iwEKDDgXRiEHeln1Gi6stU8AukA`);

  // Select the first report title
  const initialReportTitle = page.getByRole('cell', { name: originalTitle }).first();
  await initialReportTitle.waitFor();
  await initialReportTitle.click();

  // Edit report title
  const reportTitleInput = page.getByLabel('Report Title');
  await expect(reportTitleInput).toBeVisible();
  await reportTitleInput.fill(testEditTitle);

  // Save changes
  const saveButton = page.getByRole('button', { name: 'Save Change' });
  await saveButton.waitFor();
  await saveButton.click();
  await page.reload();

  // Verify the report title is updated
  const changedReportTitle = page.getByRole('cell', { name: testEditTitle }).first();
  await changedReportTitle.waitFor();
  await expect(changedReportTitle).toHaveText(testEditTitle);
  await changedReportTitle.click();

  // Revert the report title
  await reportTitleInput.fill(originalTitle);
  await saveButton.click();

  await expect(initialReportTitle).toHaveText(originalTitle);
});


test('Navigation to record page on UID link click', async ({ page }) => {
  await page.goto(`${LEAF_URLS.REPORT_BUILDER}&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBCAXjJBjoGMALbKCHAoAbAG4Qs5AOZ0I2AIIA5EgF9S6LIhAYIwiJEmVqUOg2xtynMLyQAGabIXKQKgLrkAVhTQA7BChwwOgBXBHJfNDA0UyhFGhg5dxwGMCRgNRBhNBhIpABGW0LyLJywAHkAMwq4fTsVIA%3D%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAi2QoAri2a0G%2BMMzboOeHn0iwEKDDgXRiEHeln1Gi6stU8AukA`);

  const UID = page.locator(`a[href='index.php?a=printview&recordID=956']`);
  await UID.waitFor({ state: 'visible' });

  // Wait for navigation to complete
  await Promise.all([
    page.waitForLoadState('load'),
    UID.click()
  ]);

  // Wait for the headerTab element to become visible before asserting text
  const headerTab = page.locator(`#headerTab`);
  await expect(headerTab).toBeVisible();
  expect(await headerTab.innerText()).toContain('Request #956');

});


test('No Requests have empty initiator values', async ({ page }) => {
  await page.goto(LEAF_URLS.PORTAL_HOME);
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
  expect(reportText).toContain('0 records');
});



test('Share Report button is visible on the UI', async ({ page }) => {
  await page.goto(`${LEAF_URLS.REPORT_BUILDER}&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBCAXjJBjoGMALbKCHAoAbAG4Qs5AOZ0I2AIIA5EgF9S6LIhAYIwiJEmVqUOg2xtynMLyQAGabIXKQKgLrkAVhTQA7BChwwOgBXBHccBjAkYDUQYTQYNCjEAEZbdPJ4xLAAeQAzPLh9OxUgA&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAi2QoAri2a0G%2BMMzboOeHn0iwEKDDgWJ4RVFABCk5Giiz6jRdWWqeAXSA%3D`);

  // Ensure 'Share Report' button is visible and clickable before interacting
  const shareReportButton = page.getByRole('button', { name: 'Share Report' });
  await expect(shareReportButton).toBeVisible();
  await shareReportButton.click();

  // Ensure that the 'Email Report' button appears after clicking the 'Share Report' button
  const emailReportButton = page.getByRole('button', { name: 'Email Report' });
  await expect(emailReportButton).toBeVisible();
});

test('Report builder workflow and create row button functionality', async ({ page }) => {
  await page.goto(LEAF_URLS.PORTAL_HOME);

  // Validate and click Report Builder button
  const reportBuilderButton = page.locator('//span[text()="Report Builder"]');
  await expect(reportBuilderButton).toBeVisible();
  await reportBuilderButton.click();

  // Verify step 1
  const developSearchFilter = page.locator('#step_1');
  await developSearchFilter.waitFor();

  // apply filters
  const currentStatusLink = page.getByRole('cell', { name: 'Current Status' }).locator('a');
  await expect(currentStatusLink).toBeVisible();
  await currentStatusLink.click();

  const typeOption = page.getByRole('option', { name: 'Type' });
  await expect(typeOption).toBeVisible();
  await typeOption.click();

  const complexFormLink = page.getByRole('cell').locator('select[aria-label="categories"] + div a');
  await expect(complexFormLink).toBeVisible();
  await complexFormLink.click();

  const generalFormOption = page.getByRole('option', { name: 'General Form' });
  await expect(generalFormOption).toBeVisible();
  await generalFormOption.click();

  // Proceed to next step
  const nextButton = page.getByRole('button', { name: 'Next Step' });
  await expect(nextButton).toBeVisible();
  await nextButton.click();

  // select action button checkbox, type of request checkbox add genral form
  const typeOfRequestCheckbox = page.locator('label[for="indicators_type"]');
  await typeOfRequestCheckbox.click();
  await expect(typeOfRequestCheckbox).toBeChecked();

  const actionButtonCheckbox = page.locator('label[for="indicators_actionButton"]');
  await actionButtonCheckbox.click();
  await expect(actionButtonCheckbox).toBeChecked();

  const generalForm = page.locator('#indicatorList').getByText('General Form');
  await expect(generalForm).toBeVisible();
  await generalForm.click();

  const AssignedPerson = page.getByText('Assigned Person 2')
  await expect(AssignedPerson).toBeVisible();
  await AssignedPerson.click();

  // Generate Report
  const generateReportButton = page.locator('#generateReport');
  await generateReportButton.click();

  // Validate Create Row button visibility
  const createRowButton = page.getByRole('button', { name: 'Create Row' });
  await createRowButton.waitFor();
  await expect(createRowButton).toBeVisible();
  await createRowButton.click();
  await page.reload();

  // Validate that a new row with the title 'untitled' is created
  const newRowTitle = page.locator('//tbody/tr[1]/td[3]');
  await newRowTitle.waitFor({ state: 'visible' });
  await expect(newRowTitle).toContainText('untitled');
});

/**
 *  Test for 4665
 *  Verify that a negative currency is 
 *  allowed to be added to a report
 */
test('Report Allows Negative Currency', async ({ page}) => {
  const formType = 'Input Formats';
  const testId = getRandomId();
  const testRequestID = await createTestRequest(page, 'Cotton Computers', 'validation_' + testId, formType);
  const rowLocator = page.locator(`[data-record-id="${testRequestID}"]`);

  // Create a new report
  await page.goto(LEAF_URLS.PORTAL_HOME);
  await page.getByText('Report Builder Create custom').click();
  await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();
  await page.getByRole('option', { name: 'Type' }).click();

  // Choose reports which use the Input Formats form
  await page.getByRole('cell').locator('select[aria-label="categories"] + div a').click();
  await page.getByRole('option', { name: formType, exact: true }).click();
  await page.getByRole('button', { name: 'Next Step' }).click();
  await page.locator('#indicatorList').getByText(formType, {exact: true} ).click();

  // Choose currency as one of the columns
  await page.getByText('currency', { exact: true }).first().click();
  await page.getByRole('button', { name: 'Generate Report' }).click();
  await rowLocator.click();

  // Input a negative currency 
  await page.getByRole('textbox', { name: 'currency' }).click();
  await page.getByRole('textbox', { name: 'currency' }).fill('-200');
  await page.getByRole('button', { name: 'Save Change' }).click();

  // Verify the negative currency is displayed
  await expect(rowLocator).toContainText('-200.00');
})

test('Hashtag/Pound/number sign in query', async ({ page }) => {
  await page.goto(LEAF_URLS.REPORT_BUILDER);
  await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();
  await page.getByRole('option', { name: 'Data Field' }).click();
  await page.getByRole('cell', { name: 'CONTAINS' }).locator('a').click();
  await page.getByRole('option', { name: '=' }).click();
  await page.getByLabel('text', { exact: true }).click();
  await page.getByLabel('text', { exact: true }).fill('test#203948609130');
  await page.getByRole('button', { name: 'Next Step' }).click();
  await page.getByRole('button', { name: 'Generate Report' }).click();
  await expect(page.locator('#reportStats')).toContainText('0 records');
});
