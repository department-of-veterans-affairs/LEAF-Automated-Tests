import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://host.docker.internal/LEAF_Request_Portal/admin/?a=mod_groups#/');
});

test.afterAll(async ({ page }) => {
  await page.close();
});

test('Validate if the user is able to create a new group and add a user', async ({ page }) => {
  await page.getByRole('button', { name: '+ Create group' }).click();
  await page.getByLabel('Group Title').fill('New Test Group 0');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('heading', { name: 'New Test Group 0' })).toBeVisible();
  await page.getByRole('heading', { name: 'New Test Group 0' }).click();
  await page.getByLabel('Search for user to add as').fill('test');
  await page.getByRole('cell', { name: 'Tester, Tester Product Liaison' }).click();
  const removeBtn = page.getByRole('button', { name: 'Remove' });
  await removeBtn.waitFor();
  await page.getByRole('button', { name: 'Save' }).click();
  await page.reload();
});

test('Validate if the user is able to view the new group in the group history', async ({ page }) => {
  await page.getByRole('button', { name: 'Show group history' }).click();
  await expect(page.locator('tbody')).toContainText('Tester Tester added new group: New Test Group 0');
  await page.getByRole('button', { name: 'Close' }).click();
});

test('Validate if the user is able to search for the new group in User groups', async ({ page }) => {
  await page.getByRole('link', { name: 'User groups' }).click();
  await page.getByLabel('Filter by group or user name').fill('New Test Group 0');
  await page.keyboard.press('Enter');
  await expect(page.locator('text=New Test Group 0')).toBeVisible();
});

test('Validate if the user is able to view the group history', async ({ page }) => {
  await page.getByLabel('Filter by group or user name').fill('New Test Group 0');
  await expect(page.locator('text=New Test Group 0')).toBeVisible();
  await page.getByRole('heading', { name: 'New Test Group' }).click();
  await page.getByRole('button', { name: 'View History' }).click();
  await expect(page.locator('#xhr')).toContainText('View History');
  await expect(page.locator('#historyName')).toContainText('Group Name: New Test Group 0');
  await page.getByLabel('Group history').getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
});

test('Validate if the user is able to add the user in Nexus', async ({ page }) => {
  await page.getByRole('heading', { name: 'New Test Group' }).click();
  await page.getByRole('button', { name: 'Add to Nexus' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();
  await page.reload();
  await page.getByText('New Test Group 0 ').click();
  await expect(page.getByRole('table')).toContainText('✔');
  await page.getByRole('button', { name: 'Close' }).click();
});

test('Validate if the user is able to search for System Admin in the System administrators', async ({ page }) => {
  await page.getByRole('link', { name: 'System administrators (2)' }).click();
  await page.getByLabel('Filter by group or user name').fill('sysa');
  await page.keyboard.press('Enter');
  await expect(page.locator('#groupTitle1')).toContainText('sysadmin');
})

test('Validate if the user is able to add a new admin in System Admin', async ({ page }) => {
  const sysadmin = page.locator('#adminList');
  await sysadmin.click();
  const searchBox = page.getByLabel('Search for user to add as');
  await searchBox.waitFor({ state: 'visible' });
  await searchBox.click();
  await searchBox.fill('carroll');
  const employeeRow = page.locator('tr.employeeSelector:has-text("Carroll, Zoila Lind.")');
  await employeeRow.waitFor({ state: 'visible' });
  await employeeRow.click();
  const saveButton = page.getByRole('button', { name: 'Save' });
  await saveButton.waitFor({ state: 'visible' });
  await saveButton.click();
  const membersText = page.locator('text=Zoila Carroll + 1 others');
  await membersText.waitFor({ state: 'visible' });
  await sysadmin.click();
  const adminSummary = page.locator('#adminSummary');
  await adminSummary.waitFor({ state: 'visible' });
  await expect(adminSummary).toContainText('Carroll, Zoila');
});

test('Validate if the user is able to find the new admin in the primary admin', async ({ page }) => {
  await page.getByRole('heading', { name: 'Primary Admin' }).click();
  await page.locator('#employeeSelectorDropdown').selectOption('vtrofbrebekah');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('heading', { name: 'Primary Admin' }).click();
  await expect(page.locator('#employeeSelectorDropdown')).toContainText('Unset (No Primary Admin selected)Carroll, ZoilaTester, Tester');
  await page.getByRole('button', { name: 'Close' }).click();
});

test('Validate if the user is able to see primary admin histroy', async ({ page }) => {
  await page.getByRole('heading', { name: 'Primary Admin' }).click();
  await expect(page.getByRole('button', { name: 'View History' })).toBeVisible();
  await page.getByRole('button', { name: 'View History' }).click();
  await expect(page.locator('#historyName')).toContainText('Primary Admin History');
  await page.getByLabel('Group history').getByRole('button', { name: 'Close' }).click();
});

test('Validate if the user is able to remove an admin from System Admin', async ({ page }) => {
  const sysadmin = page.locator('#adminList');
  await sysadmin.click();
  await page.getByLabel('REMOVE Carroll, Zoila').click();
  await page.reload();
  await sysadmin.click();
  await expect(page.locator('#adminSummary')).not.toContainText('Carroll, Zoila');
  await page.getByRole('button', { name: 'Close' }).click();
});

test('Validate if the user is able to import a group', async ({ page }) => {
  await page.getByRole('button', { name: 'Import group' }).click();
  await page.getByLabel('Search for user to add as').fill('copper');
  await page.getByRole('cell', { name: 'Copper Books' }).click();
  await page.getByRole('button', { name: 'Import', exact: true }).click();
  await page.getByLabel('Filter by group or user name').fill('copper Books');
  await page.keyboard.press('Enter');
  await expect(page.locator('#groupTitle183')).toContainText('Copper Books');
})

test('Validate if the user is able to delete the group and remove the user', async ({ page }) => {
  await page.getByRole('heading', { name: 'New Test Group 0' }).click();
  await page.getByRole('button', { name: 'Remove' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();
  await expect(page.getByRole('cell', { name: 'users, testing' })).not.toBeVisible();
  await page.getByRole('heading', { name: 'New Test Group 0' }).click();
  await page.getByRole('button', { name: 'Delete Group' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'New Test Group 0' })).not.toBeVisible();
});
