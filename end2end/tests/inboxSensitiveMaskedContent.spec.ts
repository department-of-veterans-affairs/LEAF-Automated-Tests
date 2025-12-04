import { test, expect } from '@playwright/test';
import { getRandomId, LEAF_URLS, createTestRequest } from '../leaf_test_utils/leaf_util_methods.ts';

test('Verify the Sensitive Content is Masked in Inbox and shown when hovered', async ({ page }) => {
     // Locators
  const createFormButton = page.locator("button#createFormButton");
  const formNameInput = page.locator("input#name");
  const formDescriptionTextarea = page.locator("textarea#description");
  const saveButton = page.locator("button#button_save");
  const savedFormNameInput = page.locator("input#categoryName");
  const savedFormDescriptionTextarea = page.locator("textarea#categoryDescription");
  const workflowDropdown = page.locator("select#workflowID");
  const statusDropdown = page.locator("select#availability");
  const addSectionButton = page.locator("div#blank_section_preview button.btn-general");
  const sectionHeadingTextarea = page.locator("textarea#name");
  const addQuestionButton = page.locator("button.new_section_question");
  const questionNameTextarea = page.locator("textarea#name");
  const formatTypeDropdown = page.locator("select#indicatorType");
  const sensitiveChkbox = page.locator("label[for='sensitive']");
  const answerInputBox = page.locator("//input[@type='text']");
  const nextQuestionButton = page.locator("button#nextQuestion2");
  const finalSubmitRequestButton = page.locator("div#submitControl button.buttonNorm");
  const goToHomepageButton = page.locator("//a[@title='nav to homepage']");
  const inboxButton = page.locator("(//span[@class='menuButtonSmall'])[3]");
  const adminViewButton = page.locator("button#btn_adminView");
  const inboxHeaderText = page.locator("div#inbox div").first();
  const activeRequestsList = page.locator("div.siteFormContainers button span:first-child");
  const viewRequestBtn = page.locator("div.depContainer button span:last-child");
  const quickViewBtn = page.locator(`//a[contains(text(), 'Test Request for Sensitive Content')]/following-sibling::button[contains(text(), 'Quick View')]`).nth(0);
  const maskingContent = page.locator("span.sensitiveIndicator-masked");
  const unmaskedContent = page.locator("span.printResponse");

//   // Variables
  const formTitle = "Masking_" + getRandomId();
  const formDesc = "Sensitive Content Test Description";
  const sectionTitle = "Section Heading One";
  const questionText = "This question will have sensitive content";
  const requestTitle = "Test Request for Sensitive Content";
  const userInputAnswer = "This will be hidden";

  
  // Step 1: Navigate to the form browser
  await page.goto(LEAF_URLS.FORM_EDITOR);
  await expect(createFormButton).toBeVisible();
  
  // Step 2: Create Form
  await createFormButton.click();
  await formNameInput.waitFor({ state: "visible" });
  await formNameInput.fill(formTitle);
  await formDescriptionTextarea.fill(formDesc);
  await saveButton.click();
  await page.waitForResponse((res) =>
    res.url().includes("/api/formEditor/new") && res.status() === 200
  );
  await savedFormNameInput.waitFor({ state: "visible" });
  
  // Step 3: Form View: Verify Form Saved Correctly
  expect(await savedFormNameInput.inputValue()).toBe(formTitle);
  expect(await savedFormDescriptionTextarea.inputValue()).toBe(formDesc);
  
  // Step 4: Panel config: Set Workflow and Status
  await workflowDropdown.selectOption("1");
  await statusDropdown.selectOption("1");

  // Step 5: Add Section with question
  await addSectionButton.click();
  await sectionHeadingTextarea.fill(sectionTitle);
  await saveButton.click();

  await expect(addQuestionButton).toBeVisible();
  await addQuestionButton.click();
  await questionNameTextarea.fill(questionText);
  await formatTypeDropdown.selectOption("text");
  await sensitiveChkbox.click();
  await saveButton.click();
  await expect(page.getByText(questionText)).toBeVisible();

  // Step 6: Submit a New Request
  const testRequestID = await createTestRequest(page, 'AS - Service', requestTitle, formTitle);
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
  await maskingContent.click({force:true});
  await expect(maskingContent).not.toBeVisible();
  await unmaskedContent.waitFor({ state: "visible" });
  const rawUnsmaskedContent = await unmaskedContent.textContent();
  const unmaskedContentText = rawUnsmaskedContent ? rawUnsmaskedContent.trim() : '';
  expect(unmaskedContentText).toBe(userInputAnswer);

});