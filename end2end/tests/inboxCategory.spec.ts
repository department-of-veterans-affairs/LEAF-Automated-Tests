import { test, expect } from "@playwright/test";

// test("Verify Request Appears in Inbox After Submission", async function ({ page }) {
//   // Locators
//   const adminMenuOptions = page.locator("span.leaf-admin-btntitle");
//   const createFormButton = page.locator("button#createFormButton");
//   const formNameInput = page.locator("input#name");
//   const formDescriptionTextarea = page.locator("textarea#description");
//   const saveButton = page.locator("button#button_save");
//   const savedFormNameInput = page.locator("input#categoryName");
//   const savedFormDescriptionTextarea = page.locator("textarea#categoryDescription");
//   const workflowDropdown = page.locator("select#workflowID");
//   const statusDropdown = page.locator("select#availability");
//   const addSectionButton = page.locator("div#blank_section_preview button.btn-general");
//   const sectionHeadingTextarea = page.locator("textarea#name");
//   const addQuestionButton = page.locator("button.new_section_question");
//   const questionNameTextarea = page.locator("textarea#name");
//   const formatTypeDropdown = page.locator("select#indicatorType");
//   const homepageLink = page.locator("//a[@href='../']");
//   const newRequestButton = page.locator("(//span[@class='menuButtonSmall'])[2]");
//   const serviceDropdown = page.locator("a.chosen-single").nth(0);
//   const serviceOption = page.locator("//li[@id='service-chosen-search-result-1']");
//   const requestTitleInput = page.locator("input#title");
//   const submitRequestButton = page.locator("(//button[@type='submit'])[1]");
//   const formListCheckboxes = page.locator("label.checkable.leaf_check");
//   const answerInputBox = page.locator("//input[@type='text']");
//   const nextQuestionButton = page.locator("button#nextQuestion2");
//   const finalSubmitRequestButton = page.locator("div#submitControl button.buttonNorm");
//   const goToHomepageButton = page.locator("//a[@title='nav to homepage']");
//   const inboxButton = page.locator("(//span[@class='menuButtonSmall'])[3]");
//   const adminViewButton = page.locator("button#btn_adminView");
//   const inboxHeaderText = page.locator("div#inbox div").first();
//   const activeRequestsList = page.locator("//div[@class='siteFormContainers'] //span");

//   // Variables
//   const adminPortalURL = "https://host.docker.internal/Test_Request_Portal/admin/";
//   const formTitle = "Automated Form";
//   const formDesc = "Automated Test Form Description";
//   const sectionTitle = "Automated Section Heading";
//   const questionText = "Test Question Name";
//   const requestTitle = "Tested Request Title";
//   const userInputAnswer = "Tested Answer automation";
//   // Utility Function
//   async function selectAdminMenuOption(optionName: string) {
//     const allOptions = await adminMenuOptions.allInnerTexts();
//     const optionIndex = allOptions.indexOf(optionName);
//     if (optionIndex !== -1) {
//       await adminMenuOptions.nth(optionIndex).click();
//     } else {
//       throw new Error(`Option "${optionName}" not found.`);
//     }
//   }
//   // Step 1: Navigate to the admin portal
//   await page.goto(adminPortalURL);
//   // Step 2: Open Form Editor
//   await selectAdminMenuOption("Form Editor");
//   await page.waitForResponse((response) => {
//     return (
//       response
//         .url()
//         .includes("https://host.docker.internal/Test_Request_Portal/api/formStack/categoryList/allWithStaples") &&
//       response.status() === 200
//     );
//   });
//   // Step 3: Click on Create Form
//   await createFormButton.click();
//   await formNameInput.waitFor({ state: "visible" });
//   // Step 4: Enter Form Name and Description
//   await formNameInput.fill(formTitle);
//   await formDescriptionTextarea.fill(formDesc);
//   // Step 5: Save the Form
//   await saveButton.click();
//   await page.waitForResponse((response) => {
//     return (
//       response
//         .url()
//         .includes("https://host.docker.internal/Test_Request_Portal/api/formEditor/new") &&
//       response.status() === 200
//     );
//   });
//   await savedFormNameInput.waitFor({ state: "visible" });
//   // Step 6: Verify Form Saved Correctly
//   expect(await savedFormNameInput.inputValue()).toBe(formTitle);
//   expect(await savedFormDescriptionTextarea.inputValue()).toBe(formDesc);
//   console.info("Form Created Successfully");
//   // Step 7: Set Workflow and Status
//   await workflowDropdown.selectOption("1");
//   await statusDropdown.selectOption("1");
//   // Step 8: Add Section
//   await addSectionButton.click();
//   await sectionHeadingTextarea.fill(sectionTitle);
//   await saveButton.click();
//   // Step 9: Add Question to Section
//   await addQuestionButton.click();
//   await questionNameTextarea.fill(questionText);
//   await formatTypeDropdown.selectOption("text");
//   await saveButton.click();
//   // Step 10: Submit a New Request
//   await homepageLink.click();
//   await newRequestButton.waitFor({ state: "visible" });
//   await newRequestButton.click({ force: true });
//   await serviceDropdown.click();
//   await serviceOption.click();
//   await requestTitleInput.fill(requestTitle);
//   await formListCheckboxes.first().waitFor({ state: "visible" });
//   const availableForms = await formListCheckboxes.allInnerTexts();
//   let expectedFormLabel = `${formTitle}  (${formDesc})`.normalize().replace(/\s+/g, ' ').trim();
//   const cleanedFormLabels = availableForms.map(item => item.normalize().replace(/\s+/g, ' ').trim());
//   const formIndex = cleanedFormLabels.indexOf(expectedFormLabel);
//   if (formIndex !== -1) {
//     await formListCheckboxes.nth(formIndex).click();
//     await submitRequestButton.click();
//   } else {
//     throw new Error(`Form "${expectedFormLabel}" is NOT present in the list.`);
    
