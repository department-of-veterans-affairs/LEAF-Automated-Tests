import { test, expect } from '@playwright/test';

test('Verify that using the quick review page, you are able to approve the request', async ({ page }) => {
  // Locators
  const formsDrpDwn = page.locator('select#forms');
  const StepDrpDwn = page.locator('select#steps');
  const setupQuickReviewBtn = page.locator('button#create');
  const listOfRequestsLoc = page.locator('tbody tr td a');
  const TitleNumberOfRequests = page.locator('td span');
  const roleDrpDwn = page.locator('select#dependencySelect');
  const createQwkRviePage = page.locator('button#btn_prepareProposal');
  const reviewLinkTextArea = page.locator('textarea#link');
  const closeBtn = page.locator('span.ui-button-icon').nth(1);
  const pendingRequestsLoc = page.locator('tbody tr td a');
  const actionDrpDwn = page.locator('td select');
  const aprovalBtn = page.locator('button#btn_approveProposal');
  const searchBar = page.locator('div#searchContainer div input');
  const TitleNumberInRequestLoc = page.locator('span.browsecounter a');
  const finalStatus = page.locator('table tr td:nth-child(4)');
  const magnifierIcon = page.locator('img.searchIcon').nth(0);

  // Variables
  const quickReviewUrl = 'https://host.docker.internal/Test_Request_Portal/report.php?a=LEAF_Quick_Review';
  const formName = 'General Form';
  const stepName = 'Step 1';
  const role1 = 'Person Designated by the Requestor';
  const role2 = 'Group A';
  const requestListingUrl = 'https://host.docker.internal/Test_Request_Portal/';

  let uniqueRequest: string | null = null;
  let uniqueRequestIndex = -1;

  // Step 1: Open Quick Review Page
  await page.goto(quickReviewUrl);
  await formsDrpDwn.selectOption({ label: formName });
  await StepDrpDwn.selectOption({ label: stepName });
  await setupQuickReviewBtn.click();
  await page.locator(`//th[@aria-label='Sort by Title']`).waitFor({ state: 'visible' });

  // Step 2: Find unique request
  const listOfRequests = await listOfRequestsLoc.allInnerTexts();
  for (let i = 0; i < listOfRequests.length; i++) {
    if (listOfRequests.indexOf(listOfRequests[i]) === listOfRequests.lastIndexOf(listOfRequests[i])) {
      uniqueRequest = listOfRequests[i];
      uniqueRequestIndex = i;
      break;
    }
  }
  expect(uniqueRequest).not.toBeNull();

  const titleNumber = await TitleNumberOfRequests.nth(uniqueRequestIndex).innerText();

  // Step 3: Generate links for both roles
  await roleDrpDwn.selectOption({ label: role1 });
  await createQwkRviePage.click();
  await reviewLinkTextArea.waitFor({ state: 'visible' });
  const firstReviewLink = await reviewLinkTextArea.inputValue();
  expect(firstReviewLink).toContain('http');
  await closeBtn.click();

  await roleDrpDwn.selectOption({ label: role2 });
  await createQwkRviePage.click();
  await reviewLinkTextArea.waitFor({ state: 'visible' });
  const secondReviewLink = await reviewLinkTextArea.inputValue();
  expect(secondReviewLink).toContain('http');

  // Step 4: Approve from first link
  await page.goto(firstReviewLink);
  await page.locator(`//th[@aria-label='Sort by Title']`).waitFor({ state: 'visible' });

  const pendingRequests = await pendingRequestsLoc.allInnerTexts();
  const pendingRequestIndex = uniqueRequest !== null ? pendingRequests.indexOf(uniqueRequest) : -1;

  if (pendingRequestIndex !== -1) {
    await actionDrpDwn.nth(pendingRequestIndex).selectOption({ label: 'Approve' });
    await aprovalBtn.click();
    await page.locator(`span#confirm_saveBtnText`).click();
    await page.locator(`div#confirmProgress`).waitFor({ state: 'visible' });
  } 

  // Step 5: Approve from second link
  await page.goto(secondReviewLink);
  await page.locator(`//th[@aria-label='Sort by Title']`).waitFor({ state: 'visible' });

  const pendingRequests2 = await pendingRequestsLoc.allInnerTexts();
  const pendingRequestIndex2 = uniqueRequest !== null ? pendingRequests2.indexOf(uniqueRequest) : -1;

  if (pendingRequestIndex2 !== -1) {
    await actionDrpDwn.nth(pendingRequestIndex2).selectOption({ label: 'Approve' });
    await aprovalBtn.click();
    await page.locator(`span#confirm_saveBtnText`).click();
    await page.locator(`div#confirmProgress`).waitFor({ state: 'visible' });
  } 

  // Step 6: Verify final status
  await page.goto(requestListingUrl);
  // Using delay to mimic human typing; ensures that search results have time to load dynamically.
  // Without delay, the search input may complete before results are available, leading to test flakiness.
  await searchBar.type(uniqueRequest || '', { delay: 200 });
  await magnifierIcon.waitFor({ state: 'visible' });

  const titleNumberInRequest = await TitleNumberInRequestLoc.allInnerTexts();
  const indexOfStatus = titleNumberInRequest.indexOf(titleNumber);

  expect(indexOfStatus).toBeGreaterThan(-1);
  await expect(finalStatus.nth(indexOfStatus)).toHaveText('Pending Step 2');
});

