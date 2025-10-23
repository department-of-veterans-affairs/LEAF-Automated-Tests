import { test, expect } from '@playwright/test';

test('change title', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/');

  let randNum = Math.random();
  let uniqueText = `LEAF Test Site ${randNum}`;

  await page.getByRole('button', { name: ' Site Settings Edit site' }).click();

  // This is necessary because the input field starts off empty on this page
  // So we'll wait until the async request populates it
  await expect(page.getByLabel('Title of LEAF site')).not.toBeEmpty();

  await page.getByLabel('Title of LEAF site').click();
  await page.getByLabel('Title of LEAF site').fill(uniqueText);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.locator('#headerDescription')).toContainText(uniqueText);

  //LEAF-5116 Site Setting Input Field shows encoded chars
  //Verify encoded chars does not display

  await page.getByRole('textbox', { name: 'Title of LEAF site' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Title of LEAF site' }).fill('Leaf & Test');
  await page.getByRole('textbox', { name: 'Facility Name' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Facility Name' }).fill('Facility & Name');
  await page.getByRole('button', { name: 'Save' }).click();
  // Reload the page
  await page.reload();

  await expect(page.getByRole('textbox', { name: 'Title of LEAF site' })).toHaveValue('Leaf & Test');
  await expect(page.getByRole('textbox', { name: 'Facility Name' })).toHaveValue('Facility & Name');
  await expect(page.locator('#headerDescription')).toContainText('Leaf & Test');

  //Reset the Settings 
  await page.getByRole('textbox', { name: 'Title of LEAF site' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Title of LEAF site' }).fill('Leaf Test Site');
  await page.getByRole('textbox', { name: 'Facility Name' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Facility Name' }).fill('Standard test database');
  await page.getByRole('button', { name: 'Save' }).click();
  // Reload the page
  await page.reload();
});