//   }
//   await answerInputBox.fill(userInputAnswer);
//   await nextQuestionButton.click();
//   await finalSubmitRequestButton.click();
//   console.info("Request has been Submitted Successfully");
//   // Step 11: Verify Request in Inbox
//   await goToHomepageButton.click();
//   await inboxButton.click();
//   await adminViewButton.click();
//   await inboxHeaderText.click();
//   const inboxRequests = await activeRequestsList.allInnerTexts();
//   const requestIndex = inboxRequests.indexOf(formTitle);
//   if (requestIndex !== -1) {
//     console.info(`Form "${formTitle}" is present in the inbox`);
//     console.info(`Verified Request Appears in Inbox After Submission`);

//   } else {
//     throw new Error(`Form "${formTitle}" is NOT present in the inbox.`);
    
//   }
// });

test("Verify Request Appears in Inbox After Submission", async function ({ page }) {
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
  const activeRequestsList = page.locator("//div[@class='siteFormContainers'] //span");

  // Variables
  const adminPortalURL = "https://host.docker.internal/Test_Request_Portal/admin/";
  const formTitle = "Automated Form";
  const formDesc = "Automated Test Form Description";
  const sectionTitle = "Automated Section Heading";
  const questionText = "Test Question Name";
  const requestTitle = "Tested Request Title";
  const userInputAnswer = "Tested Answer automation";

  // Utility Function
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

  // Step 2: Open Form Editor
  await selectAdminMenuOption("Form Editor");
  await page.waitForResponse((res) =>
    res.url().includes("/api/formStack/categoryList/allWithStaples") && res.status() === 200
  );

  // Step 3: Click on Create Form
  await createFormButton.click();
  await formNameInput.waitFor({ state: "visible" });

  // Step 4: Enter Form Name and Description
  await formNameInput.fill(formTitle);
  await formDescriptionTextarea.fill(formDesc);

  // Step 5: Save the Form
  await saveButton.click();
  await page.waitForResponse((res) =>
    res.url().includes("/api/formEditor/new") && res.status() === 200
  );
  await savedFormNameInput.waitFor({ state: "visible" });

  // Step 6: Verify Form Saved Correctly
  expect(await savedFormNameInput.inputValue()).toBe(formTitle);
  expect(await savedFormDescriptionTextarea.inputValue()).toBe(formDesc);

  // Step 7: Set Workflow and Status
  await workflowDropdown.selectOption("1");
  await statusDropdown.selectOption("1");

  // Step 8: Add Section
  await addSectionButton.click();
  await sectionHeadingTextarea.fill(sectionTitle);
  await saveButton.click();

  // Step 9: Add Question to Section
  await addQuestionButton.click();
  await questionNameTextarea.fill(questionText);
  await formatTypeDropdown.selectOption("text");
  await saveButton.click();

  // Step 10: Submit a New Request
  await homepageLink.click();
  await newRequestButton.waitFor({ state: "visible" });
  await newRequestButton.click();
  await serviceDropdown.click();
  await serviceOption.click();
  await requestTitleInput.fill(requestTitle);

  await formListCheckboxes.first().waitFor({ state: "visible", timeout: 10000 });

  const checkboxCount = await formListCheckboxes.count();
  if (checkboxCount === 0) {
    throw new Error("No form checkboxes found — form list failed to render.");
  }
  

  const availableForms = await formListCheckboxes.allInnerTexts();
  const expectedFormLabel = `${formTitle}  (${formDesc})`.toLowerCase().replace(/\s+/g, ' ').trim();
  const cleanedFormLabels = availableForms.map(item =>
    item.toLowerCase().replace(/\s+/g, ' ').trim()
  );
  

  const formIndex = cleanedFormLabels.indexOf(expectedFormLabel);
  if (formIndex !== -1) {
    await formListCheckboxes.nth(formIndex).click();
    await submitRequestButton.click();
  } else {
    throw new Error(`Form "${expectedFormLabel}" is NOT present in the list.`);
  }

  await answerInputBox.fill(userInputAnswer);
  await nextQuestionButton.click();
  await finalSubmitRequestButton.click();
  console.info("Request has been Submitted Successfully");

  // Step 11: Verify Request in Inbox
  await goToHomepageButton.click();
  await inboxButton.click();
  await adminViewButton.click();
  await inboxHeaderText.click();

  const inboxRequests = await activeRequestsList.allInnerTexts();
  const requestIndex = inboxRequests.indexOf(formTitle);
  if (requestIndex !== -1) {
    console.info(`Form "${formTitle}" is present in the inbox`);
  } else {
    throw new Error(`Form "${formTitle}" is NOT present in the inbox.`);
  }
});

