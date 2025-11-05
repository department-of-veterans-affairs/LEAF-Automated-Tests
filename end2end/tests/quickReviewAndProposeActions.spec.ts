import { test, expect, Page } from '@playwright/test';
import { createTestRequest, getRandomId, LEAF_URLS } from '../leaf_test_utils/leaf_util_methods.ts';

/* file-specific methods */

/**
 * Used to sort the LEAF grid before proceeding with other interactions.
 * This method is not intended to test sorting behavior itself.
 * @param page page instance of the test
 * @param compareRequestID request ID that should be closer to the top/bottom
 * @param desc sort descending. default true
 */
const sortLeafGrid = async (
  page:Page, compareRequestID:string = '0', desc:boolean = true
) => {
  const headerLoc = page.locator(`th[id$="_header_uid"]`);
  await headerLoc.click();
  const firstRow = await page.locator('table[id^="LeafFormGrid"] td').first().textContent() ?? '0';
  if (desc === true) {
    if(Number(firstRow) < Number(compareRequestID)) {
      await headerLoc.click();
    }
  } else {
    if(Number(firstRow) > Number(compareRequestID)) {
      await headerLoc.click();
    }
  }
}
/**
 * Submit a General Form request, starting on section 1
 * @param page page instance of the test
 * @param requestID requestID being submitted
 * @param requiredApproverValue user to select as required approver
 * @param requiredGroupValue group to select as required approver
 */
const submitGeneralFormTestRequest = async (
  page:Page,
  requestID:string,
  requiredApproverValue:string = 'Tester, Tester',
  requiredGroupValue:string = 'Group A',
) => {
  const loadingIndicators = page.locator('div[id^="loadingIndicator_"]:visible');
  const busyIcons = page.locator(`img[id$="_iconBusy"]:visible`);
  //1. no required questions on this page
  expect(page.url().includes(`&recordID=${requestID}`)).toBe(true);
  await expect(page.locator('#nextQuestion2')).toBeVisible();
  await page.locator('#nextQuestion2').click();
  //2. Assigned Person - step 1 approver
  await expect(page.getByText('Form completion progress: 0% Next Question')).toBeVisible();
  await page.getByRole(
    'searchbox',
    { name: 'Search for user to add as Assigned Person', exact: true }
  ).fill(requiredApproverValue);
  await expect(page.getByRole('cell', { name: requiredApproverValue })).toBeVisible();
  await page.getByRole('cell', { name: requiredApproverValue }).click();
  await expect(busyIcons).toHaveCount(0);
  await expect(loadingIndicators).toHaveCount(0);
  await expect(page.locator('#nextQuestion2')).toBeVisible();
  await page.locator('#nextQuestion2').click();
  //3. Assigned Group - not an approver for step one, but required to proceed
  await expect(page.getByText('Form completion progress: 50% Next Question')).toBeVisible();
  await page.getByRole(
    'searchbox',
    { name: 'Search for user to add as Assigned Group', exact: true }
  ).fill(requiredGroupValue);
  await expect(page.getByRole('cell', { name: requiredGroupValue })).toBeVisible();
  await page.getByRole('cell', { name: requiredGroupValue }).click();
  await expect(busyIcons).toHaveCount(0);
  await expect(loadingIndicators).toHaveCount(0);
  await expect(page.locator('#nextQuestion2')).toBeVisible();
  await page.locator('#nextQuestion2').click();

  await expect(page.getByRole('button', { name: 'Submit Request' })).toBeVisible();
  const awaitSave = page.waitForResponse(res =>
    res.url().includes(`${requestID}/submit`) && res.status() === 200
  );
  await page.getByRole('button', { name: 'Submit Request' }).click();
  await awaitSave;
}

//global static variables for this test
const quickReviewUrl = LEAF_URLS.PORTAL_HOME + 'report.php?a=LEAF_Quick_Review';
const proposalUrl = LEAF_URLS.PORTAL_HOME + 'report.php?a=LEAF_Propose_Actions';
const formName = 'General Form';
const stepName = 'Step 1';
const roles = [ 'Person Designated by the Requestor', 'Group A' ];

