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
    await page.getByRole('button', { name: 'Modify Search' }).click();
    await page.getByLabel('text', { exact: true }).click();
    await page.getByLabel('text', { exact: true }).fill('8000');
    await page.getByRole('button', { name: 'Next Step' }).click();
    await expect(page.getByText('Develop search filter')).not.toBeInViewport();
    await page.getByRole('button', { name: 'Generate Report' }).click();
    await expect(page.getByText('Select Data Columns')).not.toBeInViewport();

    // this is not necessary, but it makes the screenshot look cleaner
    await expect(page.getByRole('button', { name: 'Generate Report' })).not.toBeInViewport();
    await expect(page.getByLabel('Sort by Numeric')).toBeInViewport();

    // Screenshot the new state. The column order should be the same.
    screenshot = await page.screenshot();
    await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
    await expect(page.locator('th').nth(5)).toContainText('Numeric');
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

test('Comment approval functionality and comment visibility on record page', async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBCAXjJBjoGMALbKCHAoAbAG4Qs5AOZ0I2AIIA5EgF9S6LIhAYIwiJEmVqUOg2xtynMLyQAGabIXKQKgLrkAVhTQA7BChwwOgBXBHccBjAkYDUQYTQYNCjEAEZbdPJ4xLAAeQAzPLh9OxUgA&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAi2QoAri2a0G%2BMMzboOeHn0iwEKDDgWJ4RVFABCk5Giiz6jRdWWqeAXSA%3D");

    // get UID from the first row of the table
    const UID = await page.locator('//table/tbody/tr[1]//a').textContent();

    // take Action Button
    const takeActionButton = page.locator('//tbody/tr[1]//div');
    await takeActionButton.waitFor();
    await takeActionButton.click();

    // Validate form is visible for the specific UID
    const validateForm = page.getByText(`Apply Action to #${UID}`);
    await expect(validateForm).toBeVisible();

    // add approval comment
    const commentInput = page.locator('textarea[aria-label="comment text area"]').nth(0);
    await commentInput.waitFor();
    await commentInput.fill('testing purpose');

    // approve button
    const approveButton = page.getByRole('button', {name: 'Approve'}).nth(0)
    await approveButton.waitFor();
    await approveButton.click();

    // navigate to same UID record page
    await page.goto(`https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=${UID}`);

    // validate added comment visible on the record page
    await page.reload();
    const comment = page.locator('#workflowbox_lastAction');
    await comment.waitFor({ state: 'visible' });
    await expect(comment).toContainText('testing purpose');
});

test('Share Report button is visible on the UI', async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBCAXjJBjoGMALbKCHAoAbAG4Qs5AOZ0I2AIIA5EgF9S6LIhAYIwiJEmVqUOg2xtynMLyQAGabIXKQKgLrkAVhTQA7BChwwOgBXBHccBjAkYDUQYTQYNCjEAEZbdPJ4xLAAeQAzPLh9OxUgA&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAi2QoAri2a0G%2BMMzboOeHn0iwEKDDgWJ4RVFABCk5Giiz6jRdWWqeAXSA%3D");

    // Ensure 'Share Report' button is visible and clickable before interacting
    const shareReportButton = page.getByRole('button', { name: 'Share Report' });
    await expect(shareReportButton).toBeVisible();
    await shareReportButton.click();

    // Ensure that the 'Email Report' button appears after clicking the 'Share Report' button
    const emailReportButton = page.getByRole('button', { name: 'Email Report' });
    await expect(emailReportButton).toBeVisible();
});