test("Verify Request is Removed from Inbox After Form Deletion", async function ({
  page,
}) {
  //Locators
  let availableOptions = page.locator("span.leaf-admin-btntitle");
  let createFormBtn = page.locator("button#createFormButton");
  let formNameLocator = page.locator("input#name");
  let formDescriptionLocator = page.locator("textarea#description");
  let saveBtn = page.locator("button#button_save");
  let savedFormNameLocator = page.locator("input#categoryName");
  let savedDescriptionLocator = page.locator("textarea#categoryDescription");
  let workFlowDrpDwnLocator = page.locator("select#workflowID");
  let statusDrpDwnLocator = page.locator("select#availability");
  let AddSectionBtnLocator = page.locator("div#blank_section_preview button.btn-general");
  let sectionHeadingLocator = page.locator("textarea#name");
  let addNewQuesLocator = page.locator("button.new_section_question");
  let fieldNameLocator = page.locator("textarea#name");
  let formatTypeLocator = page.locator("select#indicatorType");
  let homepageBtnLocator = page.locator("//a[@href='../']");
  let NewRequestBtnLocator = page.locator("(//span[@class='menuButtonSmall'])[2]");
  let serviceDrpDwnLocator = page.locator("a.chosen-single").nth(0);
  let AsServiceLocator = page.locator("//li[@id='service-chosen-search-result-1']");
  let titleOfReqLocator = page.locator("input#title");
  let submitRequestBtnLocator = page.locator("(//button[@type='submit'])[1]");
  let listOfFormsLocator = page.locator("label.checkable.leaf_check");
  let inputBoxLocator = page.locator("//input[@type='text']");
  let nextQuesBtnLocator = page.locator("button#nextQuestion2");
  let submitRequest = page.locator("div#submitControl button.buttonNorm");
  let inboxBtnLocator = page.locator("(//span[@class='menuButtonSmall'])[3]");
  let viewAsAdminBtn = page.locator("button#btn_adminView");
  let inboxText = page.locator("div#inbox div").first();
  let listOfActiveRquestsLocator = page.locator("//div[@class='siteFormContainers'] //span");
  let ActiveFormText = page.locator("//h3[normalize-space()='Active Forms:']");
  let listOfActiveFormsLocator = page.locator("table#active_forms td.form-name a");
  let DeleteTheFormBtn = page.locator("//button[@title='delete this form']");
  let confirmDelete = page.locator("//button[@id='button_save']");
  //Variables
  const URL = "https://host.docker.internal/Test_Request_Portal/admin/";
  let formName = "Scenario Two Form";
  let formDescription = "Scenario Two Form Description";
  let sectionHeading = "Scenario Two Section Heading";
  let questionName = "Test Question Name";
  let TitleOfRequest = "Scenario Two Request Title";
  let inputAnswer = "Scenario Two Tested Answer automation"
  let FormListingPageUrl = "https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/";
  //Utilities Functions
  async function clickOnMainOption(optionName: string) {
    let ExtractedOptionArr = await availableOptions.allInnerTexts();
    let index = ExtractedOptionArr.indexOf(optionName);
    if (index !== -1) {
      await availableOptions.nth(index).click();
    } else {
      throw new Error(`Option "${optionName}" not found.`);
    }
  }
  //Step 1: Navigate to the URL
  await page.goto(URL);
  //Step 2: Click on the Form Editor link
  await clickOnMainOption("Form Editor");
  await page.waitForResponse((response) => {
    return (
      response
        .url()
        .includes(
          "https://host.docker.internal/Test_Request_Portal/api/formStack/categoryList/allWithStaples"
        ) && response.status() === 200
    );
  });
  //Step 3 Click on Create form button
  await createFormBtn.click();
  await formNameLocator.waitFor({ state: "visible" });
  //Step 4: Fill in the form name and description
  await formNameLocator.fill(formName);
  await formDescriptionLocator.fill(formDescription);
  //Step 5: Click on Save button
  await saveBtn.click();
  await page.waitForResponse((response) => {
    return (
      response
        .url()
        .includes(
          "https://host.docker.internal/Test_Request_Portal/api/formEditor/new"
        ) && response.status() === 200
    );
  });
  await savedFormNameLocator.waitFor({ state: "visible" });
  //Step 6: Verify the form is created successfully
  expect(await savedFormNameLocator.inputValue()).toBe(formName);
  expect(await savedDescriptionLocator.inputValue()).toBe(formDescription);
  console.info("Form Created Successfully");

  //Step 7: Select the workflow and status from the dropdowns
  await workFlowDrpDwnLocator.selectOption("1");
  await statusDrpDwnLocator.selectOption("1");
  //Step 8: Add Section to the form
  await AddSectionBtnLocator.click();
  await sectionHeadingLocator.fill(sectionHeading);
  await saveBtn.click();
  //Step 9: Add Question to the section and validate dropdown values
  await addNewQuesLocator.click();
  await fieldNameLocator.fill(questionName);
  await formatTypeLocator.selectOption("text");
  await saveBtn.click();
  console.info("Questions Added Successfully")

  //Step 11: Go to Homepage  and Create New Request
  await homepageBtnLocator.click();
  await NewRequestBtnLocator.waitFor({ state: "visible" });
  await NewRequestBtnLocator.click({ force: true });
  await serviceDrpDwnLocator.click();
  await AsServiceLocator.click();
  await titleOfReqLocator.fill(TitleOfRequest);
  await listOfFormsLocator.first().waitFor({ state: "visible" });
  let listOfForms = await listOfFormsLocator.allInnerTexts();
  let ParsedFormName = formName + "  (" + formDescription + ")";
  ParsedFormName = ParsedFormName.normalize().replace(/\s+/g, ' ').trim();
  let cleanedForms = listOfForms.map(item => item.normalize().replace(/\s+/g, ' ').trim());
  let indexOfForm = cleanedForms.indexOf(ParsedFormName);
  if (indexOfForm !== -1) {
    await listOfFormsLocator.nth(indexOfForm).click();
    await submitRequestBtnLocator.click();
  } else {
    throw new Error(`Form "${ParsedFormName}" is NOT present in the list.`);
    
  }
  await inputBoxLocator.fill(inputAnswer);
  await nextQuesBtnLocator.click();
  await submitRequest.click();
  console.info("Request Submitted Successfully")
  //Step 12: Delete the form from the Form Page
  await page.goto(FormListingPageUrl);
  await ActiveFormText.click();
  let listOfActiveForms = await listOfActiveFormsLocator.allInnerTexts();
  let indexOfActiveForm = listOfActiveForms.indexOf(formName);
  if (indexOfActiveForm !== -1) {
    await listOfActiveFormsLocator.nth(indexOfActiveForm).click();
    await statusDrpDwnLocator.click();
    await DeleteTheFormBtn.waitFor({ state: "visible" });
    await DeleteTheFormBtn.isEnabled();
    await DeleteTheFormBtn.click();
    await confirmDelete.waitFor({ state: "visible" });
    await confirmDelete.dblclick({ force: true });
    await page.locator("div#form_browser_tables h3").nth(0).waitFor({ state: "visible" });
    await page.locator("div#form_browser_tables h3").nth(0).click();
    console.info(`"${formName}" Deleted Successfully`)
  }
  else {
    throw new Error(`Form "${formName}" is NOT present in the Active Forms.`); 
  }
  //Step 13: Validate the form is not present in the inbox after deletion
  await homepageBtnLocator.click();
  await inboxBtnLocator.click();
  await viewAsAdminBtn.click();
  await inboxText.click();
  let listOfActiveRequestsPostDelete = await listOfActiveRquestsLocator.allInnerTexts();
  let indexOfActiveReqestPostDelte = listOfActiveRequestsPostDelete.indexOf(formName);
  if (indexOfActiveReqestPostDelte !== -1) {
    throw new Error(`Form "${formName}" is still present in the inbox after deletion.`);
    
  }
  else {
    console.info(`Form "${formName}" is NOT present in the inbox.`);
    console.info(`Verified Request is Removed from Inbox After Deletion`);
  }
});
