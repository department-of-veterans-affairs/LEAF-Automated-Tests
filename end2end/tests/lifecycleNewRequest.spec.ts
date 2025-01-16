import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

// Generate unique text to help ensure that fields are being filled correctly.
let randNum = Math.random();
let uniqueText = `My New Form ${randNum}`;

test('Verify New Request Page', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/');
    await page.getByText('New Request', { exact: true }).click();

    // Verify Create New Request Page displays
    await expect(page.locator('#record')).toContainText('Step 1 - General Information');
});

test('Create and Submit New Request', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/?a=newform');

    // Fill in Step 1 of Creating a New Request
    await page.getByRole('cell', { name: 'Select an Option Service' }).locator('a').click();
    await page.getByRole('option', { name: 'Concrete Music' }).click();
    await page.getByLabel('Title of Request').click();
    await page.getByLabel('Title of Request').fill(uniqueText + ' to Create');

    // Choose Simple Form under Step 2 and go to next section
    await page.locator('label').filter({ hasText: 'Simple form' }).locator('span').click();
    await page.getByRole('button', { name: 'Click here to Proceed' }).click();

    // Fill in single line text with 'abc'
    await expect(page.getByText('1. single line text')).toBeVisible();
    await page.getByLabel('single line text').click();
    await page.getByLabel('single line text').fill('abc');
    await page.locator('#nextQuestion2').click();

    // Verify the name of created request contains the value of uniqueText
    await expect(page.locator('#requestTitle')).toContainText(uniqueText);

    // Verify the single line text contains 'abc' 
    await expect(page.locator('#data_11_1')).toContainText('abc');

    // Submit the request
    await page.getByRole('button', { name: 'Submit Request' }).click();

    // Verify it has been submitted 
    await expect(page.getByText('Pending Group A')).toBeVisible();    
});

test('Edit Unsubmitted Request', async ({ page }) => {

    // Go to Create a New Request Page
    await page.goto('https://host.docker.internal/Test_Request_Portal/?a=newform');

    // Fill in the Step 1 options
    await page.getByRole('cell', { name: 'Select an Option Service' }).locator('a').click();
    await page.getByRole('option', { name: 'Concrete Music' }).click();
    await page.getByLabel('Title of Request').click();

    // Title the request the value of uniqueTest to Edit
    await page.getByLabel('Title of Request').fill(uniqueText + ' to Edit');

    // Choose 'Simple Form' as the form to use
    await page.locator('label').filter({ hasText: 'Simple form' }).locator('span').click();
    await page.getByRole('button', { name: 'Click here to Proceed' }).click();
    await page.getByLabel('single line text').click();

    // Fill single line text with 'abc'
    await page.getByLabel('single line text').fill('abc');
    await page.locator('#nextQuestion2').click();

    // Click on Edit this Form
    await page.getByRole('button', { name: 'Edit this form' }).click();

    // Change the single line text to 'Line 1'
    await page.getByLabel('single line text').click();
    await page.getByLabel('single line text').fill('Line 1');
    await page.locator('#nextQuestion2').click();

    // Verify the single line text says 'Line 1'
    await expect(page.locator('#data_11_1')).toContainText('Line 1');
});

test('Cancel Request', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/');

    // Select previous edited request
    await page.getByRole('link', { name: uniqueText + ' to Edit' }).click();

    // Cancel the request
    await page.getByRole('button', { name: 'Cancel Request' }).click();

    // Enter comment in cancel popup and confirm cancellation
    await page.getByPlaceholder('Enter Comment').click();
    await page.getByPlaceholder('Enter Comment').fill('No Longer Needed');
    await page.getByRole('button', { name: 'Yes' }).click();

    // Verify that the request has been cancelled
    await expect(page.locator('#bodyarea')).toContainText('has been cancelled!');
});



