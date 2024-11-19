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

test('Validate user group search', async ({ page }) => {
  await page.goto('https://host.docker.internal/LEAF_Request_Portal/admin/?a=mod_groups#/');

  // user groups link
  const userGroupsLink = page.getByRole('link', { name: 'User groups' });
  await userGroupsLink.waitFor();
  await userGroupsLink.click();

  // Fill in the search box and press Enter
  const searchBox = page.getByLabel('Filter by group or user name');
  await searchBox.fill('Granite Baby ');
  await page.keyboard.press('Enter');

  // Wait for the group to be visible and verify
  const group = page.getByText('Granite Baby ');
  await group.waitFor();
  await expect(group).toBeVisible();
});

test('Validate multiple employees addition', async ({ page }) => {
  await page.goto('https://host.docker.internal/LEAF_Request_Portal/admin/?a=mod_groups#/');

  // Open Group A
  const group = page.getByRole('heading', { name: 'Group A' });
  await group.click();

  // Add first employee: Altenwerth, Ernest
  const searchBox = page.getByLabel('Search for user to add as');
  await searchBox.fill('Altenwerth, Ernest');
  const firstEmployee = page.getByRole('cell', { name: 'Altenwerth, Ernest Bernier.' });
  await firstEmployee.waitFor();
  await firstEmployee.click();

  // Add second employee: Aufderhar, Irwin Carroll
  await searchBox.fill('Aufderhar');
  const secondEmployee = page.getByRole('cell', { name: 'Aufderhar, Irwin Carroll.' });
  await secondEmployee.waitFor();
  await secondEmployee.click();

  // Ensure that the employee removal buttons are visible
  await expect(page.locator('#removeTempMember_2')).toBeVisible();
  await expect(page.locator('#removeTempMember_3')).toBeVisible();

  // Save the group changes
  const saveButton = page.getByRole('button', { name: 'Save' });
  await saveButton.click();

  // Verify that the summary text indicates employees were added
  const addedEmployeesSummary = page.getByText('Ernest Altenwerth + 1 others');
  await addedEmployeesSummary.waitFor();
  await group.click();

  // Verify that the added employees are listed in the employee table
  const employeesTable = page.getByRole('table');
  await expect(employeesTable).toContainText('Altenwerth, Ernest');
  await expect(employeesTable).toContainText('Aufderhar, Irwin');

  // Close the group
  const closeButton = page.getByRole('button', { name: 'Close' });
  await closeButton.click();
});

test('Validate employees addition to Nexus', async ({ page }) => {
  await page.goto('https://host.docker.internal/LEAF_Request_Portal/admin/?a=mod_groups#/');

  // // Create a new group: Nexus Addition Test Group
  const createGroupButton = page.getByRole('button', { name: '+ Create group' });
  await createGroupButton.click();

  const groupTitle = page.getByLabel('Group Title');
  await groupTitle.fill('Nexus Addition Test Group');

  const saveButton = page.getByRole('button', { name: 'Save' });
  await saveButton.click();

  // Validate new group is created
  const newGroup = page.getByRole('heading', { name: 'Nexus Addition Test Group' });
  await newGroup.waitFor();
  await expect(newGroup).toBeVisible();

  // Open the new group to add an employee
  await newGroup.click();

  const searchInput = page.getByLabel('Search for user to add as');
  await searchInput.fill('Antone Upton');

  const employeeToAdd = page.getByRole('cell', { name: 'Upton, Antone Gulgowski.' });
  await employeeToAdd.click();

  // Validate that the remove employee button is visible
  const removeButton = page.getByRole('button', { name: 'Remove' });
  await removeButton.waitFor();

  // save changes
  await saveButton.click();

  // // Validate that the employee is added to the group
  const employeeName = page.getByText('Antone Upton').first();
  await employeeName.waitFor();
  await newGroup.click();

  // Add the employee to Nexus
  const addToNexusButton = page.getByRole('button', { name: 'Add to Nexus' });
  await addToNexusButton.waitFor();
  await addToNexusButton.click();

  const yesButton = page.getByRole('button', { name: 'Yes' });
  await yesButton.waitFor();
  await yesButton.click();

  // Reload the page
  await page.reload();

  // Validate that the employee was added successfully to Nexus
  await newGroup.click();
  const employeeTable = page.getByRole('table');
  await employeeTable.waitFor();
  await expect(employeeTable).toContainText('✔');

  // close group
  const closeButton = page.getByRole('button', { name: 'Close' });
  await closeButton.click();
});

test('Validate employee removal and group deletion', async ({ page }) => {
  await page.goto('https://host.docker.internal/LEAF_Request_Portal/admin/?a=mod_groups#/');

  // open group
  const group = page.getByRole('heading', { name: 'Bronze Computers ' });
  await group.waitFor();
  await group.click();

  // Remove the first employee from the group (index 0)
  const removeEmpButton = page.locator('#removeMember_0');
  await removeEmpButton.waitFor();
  await removeEmpButton.click();
  const confirmRemoveButton = page.getByRole('button', { name: 'Yes' });
  await confirmRemoveButton.waitFor();
  await confirmRemoveButton.click();

  // Validate the employee has been removed
  const removedEmployee = page.getByRole('cell', { name: 'Bruen, Elisha' });
  await expect(removedEmployee).not.toBeVisible();

  // Reopen the group to delete it
  await group.click();
  const deleteGroupButton = page.getByRole('button', { name: 'Delete Group' });
  await deleteGroupButton.click();

  // Reload the page and validate the group is deleted
  await page.reload();
  await expect(group).not.toBeVisible();
});
