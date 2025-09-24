import { test, expect, Page } from '@playwright/test';

test.describe.configure({ mode: 'serial'});

// Generate unique text to help ensure that fields are being filled correctly.
let page: Page;
const newRequestURL = 'https://host.docker.internal/Test_Request_Portal/?a=newform';
const formEditorURL_prefix = 'https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/forms?formID=';

const randNum = Math.random();
const testFormName = `lifecycle ${randNum}`;
const testFormDescription = `test edit, copy, archive, deletion, visibility`;
let formCategoryID = '';
let newRequestID = '';
let negCurrencyRequestID = '';

const firstIndLabel = 'Reviewer 1';
const secondIndLabel = 'Reviewer 2';
const thirdIndLabel = 'single line text';
let reviewer1_indID = '';
let reviewer2_indID = '';
let singleLineText_indID = '';

const uniqueText = `My New Request ${randNum}`;

/**
 * Creates a simple form specific to tests that must be isolated because
 * they include archiving form questions and changing the form's status/availability.
 * @param page
 */
const lifecycleNewRequestSetup = async (page:Page) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');

  await page.getByRole('button', { name: 'Create Form' }).click();
  await page.getByLabel('Form Name (up to 50').fill(testFormName);
  await page.getByLabel('Form Description (up to 255').fill(testFormDescription);
  await page.getByLabel('Form Name (up to 50').press('Tab');

  let awaitPromise = page.waitForResponse(res =>
    res.url().includes('workflow') &&
    res.status() === 200
  );
  await page.getByRole('button', { name: 'Save' }).click();
  await awaitPromise;

  await page.getByLabel('Add Section').click();
  await page.getByLabel('Section Heading').fill(firstIndLabel);
  await page.getByLabel('Input Format').selectOption('orgchart_employee');
  awaitPromise = page.waitForResponse(res =>
    res.url().includes('formEditor/newIndicator') &&
    res.status() === 200
  );
  await page.getByRole('button', { name: 'Save' }).click();
  await awaitPromise;

  let namePreview = page.locator('.indicator-name-preview', { hasText: firstIndLabel });
  await expect(namePreview).toBeVisible();
  let elID = await namePreview.getAttribute('id') ?? '';
  reviewer1_indID = elID.replace('format_label_', '');

  const categoryLoc = page.locator('#edit-properties-panel .form-id');
  formCategoryID = await categoryLoc.innerText();

  await page.getByLabel('Add Question to Section').click();
  await page.getByLabel('Field Name').fill(secondIndLabel);
  await page.getByLabel('Input Format').selectOption('orgchart_employee');
  awaitPromise = page.waitForResponse(res =>
    res.url().includes('formEditor/newIndicator') &&
    res.status() === 200
  );
  await page.getByRole('button', { name: 'Save' }).click();
  await awaitPromise;

  namePreview = page.locator('.indicator-name-preview', { hasText: secondIndLabel });
  await expect(namePreview).toBeVisible();
  elID = await namePreview.getAttribute('id') ?? '';
  reviewer2_indID = elID.replace('format_label_', '');

  await page.getByLabel('Add Question to Section').click();
  await page.getByLabel('Field Name').fill(thirdIndLabel);
  await page.getByLabel('Input Format').selectOption('text');
  awaitPromise = page.waitForResponse(res =>
    res.url().includes('formEditor/newIndicator') &&
    res.status() === 200
  );
  await page.getByRole('button', { name: 'Save' }).click();
  await awaitPromise;

  namePreview = page.locator('.indicator-name-preview', { hasText: thirdIndLabel });
  await expect(namePreview).toBeVisible();
  elID = await namePreview.getAttribute('id') ?? '';
  singleLineText_indID = elID.replace('format_label_', '');
}

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await lifecycleNewRequestSetup(page);
});


/**
 *  Verify the New Request page loads correctly
 */
test('Verify New Request Page', async () => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/');
  await page.getByText('New Request', { exact: true }).click();
  await expect(page.locator('#record')).toContainText('Step 1 - General Information');
});

/**
 *  Verify a form with a status of 'Unpublished' is not available
 *  to be selected when creating a new request
 */
