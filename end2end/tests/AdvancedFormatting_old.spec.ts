import { test, expect } from "@playwright/test";
test('Verify improvements in Form Editor UI and Advanced Formatting behavior', async ({ page }) => {
  //  Locators
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
  const breadcrumb = page.locator('#page_breadcrumbs');
  const viewHistoryOption = page.locator("//button[@title='view form history']");
  const customizeWriteAccessBtn = page.locator("//button[@title='Edit Special Write Access']");
  const exportFormBtn = page.locator("//button[@title='export form']");
  const RestoreField = page.locator("//li //a[@class='router-link']");
  const deleteFormButton = page.locator("//button[@title='delete this form']");
  const navBar = page.locator("//nav[@id='top-menu-nav']");
  const formEditorLink = page.locator("(//div[@class='name_and_toolbar form-header'] //button)[1]");
  const formattedCodeInput = page.locator("//textarea[@id='name']");
  const advancedFormattingButton = page.locator("//button[@title='use advanced text editor']");
  const advancedFormattingTab = page.locator("//div[@contenteditable='true']");
  const bulletListButton = page.locator("//button[@title='Unordered list']");
  const numberedListButton = page.locator("//button[@title='Ordered list']");
  const formattedCodeBtn = page.locator("button#rawNameEditor");
  const ActiveForms = page.locator("//div[@id='form_browser_tables']");

  //  Variables
  const adminPortalURL = "https://host.docker.internal/Test_Request_Portal/admin/";
  const formTitle = "Automated Form for Advanced Formatting Test";
  const formDesc = "Automated Test Form Description for Advanced Formatting";
  const sectionTitle = "Automated Section Heading for Advanced Formatting Test";
  const questionText = "Test Question Name for Advanced Formatting";
  const inputTitle = "This is a test paragraph with list content.";

  //  Utility Function
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

  // Step 10: Verify breadcrumb availability
  const breadcrumbText = await breadcrumb.innerText();
  expect(breadcrumbText).toContain('Admin');

  const coordinatesOfBreadcrumb = await breadcrumb.boundingBox();
  const breadcrumbY = coordinatesOfBreadcrumb ? coordinatesOfBreadcrumb.y : 0;

  // Step 11: Verify menu options in the navigation bar
  await expect(viewHistoryOption).toBeVisible();
  await expect(customizeWriteAccessBtn).toBeVisible();
  await expect(exportFormBtn).toBeVisible();
  await expect(RestoreField).toBeVisible();
  await expect(deleteFormButton).toBeVisible();

  const coordinatesOfNavBar = await navBar.boundingBox();
  const navBarY = coordinatesOfNavBar ? coordinatesOfNavBar.y : 0;

  // Step 12: Validate breadcrumb is above the NavBar
  expect(breadcrumbY).toBeLessThan(navBarY);

  // Step 13: Validate delete button is on right side of the NavBar
  const deleteFormButtonPosition = await deleteFormButton.boundingBox();
  const deleteFormButtonX = deleteFormButtonPosition ? deleteFormButtonPosition.x : 0;

  const RestoreFieldPosition = await RestoreField.boundingBox();
  const RestoreFieldX = RestoreFieldPosition ? RestoreFieldPosition.x : 0;
  expect(deleteFormButtonX).toBeGreaterThan(RestoreFieldX);

  await formEditorLink.click();

  // Step 14: Edit section content and switch to Advanced Formatting view and validate the content is present
  await formattedCodeInput.fill(inputTitle);
  await advancedFormattingButton.click();
  await advancedFormattingTab.waitFor({ state: 'visible' });
  expect(await advancedFormattingTab.textContent()).toContain(inputTitle);

  // Step 15: Verify Bullet List Formatting
  await bulletListButton.click();
  await advancedFormattingTab.click();
  await advancedFormattingTab.clear();
  await page.keyboard.type('Bullet item 1');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Bullet item 2');
  await formattedCodeBtn.click();
  await formattedCodeInput.waitFor({ state: 'visible' });
  const formattedCodeText = await formattedCodeInput.inputValue();
  expect(formattedCodeText).toContain('<ul><li>Bullet item 1</li><li>Bullet item 2</li></ul>');

  // Step 16: Verify Numbered List Formatting
  await advancedFormattingButton.click();
  await advancedFormattingTab.waitFor({ state: 'visible' });
  await numberedListButton.click();
  await advancedFormattingTab.click();
  await advancedFormattingTab.clear();
  await page.keyboard.type('Numbered item 1');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Numbered item 2');
  await formattedCodeBtn.click();
  await formattedCodeInput.waitFor({ state: 'visible' });
  const numberedFormattedCodeText = await formattedCodeInput.inputValue();
  expect(numberedFormattedCodeText).toContain('<ol><li>Numbered item 1</li><li>Numbered item 2</li></ol>');

  // Step 17: Save the Form with Advanced Formatting
  await saveButton.click();

  // Step 18: Delete the Form
  await deleteFormButton.click();
  await saveButton.click();
  await ActiveForms.waitFor({ state: 'visible' });
});