test('Shorten And Expand Link Button Functionality After JSON Button Click', async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBCAXjJBjoGMALbKCHAoAbAG4Qs5AOZ0I2AIIA5EgF9S6LIhAYIwiJEmVqUOg2xtynMLyQAGabIXKQKgLrkAVhTQA7BChwwOgBXBHccBjAkYDUQYTQYNCjEAEZbdPJ4xLAAeQAzPLh9OxUgA&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAi2QoAri2a0G%2BMMzboOeHn0iwEKDDgWJ4RVFABCk5Giiz6jRdWWqeAXSA%3D");

    // Click the JSON button and validate the action
    const jsonButton = page.getByRole('button', { name: 'JSON' });
    await jsonButton.waitFor();
    await jsonButton.click();
    await expect(page.getByText('This provides a live data source for custom dashboards or automated programs')).toBeVisible();

    // Validate that the 'Shorten Link' button is visible
    const shortenLinkButton = page.getByRole('button', { name: 'Shorten Link' });
    await expect(shortenLinkButton).toBeVisible();
    await shortenLinkButton.click();

    // add timeout to complete the backend process
    await page.waitForTimeout(2000);

    // Validate shortened link text
    const shortenLink = await page.locator('#exportPath').textContent();
    expect(shortenLink).toMatch(/^https:\/\/host\.docker\.internal\/Test_Request_Portal\/api\/open\/form\/query\/_32wm[\w]+/);

    // Validate that the 'Expand Link' button is visible
    const expandLinkButton = page.getByRole('button', { name: 'Expand Link' });
    await expect(expandLinkButton).toBeVisible();
    await expandLinkButton.click();

    // Validate expand link text
    const expandLink = await page.locator('#exportPath').textContent();
    expect(expandLink).toMatch(/^https:\/\/host\.docker\.internal\/Test_Request_Portal\/api\/form\/query\/\?q=\{"terms":\[\{"id":"stepID","operator":"!=","match":"resolved","gate":"AND"\},\{"id":"deleted","operator":"=","match":0,"gate":"AND"\}\],"joins":\["status"\],"sort":\{\}\}&x-filterData=recordID,title,stepTitle,lastStatus/);

    // Validate that the 'Close' button is visible
    const closeButton = page.getByRole('button', { name: 'Close' });
    await expect(closeButton).toBeVisible();
    await closeButton.click();
});

test('Report builder workflow and create row button functionality', async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/")

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

    const complexFormLink = page.getByRole('cell', { name: 'Complex Form' }).locator('a');
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

test('AND Logical Filter operators to generate report', async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3");

    const firstConditionOperator = page.getByRole('cell', { name: 'IS NOT' }).nth(0).locator('a');
    await expect(firstConditionOperator).toBeVisible();
    await firstConditionOperator.click();
    const IsOption = page.getByRole('option', { name: 'IS', exact: true });
    await expect(IsOption).toBeVisible();
    await IsOption.click();

    // Add a logical "AND" filter
    const addAndFilterButton = page.getByLabel('add logical and filter');
    await expect(addAndFilterButton).toBeVisible();
    await addAndFilterButton.click();

    await page.getByRole('cell', { name: 'Current Status', exact: true }).nth(1).locator('a').click();
    const typeOption = page.getByRole('option', { name: 'Type' }).last();
    await expect(typeOption).toBeVisible();
    await typeOption.click();

    const complexFormCell = page.getByRole('cell', { name: 'Complex Form' }).nth(0).locator('a');
    await expect(complexFormCell).toBeVisible();
    await complexFormCell.click();
    const generalFormOption = page.getByRole('option', { name: 'General Form' }).last();
    await expect(generalFormOption).toBeVisible();
    await generalFormOption.click()

    // Process to step 2
    const nextButton = page.getByRole('button', { name: 'Next Step' });
    await expect(nextButton).toBeVisible();
    await nextButton.click();

    // Verify step 2
    const selectDataColumns = page.locator('#step_2');
    await selectDataColumns.waitFor();

    // Generate Report 
    const generateReportButton = page.locator('#generateReport');
    await generateReportButton.click();

    // Wait for the #reportStats element containing "Loading..." to be hidden
    await page.locator('#reportStats:has-text("Loading...")').waitFor({ state: 'hidden' });

    // Verify number of records displayed in the search results
    await page.locator('#reportStats').waitFor({ state: 'visible' });
    const reportText = await page.locator('#reportStats').textContent();
    expect(reportText).toContain('2 records');
});

