import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

// Generate unique text to help ensure that fields are being filled correctly.
// let randNum = Math.random();
// let uniqueText = `My New Form ${randNum}`;

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
    await page.getByLabel('Title of Request').fill('Request to Create');
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
})

test('Edit a New Request', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/?a=newform');
    await page.getByRole('cell', { name: 'Select an Option Service' }).locator('a').click();
    await page.getByRole('option', { name: 'Concrete Electronics' }).click();
    await page.getByLabel('Title of Request').click();
    await page.getByLabel('Title of Request').fill('Request to Edit and Cancel');
    await page.locator('label').filter({ hasText: 'Simple form' }).locator('span').click();
    await page.getByRole('button', { name: 'Click here to Proceed' }).click();
    await page.getByLabel('single line text').click();
    await page.getByLabel('single line text').fill('12345');
    await page.locator('#nextQuestion2').click();
    await expect(page.locator('#data_11_1')).toContainText('12345');
    await page.getByRole('button', { name: 'Edit this form' }).click();
    //await page.getByLabel('single line text').dblclick();
    await page.getByLabel('single line text').fill('New Text');
    //await page.locator('#save_indicator').click();
    await page.locator('#nextQuestion2').click();
    await expect(page.locator('#data_11_1')).toContainText('New Text');
})

test('Cancel Request', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/');
    await page.getByRole('link', { name: 'Request to Edit and Cancel' }).click();
    await page.getByRole('button', { name: 'Cancel Request' }).click();
    await page.getByPlaceholder('Enter Comment').click();
    await page.getByPlaceholder('Enter Comment').fill('No longer needed');
    await page.getByRole('button', { name: 'Yes' }).click();
    await expect(page.locator('#bodyarea')).toContainText('has been cancelled!');
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page.getByRole('link', { name: 'Request to Edit and Cancel' })).not.toBeVisible();
})