test('Unpublished Form Not Visible to New Request', async () => {
  await page.goto(newRequestURL);
  await expect(page.getByRole('heading', { name: 'Step 2 - Select type of' })).toBeVisible();
  await expect(
    page.getByText(testFormName),
    'unpublished form not to be an option on the New Request view'
  ).not.toBeVisible();
});

/**
 *  Verify a form with available status, without a workflow set, is not available
 *  to be selected when creating a new request
 */
test('Form without a workflow is not Visible to New Request', async () => {
  await page.goto(formEditorURL_prefix + formCategoryID);
  await expect(page.locator('.indicator-name-preview', { hasText: firstIndLabel })).toBeVisible();
  await page.getByLabel('Status:').selectOption('1');
  await expect(page.locator('#form_properties_last_update')).toBeVisible();

  await page.goto(newRequestURL);
  await expect(page.getByRole('heading', { name: 'Step 2 - Select type of' })).toBeVisible();
  await expect(
    page.getByText(testFormName),
      'available form without a workflow not to be an option on the New Request view'
  ).not.toBeVisible();
});

/**
 *  Verify a form with a status of 'Available' and a workflow set is available
 *  to be selected when creating a new request
 */
test('Available Form with a workflow is Visible to New Request', async () => {
  await page.goto(formEditorURL_prefix + formCategoryID);
  await expect(page.locator('.indicator-name-preview', { hasText: firstIndLabel })).toBeVisible();
  await page.getByLabel('Workflow:').selectOption('4');
  await expect(page.locator('#form_properties_last_update')).toBeVisible();

  await page.goto(newRequestURL);
  await expect(page.getByRole('heading', { name: 'Step 2 - Select type of' })).toBeVisible();
  await expect(
    page.getByText(testFormName),
    'available form with a workflow to be an option on the New Request view'
  ).toBeVisible();
});

/**
 *  Verify a new request can be edited before being submitted
 */
test('Create and edit a New Request', async () => {
  await page.goto(newRequestURL);
  const serviceDropdown = page.locator('#service_chosen');
  await expect(serviceDropdown).toBeVisible();
  await serviceDropdown.click();
  await page.getByRole('option', { name: 'Concrete Electronics' }).click();
  await page.getByLabel('Title of Request').fill(uniqueText + ' to Edit, Copy, and Cancel');
  await page.locator('label').filter({ hasText: testFormName }).locator('span').click();
  await page.getByRole('button', { name: 'Click here to Proceed' }).click();

  const headerTab = page.locator('#headerTab');
  await expect(headerTab).toBeVisible();
  const headerText = await headerTab.textContent() ?? '';
  newRequestID = headerText.replace('Request #', '');

  await page.getByLabel('single line text').fill('12345');
  await page.locator('#nextQuestion2').click();
  await expect(page.locator(`#data_${singleLineText_indID}_1`)).toContainText('12345');

  await page.getByRole('button', { name: 'Edit this form' }).click();
  await page.getByLabel('single line text').fill('New Text');
  await page.locator('#nextQuestion2').click();

  await expect(page.locator(`#data_${singleLineText_indID}_1`)).toContainText('New Text');

  //fill approver fields to prep for archive test
  await page.getByRole('button', { name: 'Edit this form' }).click();
  // Add Adam Bauch and Dorian Balistreri as Reviewers by username
  await page.getByLabel('Search for user to add as Reviewer 1').click();
  await page.getByLabel('Search for user to add as Reviewer 1').fill('userName:VTRSHHZOFIA');
  await page.getByLabel('Search for user to add as Reviewer 2').click();
  await page.getByLabel('Search for user to add as Reviewer 2').fill('userName:VTRUXEJAMIE');

  // Verify the correct users were found
  await expect(page.getByTitle('87 - VTRSHHZOFIA')).toContainText('Bauch, Adam Koelpin');
  await expect(page.getByTitle('25 - VTRUXEJAMIE')).toContainText('Balistreri, Dorian Dickens');
  // Ensure selections have completely loaded before clicking the Next Question button
  await expect(page.locator(`#loadingIndicator_${reviewer2_indID}`)).not.toBeVisible();
  await page.locator('#nextQuestion2').click();

  // Verify the request is populated with the correct users
  await expect(page.locator(`#data_${reviewer1_indID}_1`)).toContainText('Adam Bauch');
  await expect(page.locator(`#data_${reviewer2_indID}_1`)).toContainText('Dorian Balistreri');

  // Submit the request and verify it has been submitted
  await page.getByRole('button', { name: 'Submit Request' }).click();
  await expect(
    page.locator('#workflowbox_dep-1'),
    'warning to be displayed because the form does not include the indicator set'
  ).toContainText('Warning: User not selected for current action (Contact Administrator)');
});