test('User can change multi-line text and revert changes', async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBeMkGOgYwAtsoI4KAGwBuELOQDmdCNgCCAORIBfUuiyIQHaRIYBPYqyq16jDS3Lsw3bADMGMAPoBWCDQAMAdlZTIcxSBU1bAwIQQhIcUpqKDoGZlZLa0Q3SWk%2FZQBdcgArCjQAOwQUEAK0MDRYqHkaGBksnAYwJGAVEAlwojoaJGQQABZWL3IAZhB6wTQYMqQARjd58gmpsAB5Gxs4cKQ3JSA%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAtGIQUGZrQb4wzNug54efSLARSR8xPCKooAIQCuyNFBn1GC6kpVr%2BmoRhzyALFbkEAsiZJEAAQk0GSByGQAHhx27Fy8ToLabgQA7F42AEqIcKiKcaoJGknCKWAAzBnyAMrQAObkwaHhUTGsBTwAukA");

    // Locate and click the first text cell
    const firstText = page.getByRole("cell", { name: "12977", exact: true });
    await firstText.click();

    // Update multi-line text
    const multiLineTextArea = page.getByLabel("Multi line text", { exact: true });
    await multiLineTextArea.click();
    const updatedText = "This is the text";
    await multiLineTextArea.fill(updatedText);

    // Save changes and validate the changes
    const saveButton = page.getByRole("button", { name: "Save Change" })
    await saveButton.click();
    const updatedTextCell = page.getByRole("cell", { name: updatedText });
    await expect(updatedTextCell).toBeVisible();

    // Revert changes
    await updatedTextCell.click();
    await multiLineTextArea.click();
    const revertedText = "12977";
    await multiLineTextArea.fill(revertedText);
    await saveButton.click();

    // Validate reverted text
    await expect(firstText).toBeVisible();
});

test('Multiple filters with logical AND/OR operators to generate report', async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3");

    // Verify step 1
    const developSearchFilter = page.locator('#step_1');
    await developSearchFilter.waitFor();

    // Add AND filter
    const addAndFilter = page.getByLabel('add logical and filter');
    await expect(addAndFilter).toBeVisible();
    await addAndFilter.click();

    // Add OR filter
    const orFilter = page.getByLabel('add logical or filter');
    await expect(orFilter).toBeVisible();
    await orFilter.click();

    // Modify operator of first condition
    const firstConditionOperator = page.getByRole('cell', { name: 'IS NOT' }).nth(0).locator('a');
    await expect(firstConditionOperator).toBeVisible();
    await firstConditionOperator.click();
    const IsOption = page.getByRole('option', { name: 'IS', exact: true });
    await expect(IsOption).toBeVisible();
    await IsOption.click();

    // Modify field of second condition
    await page.getByRole('cell', { name: 'Current Status', exact: true }).nth(1).locator('a').click();
    await page.getByRole('option', { name: 'Service', exact: true }).click();

    // Update second condition
    const serviceDropdowm = page.getByRole('cell', { name: 'AS - Service' }).locator('a');
    await serviceDropdowm.waitFor();
    await serviceDropdowm.click();

    const serviceConcreteElectronics = page.getByRole('option', { name: 'Concrete Electronics' });
    await expect(serviceConcreteElectronics).toBeVisible();
    await serviceConcreteElectronics.click();

    // Modify field of third condition
    await page.getByRole('cell', { name: 'Current Status', exact: true }).nth(1).locator('a').click();
    const typeOption = page.getByRole('option', { name: 'Type' }).nth(1);
    await expect(typeOption).toBeVisible();
    await typeOption.click();

    // Update third condition
    const complexFormCell = page.getByRole('cell', { name: 'Complex Form' }).locator('a');
    await expect(complexFormCell).toBeVisible();
    await complexFormCell.click();
    const generalFormOption = page.getByRole('option', { name: 'General Form' });
    await expect(generalFormOption).toBeVisible();
    await generalFormOption.click();

    // Proceed to next step
    const nextButton = page.getByRole('button', { name: 'Next Step' });
    await expect(nextButton).toBeVisible();
    await nextButton.click();

    // Verify step 2
    const selectDataColumns = page.locator('#step_2');
    await selectDataColumns.waitFor();

    // Generate Report 
    const generateReportButton = page.locator('#generateReport');
    await generateReportButton.click();

    // Wait for the #reportStats element containing "Loading..." to be hidden
    await page.locator('#reportStats:has-text("Loading...")').waitFor({ state: 'hidden' });

    // Verify number of records displayed in the search results
    await page.locator('#reportStats').waitFor({ state: 'visible' });
    const reportText = await page.locator('#reportStats').textContent();
    expect(reportText).toBe('2 records');
});

