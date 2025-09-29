import { test, expect } from '@playwright/test';

// Docker-optimized waiting function (from primer)
async function dockerWait(page: any, extraBuffer: number = 1000) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(extraBuffer);
}

test('test', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_templates&file=print_form_ajax.tpl');
  // await expect(page.locator('#filename')).toContainText('view_homepage');
  // await page.getByRole('link', { name: 'print_form', exact: true }).click();
  // await page.getByRole('link', { name: 'print_form_ajax', exact: true }).click();
  await expect(page.locator('#filename')).toContainText('print_form_ajax');
  await expect(page.locator('#codeContainer')).toContainText('<!-- form -->');
  await page.getByText('<!-- form -->').click();
  await page.getByLabel('Template Editor coding area.').press('ArrowRight');
  await page.getByLabel('Template Editor coding area.').press('ArrowRight');
  await page.getByLabel('Template Editor coding area.').press('ArrowRight');
  await page.getByLabel('Template Editor coding area.').press('ArrowRight');
  await page.getByLabel('Template Editor coding area.').press('ArrowRight');
  await page.getByLabel('Template Editor coding area.').press('ArrowRight');
  await page.getByLabel('Template Editor coding area.').press('ArrowRight');
  await page.getByLabel('Template Editor coding area.').fill('Testing');

  const initialButtonCount = await page.locator(".file_history_options_container button").count();
  console.log(initialButtonCount);
  
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByRole('button', { name: 'Restore Original' })).toBeVisible();

  const newButtonCount = await page.locator(".file_history_options_container button").count();
  console.log(newButtonCount);
  //await expect(newButtonCount).toBeGreaterThan(initialButtonCount);
  //await expect(page.getByText('There are no history files.')).not.toBeVisible();
 // await page.reload();
  // dockerWait(page, 1500);
  const changeTime = await page.locator('#file_history_container').allInnerTexts();
  console.log(changeTime);
  await page.getByRole('button', { name: 'Restore Original' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();
  
  
});