/**
 *   Verify a request can be copied if its status is 'Available'
 */
test('Request With Available Form Can Be Copied', async () => {
  await page.goto(`https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=${newRequestID}`);
  await page.getByRole('button', { name: 'Copy Request' }).click();
  await page.getByRole('button', { name: 'Save Change' }).click();

  await page.getByLabel('single line text').fill('New Text Available');
  await page.locator('#nextQuestion2').click();

  await expect(page.locator(`#data_${singleLineText_indID}_1`)).toContainText('New Text Available');
  await page.getByRole('link', { name: 'Home' }).click();

  await expect(page.getByRole('link', { name: uniqueText + ' to Edit, Copy, and Cancel' })).toHaveCount(2);
});

test("Request with Unpublished Form Cannot Be Copied", async () => {
  await page.goto(formEditorURL_prefix + formCategoryID);
  await expect(page.locator('.indicator-name-preview', { hasText: firstIndLabel })).toBeVisible();
  await page.getByLabel('Status:').selectOption('-1');

  await page.goto(`https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=${newRequestID}`);
  await page.getByRole('button', { name: 'Copy Request' }).click();
  await page.getByRole('button', { name: 'Save Change' }).click();
  await expect(page.getByText('Request could not be copied:')).toBeVisible();
});

/**
 *  Verify a form with a status of 'Hidden' is not available
 *  to be selected when creating a new request 
 */
test('Hidden Form Not Visible to New Request', async () => {
  await page.goto(formEditorURL_prefix + formCategoryID);
  await expect(page.locator('.indicator-name-preview', { hasText: firstIndLabel })).toBeVisible();
  await page.getByLabel('Status:').selectOption('0');

  await page.goto(newRequestURL);
  await expect(page.getByRole('heading', { name: 'Step 2 - Select type of' })).toBeVisible();
  await expect(
    page.getByText(testFormName),
      'hidden form with a workflow not to be an option on the New Request view'
  ).not.toBeVisible();
});

test("Request with Hidden Form Can Be Copied", async () => {
  await page.goto(`https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=${newRequestID}`);
  await page.getByRole('button', { name: 'Copy Request' }).click();
  await page.getByRole('button', { name: 'Save Change' }).click();

  await page.getByLabel('single line text').fill('New Text Hidden');
  await page.locator('#nextQuestion2').click();
  await expect(page.locator(`#data_${singleLineText_indID}_1`)).toContainText('New Text Hidden');
  await page.getByRole('link', { name: 'Home' }).click();

  await expect(page.getByRole('link', { name: uniqueText + ' to Edit, Copy, and Cancel' })).toHaveCount(3);
});


/**
 *    Set of tests which do the following:
 *    1. Create a request with the "Multiple Person Designated" form
 *    2. Add values to both the "Reviewer 1" and "Reviewer 2" fields
 *    3. Archive the "Reviewer 2" field and verify the report still shows the entered value
 *    4. Restore the "Reviewer 2" field and verify the request still has the old value
 */
