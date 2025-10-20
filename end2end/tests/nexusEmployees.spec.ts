import { test, expect } from '@playwright/test';

test('Names of which employee serves as a backup for are links that open in a new tab', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Nexus/?a=view_employee&empUID=1');
  await expect(page.getByText('Tester Tester serves as a backup for')).toBeVisible();

  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Tracy O\'Hane' }).click();
  const page1 = await page1Promise;

  await expect(page1).toHaveURL('https://host.docker.internal/Test_Nexus/?a=view_employee&empUID=2');
  await expect(page1.getByText('Backup for Tracy O\'Hane')).toBeVisible();
  await page1.close();
});

test('Names which are backups for the employee are links that open in a new tab', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Nexus/?a=view_employee&empUID=1');
  await expect(page.getByText('Backup for Tester Tester')).toBeVisible();

  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Rhona Goodwin' }).click();
  const page1 = await page1Promise;

  await expect(page1).toHaveURL('https://host.docker.internal/Test_Nexus/?a=view_employee&empUID=39');
  await expect(page1.getByText('Rhona Goodwin serves as a backup for')).toBeVisible();
  await page1.close();
});

test('Add a new backup and open that person in a new tab', async ({ page }) => {
  
  let backupAdded = false;

  try {
    const awaitEmployeeInfo = page.waitForResponse(res =>
      res.url().includes('ajaxEmployee') && res.status() === 200
    );
    await page.goto('https://host.docker.internal/Test_Nexus/?a=view_employee&empUID=1');
    await awaitEmployeeInfo;
    await page.getByRole('button', { name: 'Assign Backup' }).click();
    
    await page.getByLabel('Search for user to add as').fill('a');
    await page.getByRole('cell', { name: 'Altenwerth, Ernest Bernier.' }).click();
    await page.getByRole('button', { name: 'Save Change' }).click();
    backupAdded = true;
    await expect(page.getByRole('link', { name: 'Ernest Altenwerth' })).toBeVisible();

    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Ernest Altenwerth' }).click();
    const page1 = await page1Promise;
    await expect(page1.getByText('Ernest Altenwerth serves as a backup for')).toBeVisible();
    page1.close();

  } finally {
    if(backupAdded) {
      await page.locator('#backup_88').getByRole('link', { name: 'Remove' }).click();
      await page.getByRole('button', { name: 'Yes', exact: true }).click();
    }
  }
});