test('Verify that using the proposal page, you are able to approve the request', async ({ page }) => {
// Locators
const formsDrpDwn = page.locator('select#forms');
const StepDrpDwn = page.locator('select#steps');
const setupProposedBtn = page.locator('button#create');
const roleDrpDwn = page.locator('select#dependencySelect');
const listOfRequestsLoc = page.locator('tbody tr td a');
const actionDrpDwn = page.locator('td select');
  const TitleNumberOfRequests = page.locator('td span');
  const closeBtn = page.locator('span.ui-button-icon').nth(1);
  const searchBar = page.locator('div#searchContainer div input');
  const TitleNumberInRequestLoc = page.locator('span.browsecounter a');
  const finalStatus = page.locator('table tr td:nth-child(4)');
  const magnifierIcon = page.locator('img.searchIcon').nth(0);




//Variables
const proposalUrl='https://host.docker.internal/Test_Request_Portal/report.php?a=LEAF_Propose_Actions';
const formName = 'General Form'
const stepName = 'Step 1';
const role1 = 'Person Designated by the Requestor';
const role2 = 'Group A';
const requestListingUrl = 'https://host.docker.internal/Test_Request_Portal/';

let uniqueRequest: string | null = null;
let uniqueRequestIndex = -1;

//Test Steps
await page.goto(proposalUrl);
await formsDrpDwn.selectOption({ label: formName });
await StepDrpDwn.selectOption({ label: stepName });
await setupProposedBtn.click();

await roleDrpDwn.selectOption({ label: role1 });

// Step 2: Find unique request

  await page.locator(`//th[@aria-label='Sort by Title']`).waitFor({ state: 'visible' });
  const listOfRequests = await listOfRequestsLoc.allInnerTexts();
  for (let i = 0; i < listOfRequests.length; i++) {
    if (listOfRequests.indexOf(listOfRequests[i]) === listOfRequests.lastIndexOf(listOfRequests[i])) {
      uniqueRequest = listOfRequests[i];
      uniqueRequestIndex = i;
      break;
    }
  }
  expect(uniqueRequest).not.toBeNull();
  const titleNumber = await TitleNumberOfRequests.nth(uniqueRequestIndex).innerText();

  if (uniqueRequestIndex !== -1) {
    await actionDrpDwn.nth(uniqueRequestIndex).selectOption({ label: 'Approve' });
    await page.locator('button#btn_prepareProposal').click();
    await page.locator('th').first().waitFor({ state: 'visible' });
    await page.locator(`button#btn_approveProposal`).click();
    await page.locator(`#confirm_saveBtnText`).click();
    await page.locator(`#confirmProgress`).waitFor({ state: 'visible' });
    await closeBtn.click();
  }
  else {
    throw new Error('❌ Unique request not found in the first role');
    return;
  }
  await page.goBack();

await roleDrpDwn.selectOption({ label: role2 });
// Step 2: Find unique request
  await page.locator(`//th[@aria-label='Sort by Title']`).waitFor({ state: 'visible' });

  const listOfRequests2 = await listOfRequestsLoc.allInnerTexts();
  let indexOfRequest2 = listOfRequests2.indexOf(uniqueRequest || '');
  if (indexOfRequest2 === -1) {
    throw new Error('❌ Unique request not found in the second role');
    return;
  } 
  else {
    await actionDrpDwn.nth(indexOfRequest2).selectOption({ label: 'Approve' });
    await page.locator('button#btn_prepareProposal').click();
    await page.locator('th').first().waitFor({ state: 'visible' });
    await page.locator(`button#btn_approveProposal`).click();
    await page.locator(`#confirm_saveBtnText`).click();
    await page.locator(`#confirmProgress`).waitFor({ state: 'visible' });
    await closeBtn.click();
  }
    // Step 6: Verify final status
  await page.goto(requestListingUrl);
  // Using delay to mimic human typing; ensures that search results have time to load dynamically.
  // Without delay, the search input may complete before results are available, leading to test flakiness.

  await searchBar.type(uniqueRequest || '', { delay: 200 });
  await magnifierIcon.waitFor({ state: 'visible' });

  const titleNumberInRequest = await TitleNumberInRequestLoc.allInnerTexts();
  const indexOfStatus = titleNumberInRequest.indexOf(titleNumber);

  expect(indexOfStatus).toBeGreaterThan(-1);
  await expect(finalStatus.nth(indexOfStatus)).toHaveText('Pending Step 2');
  
});

