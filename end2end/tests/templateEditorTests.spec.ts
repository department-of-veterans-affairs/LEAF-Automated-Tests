import { test, expect } from '@playwright/test';

const selectAndCustomizeTemplate = async (page:any, fileName:string) => {
  const filePromise = page.waitForResponse(res =>
    res.url().includes(`template/_${fileName}.tpl`) && res.status() === 200
  );
  await page.getByRole('button', { name: fileName, exact: true }).click();
  await filePromise;

  await expect(
    page.locator('button#restore_original'),
    `'restore_original' button to be hidden because the file ${fileName} is not customized`
  ).toBeHidden();

  await expect(
    page.locator('#filename'),
    `the Template Editor header to have the name ${fileName}`
  ).toHaveText(fileName);

  await page.getByLabel('Template Editor coding area.').fill(
    `<div class="custom_${fileName}">${fileName}</div>`
  );

  const savePromise = page.waitForResponse(res =>
    res.url().includes(`templateFileHistory/_${fileName}.tpl`) && res.status() === 200
  );
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await savePromise;

  await expect(
    page.locator('button#restore_original'),
    `'restore_original' button to be visible because the file ${fileName} has been customized`
  ).toBeVisible();
}

const selectAndRestoreTemplate = async (page:any, fileName:string) => {
  let filePromise = page.waitForResponse(res =>
    res.url().includes(`template/_${fileName}.tpl`) && res.status() === 200
  );
  await page.getByRole('button', { name: fileName, exact: true }).click();
  await filePromise;

  await expect(
    page.locator('button#restore_original'),
    `'restore_original' button to be visible because the file ${fileName} is customized`
  ).toBeVisible();

  await page.getByRole('button', { name: 'Restore Original' }).click();

  filePromise = page.waitForResponse(res =>
    res.url().includes(`template/_${fileName}.tpl`) && res.status() === 200
  );
  await page.getByRole('button', { name: 'Yes' }).click();
  await filePromise;

  await expect(
    page.locator('button#restore_original'),
    `'restore_original' button to be hidden because the file ${fileName} has been restored to original`
  ).toBeHidden();
}


/**
 * Ensure changes to print_subindicators and print_subindicators_ajax templates are applied
*/
test('Templates print_subindicators and print_subindicators_ajax can be customized', async ({ page }) => {
  const requestURL:string = 'https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=966';
  //nav from Admin Panel
  const adminPanelURL:string = 'https://host.docker.internal/Test_Request_Portal/admin/';
  //nav from file URL
  const templateEditorPrintSubindicatorsURL:string = 'https://host.docker.internal/Test_Request_Portal/admin/?a=mod_templates&file=print_subindicators.tpl';
  const requestTemplates: Array<string> = [
    "print_subindicators",
    "print_subindicators_ajax",
  ]

  // Confirm customizations have not been added
  await page.goto(requestURL);
  await page.waitForLoadState('domcontentloaded');
  for(let i = 0; i < requestTemplates.length; i++) {
    const templateName = requestTemplates[i];
    await expect(
      page.locator('.custom_' + templateName),
      `custom modification to ${templateName} not to be found in the document`
    ).toHaveCount(0);
  }

  //Go to Template Editor from Admin Panel
  await page.goto(adminPanelURL);

  let filePromise = page.waitForResponse(res =>
    res.url().includes(`template/_`) && res.status() === 200
  );
  await page.getByRole('button', { name: ' Template Editor Edit HTML' }).click();
  await filePromise;

  await expect(
    page.locator('.CodeMirror'),
    'element with class .CodeMirror to be visible because CodeMirror has mounted'
  ).toBeVisible();

  for(let i = 0; i < requestTemplates.length; i++) {
    await selectAndCustomizeTemplate(page, requestTemplates[i]);
  }

  // Confirm customizations are visible on the request
  await page.goto(requestURL);
  await page.waitForLoadState('domcontentloaded');
  for(let i = 0; i < requestTemplates.length; i++) {
    const templateName = requestTemplates[i];
    await expect(
      page.locator('.custom_' + templateName).first(),
      `custom modification to ${templateName} to be found in the document`
    ).toContainText(templateName);
  };

  //Go to Template Editor from template URL, restore templates
  filePromise = page.waitForResponse(res =>
    res.url().includes(`template/_`) && res.status() === 200
  );
  await page.goto(templateEditorPrintSubindicatorsURL);
  await filePromise;

  await expect(
    page.locator('.CodeMirror'),
    'element with class .CodeMirror to be visible because CodeMirror has mounted'
  ).toBeVisible();

  for(let i = 0; i < requestTemplates.length; i++) {
    await selectAndRestoreTemplate(page, requestTemplates[i]);
  }

  // Confirm the customization has been removed
  await page.goto(requestURL);
  await page.waitForLoadState('domcontentloaded');
  for(let i = 0; i < requestTemplates.length; i++) {
    const templateName = requestTemplates[i];
    await expect(
      page.locator('.custom_' + templateName),
      `custom modification to ${templateName} not to be found in the document`
    ).toHaveCount(0);
  }
});