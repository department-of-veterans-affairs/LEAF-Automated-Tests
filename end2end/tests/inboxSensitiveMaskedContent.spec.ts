import { test, expect } from '@playwright/test';
import { 
  getRandomId, 
  createTestRequest,
  deleteTestRequestByRequestID,
  createTestForm,
  deleteTestFormByFormID,
  addFormQuestion
} from '../leaf_test_utils/leaf_util_methods.ts';

test('Verify the Sensitive Content is Masked in Inbox and shown when hovered', async ({ page }) => {

  let testFormID = '';
  let testRequestID = '';

  try {

  // Variables
  const testID = getRandomId();
  const formTitle = "Masking Form_" + testID;
  const formDesc = "Sensitive Content Test Description";
  const sectionTitle = "Section Heading One";
  const questionText = "This question will have sensitive content";
  const requestTitle = "Masking Request_" + testID;
  const userInputAnswer = "This will be hidden";
  const quickViewBtnXPath = `//a[contains(text(), '${requestTitle}')]/following-sibling::button[contains(text(), 'Quick View')]`
  
  // Locators
  const workflowDropdown = page.locator("select#workflowID");
  const statusDropdown = page.locator("select#availability");
  const answerInputBox = page.locator("//input[@type='text']");
  const nextQuestionButton = page.locator("button#nextQuestion2");
  const finalSubmitRequestButton = page.locator("div#submitControl button.buttonNorm");
  const goToHomepageButton = page.locator("//a[@title='nav to homepage']");
  const inboxButton = page.locator("(//span[@class='menuButtonSmall'])[3]");
  const adminViewButton = page.locator("button#btn_adminView");
  const inboxHeaderText = page.locator("div#inbox div").first();
  const activeRequestsList = page.locator("div.siteFormContainers button span:first-child");
  const viewRequestBtn = page.locator("div.depContainer button span:last-child");
  const quickViewBtn = page.locator(quickViewBtnXPath);
  const maskingContent = page.locator("span.sensitiveIndicator-masked");
  const unmaskedContent = page.locator("span.printResponse");

  

  
  testFormID = await createTestForm(page, formTitle, formDesc);
  
  await workflowDropdown.selectOption("1");
  await statusDropdown.selectOption("1");

  await addFormQuestion(page, 'Add Section', sectionTitle);
  await addFormQuestion(page, 'Add Question to Section', questionText, 'text', '', true);  

  // Step 6: Submit a New Request
  testRequestID = await createTestRequest(page, 'AS - Service', requestTitle, formTitle);
  await expect(page.locator('#headerTab')).toHaveText(`Request #${testRequestID}`);

  await answerInputBox.fill(userInputAnswer);
  await nextQuestionButton.click();
  await finalSubmitRequestButton.click();

  // Step 7: Verify Request in Inbox
  await goToHomepageButton.click();
  await inboxButton.click();
  await adminViewButton.click();
  await inboxHeaderText.waitFor({ state: "visible" });
  
  const inboxRequests = await activeRequestsList.allInnerTexts();
  const requestIndex = inboxRequests.indexOf(formTitle);
  expect(requestIndex).toBeGreaterThan(-1);

  await viewRequestBtn.nth(requestIndex).click();
  await quickViewBtn.waitFor({ state: "visible" });
  await quickViewBtn.click();
    
  await expect(unmaskedContent).not.toBeVisible();
  await expect(maskingContent).toBeVisible();
  await expect(maskingContent).toHaveText('**********');
  await page.locator('div.sensitiveIndicatorMaskToggle label').click({force:true});
  await expect(maskingContent).not.toBeVisible();
  await unmaskedContent.waitFor({ state: "visible" });
  const rawUnsmaskedContent = await unmaskedContent.textContent();
  const unmaskedContentText = rawUnsmaskedContent ? rawUnsmaskedContent.trim() : '';
  expect(unmaskedContentText).toBe(userInputAnswer);

  } finally {
    
    if(testFormID != '') {
      await deleteTestFormByFormID(page, testFormID);
    }

    if(testRequestID != '') {
      await deleteTestRequestByRequestID(page, testRequestID);
    }
  }

  

});