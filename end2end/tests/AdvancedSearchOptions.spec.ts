import { test, expect } from '@playwright/test';
test.describe.configure({ mode: 'serial' });
test('Verify that fields with short labels are grouped under correct form', async ({ page }) => {
  // Locators
  const adminMenuOptions = page.locator("span.leaf-admin-btntitle");
  const createFormButton = page.locator("button#createFormButton");
  const formNameInput = page.locator("input#name");
  const formDescriptionInput = page.locator("textarea#description");
  const saveButton = page.locator("button#button_save");
  const savedFormNameInput = page.locator("input#categoryName");
  const savedFormDescriptionInput = page.locator("textarea#categoryDescription");
  const workflowDropdown = page.locator("select#workflowID");
  const statusDropdown = page.locator("select#availability");
  const addSectionButton = page.locator("div#blank_section_preview button.btn-general");
  const sectionHeadingInput = page.locator("textarea#name");
  const addQuestionButton = page.locator("button.new_section_question");
  const questionLabelInput = page.locator("textarea#name");
  const questionShortLabelInput = page.locator("#description");
  const formatDropdown = page.locator("select#indicatorType");

  // Constants
  const adminPortalUrl = "https://host.docker.internal/Test_Request_Portal/admin/";
  const formTitle = "Advanced Search Form";
  const formDescription = "Form to test fields with short labels";
  const sectionTitle = "Section One";
  const questions = [
    { longLabel: "What is your department?", shortLabel: "Department" },
    { longLabel: "What is your Location?", shortLabel: "Location" },
    { longLabel: "Who is your Manager?", shortLabel: "Manager" },
  ];

  // Utility: Select option from Admin menu
  async function selectAdminMenu(optionText: string): Promise<void> {
    const menuItems = await adminMenuOptions.allInnerTexts();
    const index = menuItems.indexOf(optionText);
    if (index === -1) throw new Error(`Menu option "${optionText}" not found`);
    await adminMenuOptions.nth(index).click();
  }

  // Step 1: Navigate to admin portal
  await page.goto(adminPortalUrl);

  // Step 2: Open Form Editor
  await selectAdminMenu("Form Editor");
  await page.waitForResponse(res =>
    res.url().includes("/api/formStack/categoryList/allWithStaples") && res.status() === 200
  );

  // Step 3: Create a new form
  await createFormButton.click();
  await formNameInput.waitFor({ state: "visible" });
  await formNameInput.fill(formTitle);
  await formDescriptionInput.fill(formDescription);
  await saveButton.click();
  await page.waitForResponse(res =>
    res.url().includes("/api/formEditor/new") && res.status() === 200
  );
  await savedFormNameInput.waitFor({ state: "visible" });

  // Step 4: Validate form is created
  expect(await savedFormNameInput.inputValue()).toBe(formTitle);
  expect(await savedFormDescriptionInput.inputValue()).toBe(formDescription);
  console.info("✅ Form created successfully.");

  // Step 5: Set workflow and status
  await workflowDropdown.selectOption("1");
  await statusDropdown.selectOption("1");

  // Step 6: Add section
  await addSectionButton.click();
  await sectionHeadingInput.fill(sectionTitle);
  await saveButton.click();
  console.info("✅ Section added successfully.");

  // Step 7: Add questions
  for (const q of questions) {
    await addQuestionButton.click();
    await questionLabelInput.fill(q.longLabel);
    await questionShortLabelInput.fill(q.shortLabel);
    await formatDropdown.selectOption("text");
    await saveButton.click();
    console.info(`✅ Question added: ${q.shortLabel}`);
  }

  // Step 8: Navigate to advanced search to validate grouping
  await page.goto('https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJBghmXEAGhDQDsM0BjfAeygEkARbAVmJFoAdo6psAPBxj4qAC2wBOAAyyOAc3wRsAQQByLAL5F0WRDggAbCJCwluvMPWwBeYaImJpJRZFUaQmgLokAVrXIEFB8QOHowJGBtEHkTJnxCFBAAFg4ARjSOdhDDNBg0CMQ02WcQXPywAHkAM2q4EyRpTSA%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAgBZmtBvjABZAK4kiAAhLQyy5GQAeHam3Qc8ARl79YCFBhwzjxyfUatoAc3Kr1mnXtbt8AJjNICyFrUTAAVgdpAgA5eQZ0BGYDIwBmbgBdIA%3D%3D&sort=N4Ig1gpgniBcIFYQBoQHsBOATCG4hwGcBjEAXyA%3D');
  const modifySearchBtn = page.locator('#editReport');
  await modifySearchBtn.click();
  await page.locator('div.chosen-container-single').nth(0).click();

  // Step 9: Extract and group dropdown options
  const groupedResults = await page.evaluate(() => {
    const elements = document.querySelectorAll('li.group-result, li.group-option');
    const result: { group: string; options: string[] }[] = [];
    let currentGroup: { group: string; options: string[] } | null = null;

    elements.forEach(el => {
      const text = el.textContent?.trim() ?? "";
      if (el.classList.contains('group-result')) {
        currentGroup = { group: text, options: [] };
        result.push(currentGroup);
      } else if (el.classList.contains('group-option') && currentGroup) {
        currentGroup.options.push(text);
      }
    });

    return result;
  });

  // Step 10: Validate extracted group and fields
  const matchingGroup = groupedResults.find(g => g.group === formTitle);
  expect(matchingGroup, `Group "${formTitle}" not found in dropdown`).toBeDefined();

  const expectedShortLabels = questions.map(q => q.shortLabel);
  expect(matchingGroup!.options).toEqual(expect.arrayContaining(expectedShortLabels));
  console.info("✅ Grouped fields validated successfully under:", formTitle);

});




