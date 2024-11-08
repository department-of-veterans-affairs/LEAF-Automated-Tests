import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://host.docker.internal/LEAF_Request_Portal/admin/?a=mod_groups#/');
});

test('create a new group and add a user', async ({ page }) => {
  await page.getByRole('button', { name: '+ Create group' }).click();
  await page.getByLabel('Group Title').fill('New Test Group 0');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('heading', { name: 'New Test Group 0' })).toBeVisible();
  await page.getByRole('heading', { name: 'New Test Group 0' }).click();
  await page.getByLabel('Search for user to add as').fill('test');
  // await page.getByRole('cell', { name: 'users, testing' }).click();
  await page.getByRole('cell', { name: 'Tester, Tester Product Liaison' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(5000)
});

test('Check the group is shown in the group history', async ({ page }) => {
  await page.getByRole('button', { name: 'Show group history' }).click();
  await expect(page.locator('tbody')).toContainText('Tester Tester added new group: New Test Group 0');
  await page.getByRole('button', { name: 'Close' }).click();
});

test('check if the user is abel to for the newly created group in the User groups (21)', async ({ page }) => {
  await page.getByRole('link', { name: 'User groups' }).click();
  await page.getByLabel('Filter by group or user name').fill('New Test Group 0');
  await expect(page.locator('text=New Test Group 0')).toBeVisible();
});

test('check if the user is abel to view the history ', async ({ page }) => {
  await page.getByLabel('Filter by group or user name').fill('New Test Group 0');
  await expect(page.locator('text = New Test Group 0')).toBeVisible();
  await page.getByRole('heading', { name: 'New Test Group' }).click();
  await page.getByRole('button', { name: 'View History' }).click();
  await expect(page.locator('#xhr')).toContainText('View History');
  await expect(page.locator('#historyName')).toContainText('Group Name: New Test Group 0');
  await page.getByLabel('Group history').getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
});

test('Delete the group and the remove the user', async ({ page }) => {
  await page.getByRole('heading', { name: 'New Test Group 0' }).click();
  await page.getByRole('button', { name: 'Remove' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();
  await expect(page.getByRole('cell', { name: 'users, testing' })).not.toBeVisible();
  await page.getByRole('heading', { name: 'New Test Group 0' }).click();
  await page.getByRole('button', { name: 'Delete Group' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();
  await expect(page.getByRole('heading', { name: 'New Test Group 0' })).not.toBeVisible();
});
