import { test, expect } from '@playwright/test';
test('Verify the Sensitive Content is Masked in Inbox and shown when hovered', async ({ page }) => {
     // Locators
  const adminMenuOptions = page.locator("span.leaf-admin-btntitle");
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
  const homepageLink = page.locator("//a[@href='../']");
  const newRequestButton = page.locator("(//span[@class='menuButtonSmall'])[2]");
  const serviceDropdown = page.locator("a.chosen-single").nth(0);
  const serviceOption = page.locator("//li[@id='service-chosen-search-result-1']");
  const requestTitleInput = page.locator("input#title");
  const submitRequestButton = page.locator("(//button[@type='submit'])[1]");
  const formListCheckboxes = page.locator("label.checkable.leaf_check");
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
  const maskedContent = page.locator("span.sensitiveIndicator-masked");
  const unmaskedContent = page.locator("span.printResponse");

//   // Variables
  const adminPortalURL = "https://host.docker.internal/Test_Request_Portal/admin/";
  const formTitle = "Automated Form for Sensitive Content Test";
  const formDesc = "Sensitive Content Test Description";
  const sectionTitle = "Section Heading One";
  const questionText = "This question will have sensitive content";
  const requestTitle = "Test Request for Sensitive Content";
  const userInputAnswer = "This will be hidden";

//   // Utility Function
  async function selectAdminMenuOption(optionName: string) {
    const allOptions = await adminMenuOptions.allInnerTexts();
    const optionIndex = allOptions.indexOf(optionName);
    if (optionIndex !== -1) {
      await adminMenuOptions.nth(optionIndex).click();
    } else {
      throw new Error(`Option "${optionName}" not found.`);
    }
  }
  
    // Step 1: Navigate to the admin portal
    await page.goto(adminPortalURL);
    console.info("Navigated to Admin Portal");
  
    // Step 2: Open Form Editor
    await selectAdminMenuOption("Form Editor");
    await page.waitForResponse((res) =>
      res.url().includes("/api/formStack/categoryList/allWithStaples") && res.status() === 200
    );
    console.info("Form Editor Opened");
  
    // Step 3: Click on Create Form
    await createFormButton.click();
    await formNameInput.waitFor({ state: "visible" });
    console.info("Clicked on Create Form");
  
    // Step 4: Enter Form Name and Description
    await formNameInput.fill(formTitle);
    await formDescriptionTextarea.fill(formDesc);
    console.info("Entered Form Title and Description");
  
    // Step 5: Save the Form
    await saveButton.click();
    await page.waitForResponse((res) =>
      res.url().includes("/api/formEditor/new") && res.status() === 200
    );
    await savedFormNameInput.waitFor({ state: "visible" });
    console.info("Form Saved Successfully");
  
    // Step 6: Verify Form Saved Correctly
    expect(await savedFormNameInput.inputValue()).toBe(formTitle);
    expect(await savedFormDescriptionTextarea.inputValue()).toBe(formDesc);
    console.info("Verified Form Title and Description");
  
    // Step 7: Set Workflow and Status
    await workflowDropdown.selectOption("1");
    await statusDropdown.selectOption("1");
    console.info("Workflow and Status Set");
  
    // Step 8: Add Section
    await addSectionButton.click();
    await sectionHeadingTextarea.fill(sectionTitle);
    await saveButton.click();
    console.info("Section Added");
  
    // Step 9: Add Question to Section with Sensitive masking ability
    await addQuestionButton.click();
    await questionNameTextarea.fill(questionText);
    await formatTypeDropdown.selectOption("text");
    await sensitiveChkbox.click();
    await saveButton.click();
    console.info("Sensitive Question Added");
  
    // Step 10: Submit a New Request
    await homepageLink.click();
    await newRequestButton.waitFor({ state: "visible" });
    await newRequestButton.click();
    await serviceDropdown.click();
    await serviceOption.click();
    await requestTitleInput.fill(requestTitle);
    console.info("Started New Request");
  
    await formListCheckboxes.first().waitFor({ state: "visible", timeout: 10000 });
  
    const checkboxCount = await formListCheckboxes.count();
    if (checkboxCount === 0) throw new Error("No form checkboxes found — form list failed to render.");
  
    const availableForms = await formListCheckboxes.allInnerTexts();
    const expectedFormLabel = `${formTitle}  (${formDesc})`.toLowerCase().replace(/\s+/g, ' ').trim();
    const cleanedFormLabels = availableForms.map(item => item.toLowerCase().replace(/\s+/g, ' ').trim());
  
    const formIndex = cleanedFormLabels.indexOf(expectedFormLabel);
    if (formIndex !== -1) {
      await formListCheckboxes.nth(formIndex).click();
      await submitRequestButton.click();
      console.info("Form Selected and Request Submitted");
    } else {
      throw new Error(`Form "${expectedFormLabel}" is NOT present in the list.`);
    }
  
    await answerInputBox.fill(userInputAnswer);
    await nextQuestionButton.click();
    await finalSubmitRequestButton.click();
    console.info("Answer Submitted and Request Finalized");
  
    // Step 11: Verify Request in Inbox
    await goToHomepageButton.click();
    await inboxButton.click();
    await adminViewButton.click();
    await inboxHeaderText.waitFor({ state: "visible" });
    console.info("Navigated to Inbox View");
  
    const inboxRequests = await activeRequestsList.allInnerTexts();
    const requestIndex = inboxRequests.indexOf(formTitle);
    if (requestIndex !== -1) {
      console.info(`Form "${formTitle}" is present in the inbox`);
      await viewRequestBtn.nth(requestIndex).click();
      await quickViewBtn.waitFor({ state: "visible" });
      await quickViewBtn.click();
      console.info("Quick View Opened");
  
      await maskedContent.click({ force: true });
      await unmaskedContent.waitFor({ state: "visible" });
      const rawUnsmaskedContent = await unmaskedContent.textContent();
      const unmaskedContentText = rawUnsmaskedContent ? rawUnsmaskedContent.trim() : '';
      expect(unmaskedContentText).toBe(userInputAnswer);
      console.info("Unmasked Content Verified Successfully");
    } else {
      throw new Error(`Form "${formTitle}" is NOT present in the inbox.`);
    }
  });