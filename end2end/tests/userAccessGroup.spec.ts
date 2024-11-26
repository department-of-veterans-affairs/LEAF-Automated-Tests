import { test, expect } from '@playwright/test';

test('Validate group creation and an employee addition', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_groups');

  // Create a new group
  const createGroupButton = page.getByRole('button', { name: '+ Create group' });
  await createGroupButton.click();

  const groupTitle = page.getByLabel('Group Title');
  await groupTitle.fill('New Test Group 0');

  const saveButton = page.getByRole('button', { name: 'Save' });
  await saveButton.click();

  // Validate that the new group is successfully created and visible
  const newGroup = page.getByRole('heading', { name: 'New Test Group 0' });
  await newGroup.waitFor();
  await expect(newGroup).toBeVisible();

  // Open new group and add an employee
  await newGroup.click();

  const searchInput = page.getByLabel('Search for user to add as');
  await searchInput.fill('test');
  const employeeToAdd = page.getByRole('cell', { name: 'Tester, Tester Product Liaison' });
  await employeeToAdd.click();
  const removeButton = page.getByRole('button', { name: 'Remove' });
  await removeButton.waitFor();
  await saveButton.click();

  // Reload the page to ensure the changes are reflected
  await page.reload();
  await newGroup.click();

  // Validate that the employee appears in the group’s employee table
  const employeeTable = page.locator('#employee_table');
  await employeeTable.waitFor();
  await expect(employeeTable).toHaveText(/Tester, Tester/);
});

test('Validate group import from another leaf site', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_groups');

  const importGroupButton = page.getByRole('button', { name: 'Import group' });
  await importGroupButton.click();

  const importGroupDialog = page.locator('[aria-describedby="import_dialog"]');
  await importGroupDialog.waitFor();

  // Import the group
  const searchLabel = page.getByLabel('Search for user to add as');
  await searchLabel.waitFor();
  await searchLabel.fill('Concrete Shoes');

  const group = page.getByRole('cell', { name: 'Concrete Shoes & kids' });
  await group.waitFor();
  await group.click();

  const importButton = page.getByRole('button', { name: 'Import', exact: true });
  await importButton.click();

  // Verify that the group has been successfully imported
  const importedGroup = page.getByRole('heading', { name: 'Concrete Shoes & Kids' });
  await expect(importedGroup).toBeVisible();
});