test('User can change and revert the report title', async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBeMkGOgYwAtsoI4KAGwBuELOQDmdCNgCCAORIBfUuiyIQHaRIYBPYqyq16jDS3Lsw3bADMGMAPoBWCDQAMAdlZTIcxSBU1bAwIQQhIcUpqKDoGZlZLa0Q3SWk%2FZQBdcgArCjQAOwQUEAK0MDRYqHkaGBksnAYwJGAVEAlwojoaJGQQABZWL3IAZhB6wTQYMqQARjd58gmpsAB5Gxs4cKQ3JSA%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAtGIQUGZrQb4wzNug54efSLARSR8xPCKooAIQCuyNFBn1GC6kpVr%2BmoRhzyALFbkEAsiZJEAAQk0GSByGQAHhx27Fy8ToLabgQA7F42AEqIcKiKcaoJGknCKWAAzBnyAMrQAObkwaHhUTGsBTwAukA");

    // Locate and click on the report
    const originalTitleCell = page.getByRole('cell', { name: 'TestFormQuery_GroupClickedApprove' });
    await expect(originalTitleCell).toBeVisible();
    await originalTitleCell.click();

    // Validate report title input field is visible
    const reportTitleField = page.getByLabel('Report Title');
    await expect(reportTitleField).toBeVisible();
    await reportTitleField.click();

    // Edit the report title
    const updatedTitleText = 'TestForm_NonadminCannotCancelOwnSubmittedRecord_new_Title';
    await reportTitleField.click();
    await reportTitleField.fill(updatedTitleText);

    // save button
    const saveButton = page.getByRole('button', { name: 'Save Change' })
    await saveButton.click();

    // Validate updated title
    const updatedTitleCell = page.getByRole('cell', { name: updatedTitleText });
    await updatedTitleCell.waitFor({ state: 'visible' });
    await expect(updatedTitleCell).toHaveText(updatedTitleText);

    await updatedTitleCell.click();
    await reportTitleField.click();

    // Revert the title
    const revertedTitleText = 'TestFormQuery_GroupClickedApprove';
    await reportTitleField.fill(revertedTitleText);
    await saveButton.click();

    // Validate reverted title
    const revertedTitleCell = page.getByRole('cell', { name: revertedTitleText });
    await revertedTitleCell.waitFor({ state: 'visible' });
    await expect(revertedTitleCell).toHaveText(revertedTitleText);

    // Confirm the reverted title cell is visible
    await expect(revertedTitleCell).toBeVisible();
});

test('User can edit and revert changes in single-line text', async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJAVztASQBEQAaEAewAdoBDMCqbAXjJBnoGMALbNgc3oRsAQQByJAL6l0WRCE5D%2BjAJ7E21OgybzW5DmB7YAZoxgB9AKwRaABgDsAodgDyAJRDTZ2DBAA2EJBY5JpQ9IwsbAZGiLbkgpCiEp4AuuQAVhRoAHYIKCD4UABuaJzC5DloYGjhUGK0MMJpBYxgSMDSIPyBRPS0SMggAJxsACxsjuQAzCDNfmgwVUgAjLZr5POLYC7GxvhtsZJAA%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAizLoAbggrVaDfGGZt0HPDz6RYCFBhyLoxCLvTN5jJdRVqN%2FbUL2iwieEVRQAQgFdkaKGfoLZXYuXjtBE30CAE4AhQIAQRYWCABzKDIYAAIAcXRULwAHYNVQzQEdYSiwABY4iwBZLxIiLJJoMizkMgAPDisQ9TCtCKqnAHZ6xQAlRDhUEpthiocRRQBmKYIAZWhU8jaOrt7%2B1kGeAF0gA%3D");

    const initialTextCell = page.getByRole("cell", { name: "4331" });
    await expect(initialTextCell).toBeVisible();
    await initialTextCell.click();

    // validate single line text field is visible
    const singleLineTextField = page.getByLabel('Single line text', { exact: true });
    await expect(singleLineTextField).toBeVisible();
    await singleLineTextField.click();
    await singleLineTextField.fill("This is the single line text");

    // save changes
    const saveButton = page.getByRole('button', { name: 'Save Change' })
    await saveButton.click();

    // Wait for save action to complete and verify the updated text
    const updatedTextCell = page.getByRole("cell", { name: "This is the single line text" });
    await expect(updatedTextCell).toHaveText("This is the single line text");

    // Revert changes and verify the original text is restored
    await updatedTextCell.click();
    await singleLineTextField.click();
    await singleLineTextField.fill("4331");
    await saveButton.click();

    const revertedTextCell = page.getByRole("cell", { name: "4331" });
    await expect(revertedTextCell).toHaveText("4331");
});