import { test, expect } from "@playwright/test";
test('Verify improvements in Form Editor UI and Advanced Formatting behavior', async ({ page }) => {
  
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
  const formattedCodeBtn = page.locator("button#rawNameEditor");
  const numberedListButton = page.locator("//button[@title='Ordered list']");  
  // const saveButton = page.locator("button#button_save");
  const formEditorURL = 'https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/';
  const inputTitle = "This is a test paragraph with list content.";
  
  
  // Go to Form Editor
  await page.goto(formEditorURL);
  await page.waitForResponse((res) =>
    res.url().includes("/api/formStack/categoryList/allWithStaples") && res.status() === 200
  );

  // Choose 'Simple Form'
  await page.getByRole('link', { name: 'Simple form' }).click();
  await expect(page.getByLabel('Form name (39)')).toBeVisible();

  // Verify breadcrumb availability
  const breadcrumbText = await breadcrumb.innerText();
  expect(breadcrumbText).toContain('Admin');

  const coordinatesOfBreadcrumb = await breadcrumb.boundingBox();
  const breadcrumbY = coordinatesOfBreadcrumb ? coordinatesOfBreadcrumb.y : 0;

  // Verify menu options in the navigation bar
  await expect(viewHistoryOption).toBeVisible();
  await expect(customizeWriteAccessBtn).toBeVisible();
  await expect(exportFormBtn).toBeVisible();
  await expect(RestoreField).toBeVisible();
  await expect(deleteFormButton).toBeVisible();
  
  const coordinatesOfNavBar = await navBar.boundingBox();
  const navBarY = coordinatesOfNavBar ? coordinatesOfNavBar.y : 0;

  // Validate breadcrumb is above the NavBar
  expect(breadcrumbY).toBeLessThan(navBarY);

  // Validate delete button is on right side of the NavBar
  const deleteFormButtonPosition = await deleteFormButton.boundingBox();
  const deleteFormButtonX = deleteFormButtonPosition ? deleteFormButtonPosition.x : 0;

  const RestoreFieldPosition = await RestoreField.boundingBox();
  const RestoreFieldX = RestoreFieldPosition ? RestoreFieldPosition.x : 0;
  expect(deleteFormButtonX).toBeGreaterThan(RestoreFieldX);

  await formEditorLink.click();

  // Edit section content and switch to Advanced Formatting view and validate the content is present
  
  await formattedCodeInput.fill(inputTitle);
  await advancedFormattingButton.click();
  await advancedFormattingTab.waitFor({ state: 'visible' });
  expect(await advancedFormattingTab.textContent()).toContain(inputTitle);

  // Verify Bullet List Formatting
  
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

  // Verify Numbered List Formatting

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

  // Save the Form with Advanced Formatting
  // await saveButton.click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('single line text')).toBeVisible();

  
});