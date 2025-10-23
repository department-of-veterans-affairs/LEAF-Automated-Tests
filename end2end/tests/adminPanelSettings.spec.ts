import { test, expect } from '@playwright/test';

test('change title', async ({ page }) => {
 
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_system');

  let randNum = Math.random();
  let uniqueText = `LEAF Test Site ${randNum}`;
  let leafWithCharsTitle = 'Leaf & Test';
  let facilityWithCharsName = 'Facility & Name';
  let originalLeafTitle = 'Leaf Test Site';
  let originalFacilityName = 'Standard test database';

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
  await page.getByRole('textbox', { name: 'Title of LEAF site' }).fill(leafWithCharsTitle);
  await page.getByRole('textbox', { name: 'Facility Name' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Facility Name' }).fill(facilityWithCharsName);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.locator('#headerDescription')).toContainText(leafWithCharsTitle);
  // Reload the page
  await page.reload();
  
  const element = page.getByRole('textbox', { name: 'Title of LEAF site' });
  element.waitFor();
 
  await expect(page.getByRole('textbox', { name: 'Title of LEAF site' })).toHaveValue(leafWithCharsTitle);
  await expect(page.getByRole('textbox', { name: 'Facility Name' })).toHaveValue(facilityWithCharsName);
  
  //Reset the Settings 
  await page.getByRole('textbox', { name: 'Title of LEAF site' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Title of LEAF site' }).fill(originalLeafTitle);
  await page.getByRole('textbox', { name: 'Facility Name' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Facility Name' }).fill(originalFacilityName);
  await page.getByRole('button', { name: 'Save' }).click();

  // Reload the page
  await page.reload();
});
