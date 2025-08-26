import { test, expect } from "@playwright/test";

test('Verify breadcrumb and delete button locations', async ({ page }) => {
  
  // Go to Form Editor
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
  
  // Choose 'Simple Form'
  await page.getByRole('link', { name: 'Simple form' }).click();
  await expect(page.getByLabel('Form name (39)')).toBeVisible();

  // Verify breadcrumb availability
  const breadcrumb = page.locator('#page_breadcrumbs');
  const breadcrumbText = await breadcrumb.innerText();
  expect(breadcrumbText).toContain('Admin');

  const coordinatesOfBreadcrumb = await breadcrumb.boundingBox();
  const breadcrumbY = coordinatesOfBreadcrumb ? coordinatesOfBreadcrumb.y : 0;

  // Verify menu options in the navigation bar
  const viewHistoryOption = page.locator("//button[@title='view form history']");
  const customizeWriteAccessBtn = page.locator("//button[@title='Edit Special Write Access']");
  const exportFormBtn = page.locator("//button[@title='export form']");
  const RestoreField = page.locator("//li //a[@class='router-link']");
  const deleteFormButton = page.locator("//button[@title='delete this form']");
  
  await expect(viewHistoryOption).toBeVisible();
  await expect(customizeWriteAccessBtn).toBeVisible();
  await expect(exportFormBtn).toBeVisible();
  await expect(RestoreField).toBeVisible();
  await expect(deleteFormButton).toBeVisible();
  
  const navBar = page.locator("//nav[@id='top-menu-nav']");
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
});

test('Swapping to formatted code does not dissappear after typing in Advanced Formatting', async ( { page }) => {
    
  // Go to Form Editor
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
  
  // Choose 'Simple Form'
  await page.getByRole('link', { name: 'Simple form' }).click();
  await expect(page.getByLabel('Form name (39)')).toBeVisible();

  const formEditorLink = page.locator("(//div[@class='name_and_toolbar form-header'] //button)[1]");
  await formEditorLink.click();

  const formattedCodeBtn = page.locator("button#rawNameEditor");
  const advancedFormattingTab = page.locator("//div[@contenteditable='true']");
  const advancedFormattingButton = page.locator("//button[@title='use advanced text editor']");
  const formattedCodeInput = page.locator("//textarea[@id='name']");
  const inputTitle = "This is a test paragraph with list content.";
  
  await advancedFormattingButton.click();
  await advancedFormattingTab.click();
  await advancedFormattingTab.clear();

  await page.keyboard.type(inputTitle);
  await formattedCodeBtn.click();
  await formattedCodeInput.waitFor({ state: 'visible' });
  const formattedCodeText = await formattedCodeInput.inputValue();
  expect(formattedCodeText).toContain(inputTitle);

});

test('List in Field Name is bulleted when using the Advanced Formatter', async ({ page }) => {

  // Go to Form Editor
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
  
  // Choose 'Simple Form'
  await page.getByRole('link', { name: 'Simple form' }).click();
  await expect(page.getByLabel('Form name (39)')).toBeVisible();

  const formEditorLink = page.locator("(//div[@class='name_and_toolbar form-header'] //button)[1]");
  await formEditorLink.click();

  // Verify Bullet List Formatting
  const bulletListButton = page.locator("//button[@title='Unordered list']");
  const formattedCodeBtn = page.locator("button#rawNameEditor");
  const advancedFormattingTab = page.locator("//div[@contenteditable='true']");
  const advancedFormattingButton = page.locator("//button[@title='use advanced text editor']");
  const formattedCodeInput = page.locator("//textarea[@id='name']");
  
  await advancedFormattingButton.click();
  await advancedFormattingTab.click();
  await advancedFormattingTab.clear();
  await bulletListButton.click();
  
  await page.keyboard.type('Bullet item 1');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Bullet item 2');
  await formattedCodeBtn.click();
  await formattedCodeInput.waitFor({ state: 'visible' });
  const formattedCodeText = await formattedCodeInput.inputValue();
  expect(formattedCodeText).toContain('<ul><li>Bullet item 1</li><li>Bullet item 2</li></ul>');

});

test('List in Field Name is numbered when using the Advanced Formatter', async ({ page }) => {

  // Go to Form Editor
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
  
  // Choose 'Simple Form'
  await page.getByRole('link', { name: 'Simple form' }).click();
  await expect(page.getByLabel('Form name (39)')).toBeVisible();

  const formEditorLink = page.locator("(//div[@class='name_and_toolbar form-header'] //button)[1]");
  await formEditorLink.click();

  // Verify Numbered List Formatting
  const numberedListButton = page.locator("//button[@title='Ordered list']");  
  const advancedFormattingButton = page.locator("//button[@title='use advanced text editor']");
  const advancedFormattingTab = page.locator("//div[@contenteditable='true']");
  const formattedCodeInput = page.locator("//textarea[@id='name']");
  const formattedCodeBtn = page.locator("button#rawNameEditor");

  await advancedFormattingButton.click();
  await advancedFormattingTab.waitFor({ state: 'visible' });
  
  await advancedFormattingTab.click();
  await advancedFormattingTab.clear();
  await numberedListButton.click();

  await page.keyboard.type('Numbered item 1');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Numbered item 2');

  await formattedCodeBtn.click();
  await formattedCodeInput.waitFor({ state: 'visible' });

  const numberedFormattedCodeText = await formattedCodeInput.inputValue();
  expect(numberedFormattedCodeText).toContain('<ol><li>Numbered item 1</li><li>Numbered item 2</li></ol>');

  // await page.getByRole('button', { name: 'Cancel' }).click();
  // await expect(page.getByText('single line text')).toBeVisible();
  
});