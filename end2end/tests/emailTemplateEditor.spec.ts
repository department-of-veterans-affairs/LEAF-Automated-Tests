import { test, expect } from '@playwright/test';

test('Save Body Contents using Ctrl+S', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_templates_email&file=CustomEvent_event_valid_edited_body.tpl&name=test+edited+event+description&subjectFile=CustomEvent_event_valid_edited_subject.tpl&emailToFile=CustomEvent_event_valid_edited_emailTo.tpl&emailCcFile=CustomEvent_event_valid_edited_emailCc.tpl');
  await page.getByText('The following request requires your review. Please review your inbox at: {{$').fill('');
  await expect(page.getByRole('button', { name: 'Restore Original' })).not.toBeVisible();
  await page.locator('.trumbowyg-editor').click();
  await page.locator('.trumbowyg-editor').fill('Testing 123');
  await page.keyboard.press('ControlOrMeta+KeyS');
  await expect(page.locator('#codeContainer')).toContainText('Testing 123');
  await page.getByRole('heading', { name: 'Email Template Editor' }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Restore Original' })).toBeVisible();
  await page.getByRole('button', { name: 'Restore Original' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();
});

test('Add Variable Using Dropdown', async ({ page }) => {
 
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_templates_email&file=CustomEvent_event_valid_edited_body.tpl&name=test+edited+event+description&subjectFile=CustomEvent_event_valid_edited_subject.tpl&emailToFile=CustomEvent_event_valid_edited_emailTo.tpl&emailCcFile=CustomEvent_event_valid_edited_emailCc.tpl');
  await page.getByText('The following request requires your review. Please review your inbox at: {{$').fill('');
  await page.getByRole('button', { name: 'Variables' }).click();
  await page.getByRole('button', { name: 'formType' }).click();
  await expect(page.locator('#codeContainer')).toContainText('{{$formType}}');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.getByRole('button', { name: 'Restore Original' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();
});

test('Receive Error Message When Variable Format is Incorrect', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_templates_email&file=CustomEvent_event_valid_edited_body.tpl&name=test+edited+event+description&subjectFile=CustomEvent_event_valid_edited_subject.tpl&emailToFile=CustomEvent_event_valid_edited_emailTo.tpl&emailCcFile=CustomEvent_event_valid_edited_emailCc.tpl');
  await page.getByText('The following request requires your review. Please review your inbox at: {{$').fill('');
  await page.locator('.trumbowyg-editor').click();
  await page.locator('.trumbowyg-editor').fill('{{formType}}');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByText('Potential Variable errors in Body: {{formType}} Example: {{$variable}}')).toBeVisible();
  await page.getByRole('button', { name: 'Restore Original' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();
});

test('Email Templates Listed Alphabetically', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_templates_email&file=CustomEvent_event_valid_edited_body.tpl&name=test+edited+event+description&subjectFile=CustomEvent_event_valid_edited_subject.tpl&emailToFile=CustomEvent_event_valid_edited_emailTo.tpl&emailCcFile=CustomEvent_event_valid_edited_emailCc.tpl');
  
  // Check that Custom Events is in alphabetical order
  const customListHeader = await page.locator('//*[@id="fileList"]/div[1]');
  await expect(await customListHeader.innerText()).toEqual("Custom Events");

  const customListLocator = await page.locator('//*[@id="fileList"]/ul[1]');
 
  const customListItems = await customListLocator.locator('li > div > a').allTextContents();
  const customLowerCaseList = customListItems.map(el => el.toLowerCase());

  const customListCopy = [...customLowerCaseList];
  customLowerCaseList.sort();

  await expect(customListCopy).toEqual(customLowerCaseList);

  // Check that Standard Events is in alphabetical order
  const standardListHeader = await page.locator('//*[@id="fileList"]/div[2]');
  await expect(await standardListHeader.innerText()).toEqual("Standard Events");

  const standardListLocator = await page.locator('//*[@id="fileList"]/ul[2]');
  //console.log(await standardListLocator.innerHTML());

  const standardListItems = await standardListLocator.locator('li > div > a').allTextContents();
  const standardLowerCaseList = standardListItems.map(el => el.toLowerCase());
  
  const standardListCopy = [...standardLowerCaseList];
  standardLowerCaseList.sort();
  await expect(standardListCopy).toEqual(standardLowerCaseList);


  

  
  
  
  

});