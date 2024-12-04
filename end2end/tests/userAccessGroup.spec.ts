import { test, expect } from '@playwright/test';

test('Create group and add an employee', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_groups');

  // Generate a unique group name
  let randNum = Math.floor(Math.random() * 10000);
  let uniqueText = `New Test Group ${randNum}`;

  // Create a new group
  const createGroupButton = page.getByRole('button', { name: '+ Create group' });
  await createGroupButton.click();

  const groupTitle = page.getByLabel('Group Title');
  await groupTitle.fill(uniqueText);

  const saveButton = page.getByRole('button', { name: 'Save' });
  await saveButton.click();
  await page.reload();

  const newGroup = page.getByRole('heading', { name: uniqueText });
  await newGroup.waitFor({ state: 'visible' });

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

test('Import a group from another leaf site and delete it', async ({ page }) => {
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
  await group.click();

  const importButton = page.getByRole('button', { name: 'Import', exact: true });
  await importButton.click();

  // Verify that the group has been successfully imported
  const importedGroup = page.getByRole('heading', { name: 'Concrete Shoes & Kids' });
  await expect(importedGroup).toBeVisible();

  await importedGroup.click();

  // Delete group
  const deleteGroupButton = page.getByRole('button', { name: 'Delete Group' });

  await deleteGroupButton.click();
  const yesButton = page.locator('#confirm_button_save');
  await yesButton.click();

  await page.reload();
  await expect(importedGroup).not.toBeVisible();
});