test.describe('Archive and Restore Question', () => {
  const requestPrintPrefix = `https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=`;
  // Subsequent tests will make changes that will cause previous tests 
  // to fail so no retries
  test.describe.configure({ retries: 0});

  /**
   *  After archiving the form question, 
   *  verify the data is no longer visible on the 
   *  original request
   */
  test('Archived Question Not Visible to New Request', async () => {
    // Archive the Reviewer 2 field
    await page.goto(formEditorURL_prefix + formCategoryID);
    await expect(page.locator('.indicator-name-preview', { hasText: firstIndLabel })).toBeVisible();
    await page.locator(`#edit_indicator_${reviewer2_indID}`).click();
    await page.locator('label').filter({ hasText: 'Archive' }).locator('span').click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('span').filter({ hasText: secondIndLabel })).not.toBeVisible();

    // Verify the Reviewer 1 field is visible but the Reviewer 2 field is not in the created request
    await page.goto(requestPrintPrefix + newRequestID);
    await expect(
      page.getByText(firstIndLabel, { exact: true }),
      'active question to be visisble on the request'
    ).toBeVisible();
    await expect(
      page.getByText(secondIndLabel, { exact: true }),
      'archived question not to be visisble on the request'
    ).not.toBeVisible();
  });

  /**
   *  Show that despite the data of the archived question 
   *  not being visible in the original request, it is still 
   *  visible in a report.
   */
  test('Value Still Visible in Report After Archiving Question', async () => {
    // Create a new report containing the created request
    await page.goto('https://host.docker.internal/Test_Request_Portal/?a=reports&v=3');
    await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();
    await page.getByRole('option', { name: 'Record ID' }).click();
    await page.getByLabel('text', { exact: true }).fill(newRequestID);
    await page.getByRole('button', { name: 'Next Step' }).click();

    // Ensure both Reviewer fields are displayed in the report
    await page.getByText(testFormName, { exact: true }).click();
    await page.getByTitle(`indicatorID: ${reviewer1_indID}\nReviewer`).locator('span').click();
    await page.getByTitle(`indicatorID: ${reviewer2_indID}\nReviewer 2 (Archived)`).locator('span').click();
    await expect(
      page.getByTitle(`indicatorID: ${reviewer2_indID}\nReviewer 2 (Archived)`),
      'Archived status to be noted in Report Configuration section'
    ).toBeVisible();
    await page.getByRole('button', { name: 'Generate Report' }).click();

    //Verify both archived and nonarchived fields are populated
    await expect(
      page.locator(`[data-indicator-id="${reviewer1_indID}"]`),
      'active question\'s data to be populated in the report'
    ).toContainText('Adam Bauch');
    await expect(
      page.locator(`[data-indicator-id="${reviewer2_indID}"]`),
      'archived question\'s data to be populated in the report'
    ).toContainText('Dorian Balistreri');
  });

  /**
   *  After restoring the form question, verify
   *  that the value is once again visible on the 
   *  original request.
   */
  test('Previous Value Still Available to Request After Restoring Question', async () => {
    // Restore the Reviewer 2 field
    await page.goto(formEditorURL_prefix + formCategoryID);
    await page.getByRole('link', { name: 'Restore Fields' }).click();
    const restoreBtn = page.locator(`#restore_indicator_${reviewer2_indID}`);
    await expect(
      restoreBtn,
      'archived question to be available for restore action'
    ).toBeVisible();
    await restoreBtn.click();
    await expect(
      restoreBtn,
      'restored question to be removed from table after restore'
    ).not.toBeVisible();

    // Verify both fields are visible on the request again
    await page.goto(requestPrintPrefix + newRequestID);
    await expect(page.getByText(firstIndLabel, { exact: true })).toBeVisible();
    await expect(page.getByText(secondIndLabel, { exact: true })).toBeVisible();

    await expect(
      page.locator(`#data_${reviewer1_indID}_1`),
      'active question to be visisble on the request'
    ).toContainText('Adam Bauch');
    await expect(
      page.locator(`#data_${reviewer2_indID}_1`),
      'restored question to be visisble on the request'
    ).toContainText('Dorian Balistreri');
  });
});


/**
 *  Verify copied request in can be cancelled
 */
