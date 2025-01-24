import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

// Generate unique text to help ensure that fields are being filled correctly.
let randNum = Math.random();
let uniqueText = `My New Request ${randNum}`;

test('Verify New Request Page', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/');
    await page.getByText('New Request', { exact: true }).click();

    // Verify Create New Request Page displays
    await expect(page.locator('#record')).toContainText('Step 1 - General Information');

});

test('Create and Submit Request', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/?a=newform');
    await page.getByRole('cell', { name: 'Select an Option Service' }).locator('a').click();
    await page.getByRole('option', { name: 'Bronze Music' }).click();
    await page.getByLabel('Title of Request').click();
    await page.getByLabel('Title of Request').fill(uniqueText + ' to Create');
    await page.locator('label').filter({ hasText: 'Multiple person designated' }).locator('span').click();
    await page.getByRole('button', { name: 'Click here to Proceed' }).click();
    await page.getByLabel('Search for user to add as Reviewer 1').click();
    await page.getByLabel('Search for user to add as Reviewer 1').fill('userName:VTRSHHZOFIA');
    await page.getByLabel('Search for user to add as Reviewer 2').click();
    await page.getByLabel('Search for user to add as Reviewer 2').fill('userName:VTRUXEJAMIE');
    await expect(page.getByTitle('87 - VTRSHHZOFIA')).toContainText('Bauch, Adam Koelpin');
    await expect(page.getByTitle('25 - VTRUXEJAMIE')).toContainText('Balistreri, Dorian Dickens');
    await page.locator('#nextQuestion').click();
    await expect(page.locator('#data_14_1')).toContainText('Adam Bauch');
    await expect(page.locator('#data_15_1')).toContainText('Dorian Balistreri');
    await page.getByRole('button', { name: 'Submit Request' }).click();
    await expect(page.locator('#workflowbox_dep-1')).toContainText('Pending action from Adam Bauch');
});

test('Archived Question Not Visible to New Request', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
    await page.getByRole('link', { name: 'Multiple person designated', exact: true }).click();
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.locator('label').filter({ hasText: 'Archive' }).locator('span').click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('span').filter({ hasText: 'Reviewer 2,'})).not.toBeVisible();
    await page.getByRole('link', { name: 'Home' }).click();
    await page.getByRole('link', { name: uniqueText + ' to Create' }).click();
    await expect(page.getByText('Reviewer 1', { exact: true })).toBeVisible();
    await expect(page.getByText('Reviewer 2', { exact: true })).not.toBeVisible();
});

test('Value Still Visible in Report After Archiving Question', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/?a=reports&v=3');
    await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();
    await page.getByRole('option', { name: 'Title' }).click();
    await page.getByLabel('text', { exact: true }).click();
    await page.getByLabel('text', { exact: true }).fill(uniqueText + ' to Create');
    await page.getByRole('button', { name: 'Next Step' }).click();
    await page.getByText('Multiple person designated', { exact: true }).click();
    await page.getByTitle('indicatorID: 14\nReviewer').locator('span').click();
    await page.getByTitle('indicatorID: 15\nReviewer 2 (Archived)').locator('span').click();
    await page.getByRole('button', { name: 'Generate Report' }).click();
    await expect(page.locator('[data-indicator-id="15"]')).toContainText('Dorian Balistreri');
});

test('Previous Value Still Available to Request After Restoring Question', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');
    await page.getByRole('link', { name: 'Multiple person designated', exact: true }).click();
    await expect(page.getByLabel('Form name (24)')).toHaveValue('Multiple person designated');
    await page.getByRole('link', { name: 'Restore Fields' }).click();
    await page.reload();
    await page.getByRole('button', { name: 'Restore this field' }).click();
    await expect(page.getByText('Reviewer 2')).not.toBeVisible();
    await page.getByRole('link', { name: 'Form Browser' }).click();
    await page.getByRole('link', { name: 'Multiple person designated', exact: true }).click();
    await expect(page.getByText('Reviewer 2')).toBeVisible();
    await page.getByRole('link', { name: 'Home' }).click();
    await page.getByRole('link', { name: uniqueText + ' to Create' }).click();
    await expect(page.getByText('Reviewer 2')).toBeVisible();
    await expect(page.locator('#data_15_1')).toContainText('Dorian Balistreri');
});

test('Edit a New Request', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/?a=newform');
    await page.getByRole('cell', { name: 'Select an Option Service' }).locator('a').click();
    await page.getByRole('option', { name: 'Concrete Electronics' }).click();
    await page.getByLabel('Title of Request').click();
    await page.getByLabel('Title of Request').fill(uniqueText + ' to Edit and Cancel');
    await page.locator('label').filter({ hasText: 'Simple form' }).locator('span').click();
    await page.getByRole('button', { name: 'Click here to Proceed' }).click();
    await page.getByLabel('single line text').click();
    await page.getByLabel('single line text').fill('12345');
    await page.locator('#nextQuestion2').click();
    await expect(page.locator('#data_11_1')).toContainText('12345');
    await page.getByRole('button', { name: 'Edit this form' }).click();
    await page.getByLabel('single line text').fill('New Text');
    await page.locator('#nextQuestion2').click();
    await expect(page.locator('#data_11_1')).toContainText('New Text');
})

test('Cancel Request', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/');
    await page.getByRole('link', { name: uniqueText + ' to Edit and Cancel' }).click();
    await page.getByRole('button', { name: 'Cancel Request' }).click();
    await page.getByPlaceholder('Enter Comment').click();
    await page.getByPlaceholder('Enter Comment').fill('No longer needed');
    await page.getByRole('button', { name: 'Yes' }).click();
    await expect(page.locator('#bodyarea')).toContainText('has been cancelled!');
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page.getByRole('link', { name: uniqueText + ' to Edit and Cancel' })).not.toBeVisible();
})