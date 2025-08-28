import { test, expect } from '@playwright/test';

const restoreTemplate = async (page:any, currentFileName:string) => {
  await expect(
    page.locator('button#restore_original'),
    `'restore_original' button to be visible because the file ${currentFileName} is customized`
  ).toBeVisible();

  await page.getByRole('button', { name: 'Restore Original' }).click();

  let filePromise = page.waitForResponse(res => res.url().includes(`template/_${currentFileName}`) && res.status() === 200);
  await page.getByRole('button', { name: 'Yes' }).click();
  await filePromise;

  await expect(
    page.locator('button#restore_original'),
    `'restore_original' button to be hidden because the file ${currentFileName} has been restored to original`
  ).toBeHidden();
}

/**
 * Test for LEAF 4960
 * Ensure changes to print_subindicators and print_subindicators_ajax templates are applied
*/
test('Add customization to print_subindicators templates', async ({ page }) => {
  const requestURL = 'https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=966';
  const templateEditorURL = 'https://host.docker.internal/Test_Request_Portal/admin/?a=mod_templates&file=print_subindicators.tpl';

  // Confirm customization has not been added
  await page.goto(requestURL);
  await expect(page.locator('#xhrIndicator_20_1')).toHaveText('test');

  //Go to Template Editor.  file Promises are for load/nav, save and restore.
  let currentFileName:string = "print_subindicators";
  let filePromise = page.waitForResponse(res => res.url().includes(`template/_${currentFileName}`) && res.status() === 200);
  await page.goto(templateEditorURL);
  await filePromise;

  await expect(
    page.locator('button#restore_original'),
    `'restore_original' button to be hidden because the file ${currentFileName} is not customized`
  ).toBeHidden();

  await expect(page.locator('#filename')).toHaveText(currentFileName);
  await expect(page.getByText('<!--{strip}-->')).toBeVisible();
  await page.getByText('<!--{strip}-->').click();
  await page.getByLabel('Template Editor coding area.').press('ArrowLeft');
  await page.getByLabel('Template Editor coding area.').press('ArrowLeft');
  await page.getByLabel('Template Editor coding area.').press('ArrowLeft');
  await page.getByLabel('Template Editor coding area.').press('ArrowLeft');
  await page.getByLabel('Template Editor coding area.').press('ArrowLeft');
  await page.getByLabel('Template Editor coding area.').press('ArrowLeft');
  await page.getByLabel('Template Editor coding area.').press('ArrowLeft');
  await page.getByLabel('Template Editor coding area.').press('ArrowUp');
  await page.getByLabel('Template Editor coding area.').fill('AAAAA');

  filePromise = page.waitForResponse(res => res.url().includes(`template/_${currentFileName}`) && res.status() === 200);
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await filePromise;

  await expect(
    page.locator('button#restore_original'),
    `'restore_original' button to be visible because the file ${currentFileName} has been customized`
  ).toBeVisible();


  // Add 'BBBBB' to the beginning of the print_subindicators_ajax template
  currentFileName = "print_subindicators_ajax";
  filePromise = page.waitForResponse(res => res.url().includes(`template/_${currentFileName}`) && res.status() === 200);
  await page.getByRole('button', { name: currentFileName }).click();
  await filePromise;

  await expect(
    page.locator('button#restore_original'),
    `'restore_original' button to be hidden because the file ${currentFileName} is not customized`
  ).toBeHidden();

  await expect(page.locator('#filename')).toHaveText(currentFileName);
  await expect(page.getByText('<!--{**}-->')).toBeVisible();
  await page.getByText('<!--{**}-->').click();
  await page.getByLabel('Template Editor coding area.').press('ArrowLeft');
  await page.getByLabel('Template Editor coding area.').press('ArrowLeft');
  await page.getByLabel('Template Editor coding area.').press('ArrowLeft');
  await page.getByLabel('Template Editor coding area.').press('ArrowLeft');
  await page.getByLabel('Template Editor coding area.').press('ArrowLeft');
  await page.getByLabel('Template Editor coding area.').press('ArrowUp');
  await page.getByLabel('Template Editor coding area.').fill('BBBBB');
  await page.getByRole('button', { name: 'Save Changes' }).click();

  await expect(
    page.locator('button#restore_original'),
    `'restore_original' button to be visible because the file ${currentFileName} has been customized`
  ).toBeVisible();

  // Confirm the 'AAAAA' and 'BBBBB' are visible on the request
  await page.goto(requestURL);
  await expect(page.locator('#xhrIndicator_20_1')).toContainText('BBBBB test AAAAA');


  // Restore the templates back to their original states
  currentFileName = "print_subindicators";
  filePromise = page.waitForResponse(res => res.url().includes(`template/_${currentFileName}`) && res.status() === 200);
  await page.goto(templateEditorURL);
  await filePromise;

  await restoreTemplate(page, currentFileName);

  currentFileName = "print_subindicators_ajax";
  filePromise = page.waitForResponse(res => res.url().includes(`template/_${currentFileName}`) && res.status() === 200);
  await page.getByRole('button', { name: currentFileName }).click();
  await filePromise;

  await restoreTemplate(page, currentFileName);

  // Confirm the customization has been removed
  await page.goto(requestURL);
  await expect(page.locator('#xhrIndicator_20_1')).toContainText('test');
});