import { test, expect } from '@playwright/test';

test('Files With Prefix LEAF_ Are Not Allowed', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Nexus/admin/?a=mod_templates_reports');

  // Create new file with name "LEAF_hello_world"
  await page.getByRole('button', { name: 'New File' }).click();
  await page.getByLabel('Filename:').click();
  await page.getByLabel('Filename:').fill('LEAF_hello_world');

  // Confirm that a dialog box with the message "Invalid or reserved name"
  // pops up after clicking "Save"
  page.once('dialog', async dialog => {
    //console.log(`Dialog message: ${dialog.message()}`);
    expect(dialog.message()).toContain('Invalid or reserved name.');
    await dialog.dismiss();
  });

  // Click Save 
  await page.getByRole('button', { name: 'Save Change' }).click();

  //await page.getByRole('link', { name: 'Main Page Main Page' }).click();
});