test('Cancel Requests', async () => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/');
  await expect(page.getByRole('link', { name: uniqueText + ' to Edit, Copy, and Cancel' })).toHaveCount(3);

  const requests = page.getByRole('link', { name: uniqueText + ' to Edit, Copy, and Cancel' });

  let numRequests = await requests.count();
  while(numRequests--) {
    await requests.nth(numRequests).click();
    await page.getByRole('button', { name: 'Cancel Request' }).click();
    await page.getByPlaceholder('Enter Comment').fill('No longer needed');
    await page.getByRole('button', { name: 'Yes' }).click();

    // Verify cancellation page appears
    await expect(page.locator('#bodyarea')).toContainText('has been cancelled!');
    await page.getByRole('link', { name: 'Home' }).click();
  }

  await expect(page.getByText('New Request', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: uniqueText + ' to Edit, Copy, and Cancel' })).toHaveCount(0);
});

/**
 *  Test for 4665
 *  Verify that a negative amount is allowed for currency
 *  in a new request
 */
test('Negative Currency Allowed in New Request', async () => {
  await page.goto(newRequestURL);
  const serviceDropdown = page.locator('#service_chosen');
  await expect(serviceDropdown).toBeVisible();
  await serviceDropdown.click();
  await page.getByRole('option', { name: 'Concrete Music' }).click();
  await page.getByLabel('Title of Request').click();
  await page.getByLabel('Title of Request').fill(uniqueText + ' to Test Negative Currency');

  // Choose the Input Formats form
  await page.locator('label').filter({ hasText: 'Input Formats (For testing' }).locator('span').click();
  await page.getByRole('button', { name: 'Click here to Proceed' }).click();

  const headerTab = page.locator('#headerTab');
  await expect(headerTab).toBeVisible();
  const headerText = await headerTab.textContent() ?? '';
  negCurrencyRequestID = headerText.replace('Request #', '');

  await page.getByLabel('currency').click();
  await page.getByLabel('currency').fill('-300');

  // After saving, verify the negative number is still visible
  await page.locator('#save_indicator').click();
  await expect(page.getByLabel('currency')).toHaveValue('-300.00');
  //verify correct display on the print view
  await page.getByRole('button', { name: 'Show single page' }).click();
  await expect(
    page.locator('#data_37_1'),
    'negative currency to display correct on the print view'
  ).toContainText('-$300.00');
});

/**
 *  Test for 4665
 *  Verify that a negative amount is allowed for currency
 *  when editing a request
 */

test("Negative Currency Allowed When Editing a Request", async () => {
  await page.goto(
    'https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=' + negCurrencyRequestID
  );

  await page.getByRole('button', { name: 'Edit Basic input types field' }).click();
  const dialog = page.getByRole('dialog', { name: 'Editing #' });
  await expect(dialog.locator('div[id$="_loadIndicator"]')).toBeHidden();

  const currencyInput = page.getByLabel('currency');
  await expect(currencyInput).toBeVisible();
  await currencyInput.fill('-50');

  const awaitPrint = page.waitForResponse(res =>
    res.url().includes('getprintindicator') &&
    res.status() === 200
  );
  await page.getByRole('button', { name: 'Save Change' }).click();
  await awaitPrint;

  await expect(
    page.locator('#data_37_1'),
    'edited negative currency to display correct on the print view'
  ).toHaveText('-$50.00');

  //cleanup
  await page.getByRole('button', { name: 'Cancel Request' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();
});

/**
 * Test for LEAF 4913
 */
test('Closing pop up window does not cause workflow form fields to disappear', async ({ page }) => {
  const testCase = '495';
  await page.goto(`https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=${testCase}`);
  await expect(page.locator('#format_label_4').getByText('Multi line text', { exact: true })).toBeVisible();
  await page.locator('#tools').getByText('View History').click();
  await expect(page.getByText(`History of Request ID#: ${testCase}`)).toBeVisible();
  await page.locator('#genericDialogxhr').press('Escape');

  await expect(page.locator('#format_label_4').getByText('Multi line text', { exact: true })).toBeVisible();
});

test.afterAll(async () => {
  //delete created form.
  await page.goto(formEditorURL_prefix + formCategoryID);
  await expect(page.locator('.indicator-name-preview', { hasText: firstIndLabel })).toBeVisible();
  await page.getByRole('button', { name: 'Delete this form' }).click();
  await expect(page.locator('#leaf_dialog_content', { hasText: testFormName})).toBeVisible();
  await page.getByRole('button', { name: 'Yes' }).click();
});