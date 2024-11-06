import { test, expect } from '@playwright/test';

test('create a new group', async ({ page }) => {
  await page.goto('https://host.docker.internal/LEAF_Request_Portal/admin/?a=mod_groups#/');
  await page.getByRole('button', { name: '+ Create group' }).click();
  await page.getByLabel('Group Title').fill('New Test Group 0');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('button' , {name: 'Save'})).toBeVisible();
  await page.getByRole('heading', { name: 'New Test Group 0' }).click();
  await page.getByLabel('Search for user to add as').click();
  await page.getByLabel('Search for user to add as').fill('test');
  await page.getByRole('cell', { name: 'users, testing' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('heading', { name: 'New Test Group 0' }).click();
  await page.getByRole('button', { name: 'Remove' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();
  await page.getByRole('heading', { name: 'New Test Group 0' }).click();
  await page.getByRole('button', { name: 'Delete Group' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();
});

