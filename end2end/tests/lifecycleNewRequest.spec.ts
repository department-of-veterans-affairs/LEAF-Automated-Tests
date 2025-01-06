import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

// Generate unique text to help ensure that fields are being filled correctly.
let randNum = Math.random();
let uniqueText = `My New Form ${randNum}`;

test('Verify New Request Page', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/');
    await page.getByText('New Request', { exact: true }).click();
    await expect(page.locator('#record')).toContainText('Step 1 - General Information');
});

test('Create and Submit New Request', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/?a=newform');
    await page.getByRole('cell', { name: 'Select an Option Service' }).locator('a').click();
    await page.getByRole('option', { name: 'Concrete Music' }).click();
    await page.getByLabel('Title of Request').click();
    await page.getByLabel('Title of Request').fill(uniqueText + ' to Create');
    await page.locator('label').filter({ hasText: 'Simple form' }).locator('span').click();
    await page.getByRole('button', { name: 'Click here to Proceed' }).click();
    await expect(page.getByText('1. single line text')).toBeVisible();
    await page.getByLabel('single line text').click();
    await page.getByLabel('single line text').fill('abc');
    await page.locator('#nextQuestion2').click();
    await expect(page.locator('#requestTitle')).toContainText(uniqueText);
    await expect(page.locator('#data_11_1')).toContainText('abc');
    await page.getByRole('button', { name: 'Submit Request' }).click();
    await expect(page.getByText('Pending Group A')).toBeVisible();    
});

test('Edit Request', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/?a=newform');
    await page.getByRole('cell', { name: 'Select an Option Service' }).locator('a').click();
    await page.getByRole('option', { name: 'Concrete Music' }).click();
    await page.getByLabel('Title of Request').click();
    await page.getByLabel('Title of Request').fill(uniqueText + ' to Edit');
    await page.locator('label').filter({ hasText: 'Simple form' }).locator('span').click();
    await page.getByRole('button', { name: 'Click here to Proceed' }).click();
    await page.getByLabel('single line text').click();
    await page.getByLabel('single line text').fill('abc');
    await page.locator('#nextQuestion2').click();
    await page.getByRole('button', { name: 'Edit this form' }).click();
    await page.getByLabel('single line text').click();
    await page.getByLabel('single line text').fill('Line 1');
    await page.locator('#nextQuestion2').click();
    await expect(page.locator('#data_11_1')).toContainText('Line 1');
});

test('Cancel Request', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/');
    await page.getByRole('link', { name: uniqueText + ' to Edit' }).click();
    await page.getByRole('button', { name: 'Cancel Request' }).click();
    await page.getByPlaceholder('Enter Comment').click();
    await page.getByPlaceholder('Enter Comment').fill('No Longer Needed');
    await page.getByRole('button', { name: 'Yes' }).click();
    await expect(page.locator('#bodyarea')).toContainText('has been cancelled!');
});



