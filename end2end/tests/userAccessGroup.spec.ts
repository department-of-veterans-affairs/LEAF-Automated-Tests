import { test, expect } from '@playwright/test';

test('Validate group creation and an employee addition', async ({ page }) => {
  await page.goto('https://host.docker.internal/LEAF_Request_Portal/admin/?a=mod_groups#/');

  // Create a new group
  const createGroupButton = page.getByRole('button', { name: '+ Create group' });
  await createGroupButton.click();

  const groupTitle = page.getByLabel('Group Title');
  await groupTitle.fill('New Test Group 0');

  const saveButton = page.getByRole('button', { name: 'Save' });
  await saveButton.click();

  // Validate the new group is created
  const newGroup = page.getByRole('heading', { name: 'New Test Group 0' });
  await newGroup.waitFor();
  await expect(newGroup).toBeVisible();

  // Click on the new group to add a employee
  await newGroup.click();

  const searchInput = page.getByLabel('Search for user to add as');
  await searchInput.fill('test');

  const employeeToAdd = page.getByRole('cell', { name: 'Tester, Tester Product Liaison' });
  await employeeToAdd.click();

  // Validate remove employee button
  const removeButton = page.getByRole('button', { name: 'Remove' });
  await removeButton.waitFor();

  await saveButton.click();

  const employeeNames = page.getByText('Rhona Goodwin + 1 others');
  await expect(employeeNames).toBeVisible();
});

test('Validate group import from another leaf site', async ({ page }) => {
  await page.goto('https://host.docker.internal/LEAF_Request_Portal/admin/?a=mod_groups#/');

  // import button
  const importGroupButton = page.getByRole('button', { name: 'Import group' });
  await importGroupButton.waitFor();
  await importGroupButton.click();

  // Search for the user to add to the group
  const searchLabel = page.getByLabel('Search for user to add as');
  await searchLabel.waitFor();
  await searchLabel.fill('Concrete Shoes');

  // group
  const group = page.getByRole('cell', { name: 'Concrete Shoes & kids' });
  await group.waitFor();
  await group.click();

  // import button 
  const importButton = page.getByRole('button', { name: 'Import', exact: true });
  await importButton.click();

  const searchBox = page.getByLabel('Filter by group or user name');
  await searchBox.fill('Concrete Shoes & kids');
  await page.keyboard.press('Enter');

  // validate group is added
  const importedGroup = page.getByRole('heading', { name: 'Concrete Shoes & Kids' });
  await expect(importedGroup).toBeVisible();
});