test('Verify that using the quick review page, you are able to approve the request', async ({ page }) => {
  //submit an isolated test request to be used for the approval actions
  const testRequestTitle = 'qrpa_' + getRandomId();
  const testRequestID = await createTestRequest(page, 'AS - Service', testRequestTitle, formName);
  await submitGeneralFormTestRequest(page, testRequestID);

  //common Locators
  const rowLocator = page.locator('tr', { hasText: testRequestTitle });
  const reviewLinkTextArea = page.locator('textarea#link');
  const closeBtn = page.locator('span.ui-button-icon').nth(1);
  const confirmActionsBtn = page.getByRole('button', { name: 'Confirm Actions' });
  const confirmationMsg = page.locator(`div#confirmProgress`);

  // Step 1: Open Quick Review Page
  await page.goto(quickReviewUrl);
  await page.getByLabel('Select a form type').selectOption({ label: formName });
  await page.getByLabel('Select a step').selectOption({ label: stepName });
  await page.getByRole('button', { name: 'Setup Quick Review' }).click();
  await page.locator(`//th[@aria-label='Sort by Title']`).waitFor({ state: 'visible' });

  // Step 2: Find unique request
  await sortLeafGrid(page, testRequestID);
  await expect(rowLocator).toBeVisible();

  // Step 3: Generate links for both roles
  let approvalURLs:Array<string> = [];
  for(let i = 0; i < roles.length; i++) {
    await page.getByLabel('Select a role').selectOption({ label: roles[i] });
    await page.getByRole('button', { name: 'Create Quick Review Page' }).click();
    await reviewLinkTextArea.waitFor({ state: 'visible' });
    const reviewLink = await reviewLinkTextArea.inputValue();
    expect(reviewLink).toContain('http');
    approvalURLs.push(reviewLink);
    await closeBtn.click();
  }
  expect(approvalURLs.length).toBe(2);

  // Step 4,5: Approve from each link
  for(let i = 0; i < approvalURLs.length; i++) {
    await page.goto(approvalURLs[i]);
    await page.locator(`//th[@aria-label='Sort by Title']`).waitFor({ state: 'visible' });

    await sortLeafGrid(page, testRequestID);
    await expect(rowLocator).toBeVisible();
    await rowLocator.getByLabel(`Action for record # ${testRequestID}`).selectOption({ label: 'Approve' });
    await page.getByRole('button', { name: 'Apply Actions' }).click();
    await expect(confirmActionsBtn).toBeVisible();
    await confirmActionsBtn.click();
    await confirmationMsg.waitFor({ state: 'visible' });
    await expect(confirmationMsg).toHaveText('All actions have been successfully applied.');
  }

  // Step 6: Verify final status
  await page.goto(LEAF_URLS.PORTAL_HOME);
  const searchBar = page.locator('div#searchContainer div input');
  await searchBar.fill(testRequestTitle);
  await expect(rowLocator).toBeVisible();
  await expect(rowLocator.locator('td:nth-child(4)')).toHaveText('Pending Step 2');
});

test('Verify that using the proposal page, you are able to approve the request', async ({ page }) => {
  const testRequestTitle = 'qrpa_' + getRandomId();
  const testRequestID = await createTestRequest(page, 'AS - Service', testRequestTitle, formName);
  await submitGeneralFormTestRequest(page, testRequestID);

  //common Locators
  const rowLocator = page.locator('tr', { hasText: testRequestTitle });
  const confirmationMsg = page.locator(`div#confirmProgress`);
  const closeBtn = page.locator('span.ui-button-icon').nth(1);

  //create and approve a proposal for each role
  for(let i = 0; i < roles.length; i++) {
    await page.goto(proposalUrl);
    await page.getByLabel('Select a form type').selectOption({ label: formName });
    await page.getByLabel('Select a step').selectOption({ label: stepName });
    await page.getByRole('button', { name: 'Setup Proposed Actions' }).click();

    await page.locator(`//th[@aria-label='Sort by Title']`).waitFor({ state: 'visible' });
    await page.getByLabel('Select a role').selectOption({ label: roles[i] });
    await page.getByRole('textbox', { name: 'Title of proposal *required' }).fill('asdf');

    // Step 2: Find unique request
    await sortLeafGrid(page, testRequestID);
    await expect(rowLocator).toBeVisible();
    await rowLocator.getByLabel(`Action for record # ${testRequestID}`).selectOption({ label: 'Approve' });
    await page.getByRole('button', { name: 'Prepare Proposal' }).click();

    await page.locator('th').first().waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Approve this Proposal' }).click();
    await page.locator(`#confirm_saveBtnText`).click();
    await page.locator(`#confirmProgress`).waitFor({ state: 'visible' });
    await expect(confirmationMsg).toHaveText('All actions have been successfully applied.');
    await closeBtn.click();
  }

  //Verify final status
  await page.goto(LEAF_URLS.PORTAL_HOME);
  const searchBar = page.locator('div#searchContainer div input');
  await searchBar.fill(testRequestTitle);
  await expect(rowLocator).toBeVisible();
  await expect(rowLocator.locator('td:nth-child(4)')).toHaveText('Pending Step 2');
});