test('Verify that fields without short labels show full labels under correct form', async ({ page }) => {
  // Locators
  const adminMenuOptions = page.locator("span.leaf-admin-btntitle");
  const createFormButton = page.locator("button#createFormButton");
  const formNameInput = page.locator("input#name");
  const formDescriptionInput = page.locator("textarea#description");
  const saveButton = page.locator("button#button_save");
  const savedFormNameInput = page.locator("input#categoryName");
  const savedFormDescriptionInput = page.locator("textarea#categoryDescription");
  const workflowDropdown = page.locator("select#workflowID");
  const statusDropdown = page.locator("select#availability");
  const addSectionButton = page.locator("div#blank_section_preview button.btn-general");
  const sectionHeadingInput = page.locator("textarea#name");
  const addQuestionButton = page.locator("button.new_section_question");
  const questionLabelInput = page.locator("textarea#name");
  const questionShortLabelInput = page.locator("#description");
  const formatDropdown = page.locator("select#indicatorType");

  // Constants - Unique Test Data
  const adminPortalUrl = "https://host.docker.internal/Test_Request_Portal/admin/";
  const formTitle = "No Short Label Form";
  const formDescription = "Form to test fields without short labels";
  const sectionTitle = "Section Alpha";
  const questions = [
    { longLabel: "Enter your employee ID" },
    { longLabel: "What is your current role?" },
    { longLabel: "Provide your office location" },
  ];

  // Utility
  async function selectAdminMenu(optionText: string): Promise<void> {
    const menuItems = await adminMenuOptions.allInnerTexts();
    const index = menuItems.indexOf(optionText);
    if (index === -1) throw new Error(`Menu option "${optionText}" not found`);
    await adminMenuOptions.nth(index).click();
  }

  // Step 1: Navigate to admin portal
  await page.goto(adminPortalUrl);

  // Step 2: Open Form Editor
  await selectAdminMenu("Form Editor");
  await page.waitForResponse(res =>
    res.url().includes("/api/formStack/categoryList/allWithStaples") && res.status() === 200
  );

  // Step 3: Create a new form
  await createFormButton.click();
  await formNameInput.waitFor({ state: "visible" });
  await formNameInput.fill(formTitle);
  await formDescriptionInput.fill(formDescription);
  await saveButton.click();
  await page.waitForResponse(res =>
    res.url().includes("/api/formEditor/new") && res.status() === 200
  );
  await savedFormNameInput.waitFor({ state: "visible" });

  // Step 4: Validate form is created
  expect(await savedFormNameInput.inputValue()).toBe(formTitle);
  expect(await savedFormDescriptionInput.inputValue()).toBe(formDescription);
  console.info("✅ Form without short labels created successfully.");

  // Step 5: Set workflow and status
  await workflowDropdown.selectOption("1");
  await statusDropdown.selectOption("1");

  // Step 6: Add section
  await addSectionButton.click();
  await sectionHeadingInput.fill(sectionTitle);
  await saveButton.click();
  console.info("✅ Section added successfully.");

  // Step 7: Add questions without short labels
  for (const q of questions) {
    await addQuestionButton.click();
    await questionLabelInput.fill(q.longLabel);
    await questionShortLabelInput.fill(""); // Intentionally left blank
    await formatDropdown.selectOption("text");
    await saveButton.click();
    console.info(`✅ Question added: ${q.longLabel}`);
  }

  // Step 8: Navigate to advanced search to validate grouping
  await page.goto('https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJBghmXEAGhDQDsM0BjfAeygEkARbAVmJFoAdo6psAPBxj4qAC2wBOAAyyOAc3wRsAQQByLAL5F0WRDggAbCJCwluvMPWwBeYaImJpJRZFUaQmgLokAVrXIEFB8QOHowJGBtEHkTJnxCFBAAFg4ARjSOdhDDNBg0CMQ02WcQXPywAHkAM2q4EyRpTSA%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAgBZmtBvjABZAK4kiAAhLQyy5GQAeHam3Qc8ARl79YCFBhwzjxyfUatoAc3Kr1mnXtbt8AJjNICyFrUTAAVgdpAgA5eQZ0BGYDIwBmbgBdIA%3D%3D&sort=N4Ig1gpgniBcIFYQBoQHsBOATCG4hwGcBjEAXyA%3D');
  const modifySearchBtn = page.locator('#editReport');
  await modifySearchBtn.click();
  await page.locator('div.chosen-container-single').nth(0).click();

  // Step 9: Extract and group dropdown options
  const groupedResults = await page.evaluate(() => {
    const elements = document.querySelectorAll('li.group-result, li.group-option');
    const result: { group: string; options: string[] }[] = [];
    let currentGroup: { group: string; options: string[] } | null = null;

    elements.forEach(el => {
      const text = el.textContent?.trim() ?? "";
      if (el.classList.contains('group-result')) {
        currentGroup = { group: text, options: [] };
        result.push(currentGroup);
      } else if (el.classList.contains('group-option') && currentGroup) {
        currentGroup.options.push(text);
      }
    });

    return result;
  });

  // Step 10: Validate extracted group and fields by long label
  const matchingGroup = groupedResults.find(g => g.group === formTitle);
  expect(matchingGroup, `Group "${formTitle}" not found in dropdown`).toBeDefined();

  const expectedLongLabels = questions.map(q => q.longLabel);
  expect(matchingGroup!.options).toEqual(expect.arrayContaining(expectedLongLabels));
  console.info("✅ Grouped fields validated successfully by long label under:", formTitle);
});