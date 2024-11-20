import { test, expect } from '@playwright/test';

test('Validate system admin search', async ({ page }) => {
    // Navigate to the System administrators page
    await page.goto('https://host.docker.internal/LEAF_Request_Portal/admin/?a=mod_groups#/');

    const systemAdminsLink = page.getByRole('link', { name: 'System administrators' });
    await systemAdminsLink.click();

    // Search system admin
    const searchBox = page.getByLabel('Filter by group or user name');
    await searchBox.fill('sysa');
    await page.keyboard.press('Enter');

    // verify the system admin exists
    const sysAdminGroup = page.locator('#groupTitle1');
    await expect(sysAdminGroup).toBeVisible();
    await expect(sysAdminGroup).toContainText('sysadmin');

    // verify primary admin not found in search results
    const otherGroup = page.locator('#groupTitle2');
    await expect(otherGroup).not.toBeVisible();
});

test('Validate addition of new administrator as system administrators', async ({ page }) => {
    await page.goto('https://host.docker.internal/LEAF_Request_Portal/admin/?a=mod_groups#/');

    // system admin section
    const systemAdmin = page.locator('#adminList');
    await systemAdmin.waitFor();
    await systemAdmin.click();

    // search box
    const searchBox = page.getByLabel('Search for user to add as');
    await searchBox.waitFor({ state: 'visible' });
    await searchBox.click();
    await searchBox.fill('carroll');

    // add an employee
    const employeeRow = page.locator('tr.employeeSelector:has-text("Carroll, Zoila Lind.")');
    await employeeRow.waitFor({ state: 'visible' });
    await employeeRow.click();

    // save button
    const saveButton = page.getByRole('button', { name: 'Save' });
    await saveButton.waitFor({ state: 'visible' });
    await saveButton.click();

    // group members are visible
    const groupMembersLabel = page.locator('text=Zoila Carroll + 1 others');
    await groupMembersLabel.waitFor({ state: 'visible' });
    await systemAdmin.click();

    // check admin user is added
    const adminSummary = page.locator('#adminSummary');
    await adminSummary.waitFor({ state: 'visible' });
    await expect(adminSummary).toContainText('Carroll, Zoila');

    // close button 
    const closeButton = page.getByRole('button', { name: 'Close' });
    await closeButton.click();
});

test('validate set primary administrator', async ({ page }) => {
    await page.goto('https://host.docker.internal/LEAF_Request_Portal/admin/?a=mod_groups#/');

    // set primary admin button
    const primaryAdminButton = page.locator('#primaryAdmin');
    await primaryAdminButton.click();

    // Select "tester" from the employee selector dropdown
    const employeeSelectorDropdown = page.locator('#employeeSelectorDropdown');
    await employeeSelectorDropdown.selectOption('tester');

    // save button
    const saveButton = page.getByRole('button', { name: 'Save' });
    await saveButton.click();

    // Verify that the primary admin is updated to "Tester Tester"
    const primaryAdminLocator = page.locator('#membersPrimaryAdmin');
    await primaryAdminLocator.waitFor();
    await expect(primaryAdminLocator).toContainText('Tester Tester');

    await primaryAdminButton.click();

    // Validate that the selected employee's name is displayed correctly
    const employeeSelectorText = page.locator('#employeeSelector');
    await employeeSelectorText.waitFor();
    await expect(employeeSelectorText).toContainText('Tester, Tester');

    // close button
    const closeButton = page.getByRole('button', { name: 'close' });
    await closeButton.click();
});

test('Validate all group history', async ({ page }) => {
    await page.goto('https://host.docker.internal/LEAF_Request_Portal/admin/?a=mod_groups#/');

    // create group button
    const createGroupButton = page.getByRole('button', { name: '+ Create group' });
    await createGroupButton.waitFor();
    await createGroupButton.click();

    // group title
    const groupTitle = page.getByLabel('Group Title');
    await groupTitle.waitFor();
    await groupTitle.fill('Group History Test');

    // save button
    const saveButton = page.getByRole('button', { name: 'Save' });
    await saveButton.waitFor();
    await saveButton.click();

    // validate group history created
    const testGroup = page.getByRole('heading', { name: 'Group History Test' });
    await testGroup.waitFor();
    await expect(testGroup).toBeVisible();

    // show group history button
    const showGroupHistoryButton = page.getByRole('button', { name: 'Show group history' });
    await showGroupHistoryButton.waitFor();
    await showGroupHistoryButton.click();

    // Validate the group history section title
    const groupHistorySectionTitle = await page.locator('#ui-id-3').textContent();
    expect(groupHistorySectionTitle).toBe('All group history');

    // validate table content
    const tableContent = page.locator('tbody');
    await expect(tableContent).toContainText('Tester Tester added new group: Group History Test');

    // close button
    const closeButton = page.getByRole('button', { name: 'Close' });
    await closeButton.waitFor();
    await closeButton.click();
});

test('Validate user group history', async ({ page }) => {
    await page.goto('https://host.docker.internal/LEAF_Request_Portal/admin/?a=mod_groups#/');

    // 'Iron Games' group
    const group = page.getByRole('heading', { name: 'Iron Games' });
    await group.waitFor();
    await group.click();

    // View History' button
    const viewHistoryButton = page.getByRole('button', { name: 'View History' });
    await viewHistoryButton.waitFor();
    await viewHistoryButton.click();

    // validate that the history contains the group name
    const historyName = page.locator('#historyName');
    await historyName.waitFor();
    await expect(historyName).toContainText('Group Name: Iron Games');

    // Close the history and group history modal
    const closeHistoryButton = page.getByLabel('Group history').getByRole('button', { name: 'Close' });
    await closeHistoryButton.click();

    const closeButton = page.getByRole('button', { name: 'Close' });
    await closeButton.click();
});
