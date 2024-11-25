import { test, expect } from '@playwright/test';

test.beforeEach('Go to Admin Page', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/');
  await page.getByRole('link', { name: 'Admin Panel' }).click();
});

test('Verify Admin Page', async ({ page }) => {
  await expect(page.locator('#bodyarea')).toContainText('Get Help');
});

test('Go to User Access Page', async ({ page }) => {
  await page.getByRole('button', { name: ' User Access Groups Modify' }).click();
  await expect(page.locator('#bodyarea')).toContainText('Access categories');
});

test('Go to Service Chiefs Page', async ({ page }) => {
  await page.getByRole('button', { name: ' Service Chiefs Review' }).click();
  await expect(page.locator('#bodyarea')).toContainText('Service Chiefs');
});

test('Go to Workflow Editor Page', async ({ page }) => {
  await page.getByRole('button', { name: ' Workflow Editor Edit' }).click();
  await expect(page.locator('#btn_createStep')).toContainText('New Step');
});

test('Go to Form Editor Page', async ({ page }) => {
  await page.getByRole('button', { name: ' Form Editor Create and' }).click();
  await expect(page.locator('#createFormButton')).toContainText('📄 Create Form');
});

test('Go to LEAF Library', async({ page }) => {
  await page.getByRole('button', { name: ' LEAF Library Use a form' }).click();
  await expect(page.getByRole('heading')).toContainText('LEAF Library');
});

test('Go to Site Settings Page', async ({ page }) => {
  await page.getByRole('button', { name: ' Site Settings Edit site' }).click();
  await expect(page.locator('h2')).toContainText('Site Settings');
});

test('Go to Unresolved Requests', async ({ page }) => {
  await page.getByRole('button', { name: ' Unresolved Requests Examine' }).click();
  await expect(page.locator('#reportTitleDisplay')).toContainText('Unresolved requests');
});

test('Go to Timeline Explorer', async ({ page }) => {
  await page.getByRole('button', { name: ' Timeline Explorer Analyze' }).click();
  await expect(page.locator('#chartBody')).toContainText('Timeline Data Explorer');
});

test('Go to Report Builder', async ({ page }) => {
  await page.getByRole('button', { name: ' Report Builder Create' }).click();
  await expect(page.locator('#step_1')).toContainText('Step 1: Develop search filter');
});

test('Go to Data Visualizer', async ({ page }) => {
  await page.getByRole('button', { name: ' Data Visualizer Analyze' }).click();
  await expect(page.locator('#chart_title')).toContainText('Please select a form');
});

test('Go to Template Editor', async ({ page }) => {
  await page.getByRole('button', { name: ' Template Editor Edit HTML' }).click();
  await expect(page.locator('h2')).toContainText('Template Editor');
});

test('Go to Email Template Editor', async ({ page }) => {
  await page.getByRole('button', { name: ' Email Template Editor Add' }).click();
  await expect(page.locator('#bodyarea')).toContainText('Email Template Editor');
});

test('Go to LEAF Programmer Page', async ({ page }) => {
  await page.getByRole('button', { name: ' LEAF Programmer Advanced' }).click();
  await expect(page.locator('h2')).toContainText('LEAF Programmer');
});

test('Go to File Manager', async ({ page }) => {
  await page.getByRole('button', { name: ' File Manager Upload custom' }).click();
  await expect(page.getByRole('heading')).toContainText('File Manager');
});

test('Go to Search Database', async ({ page }) => {
  await page.getByRole('button', { name: ' Search Database Perform' }).click();
  await expect(page.locator('#headerTab')).toContainText('Search Database');
});

test('Go to Sync Services', async ({ page }) => {
  await page.getByRole('button', { name: ' Sync Services Update' }).click();
  await expect(page.getByRole('heading')).toContainText('Sync Services');
});

test('Go to Update Database', async ({ page }) => {
  await page.getByRole('button', { name: ' Update Database Updates the' }).click();
  await expect(page.getByRole('heading')).toContainText('Update Database');
});

test('Go to Import Spreadsheet', async ({ page }) => {
  await page.getByRole('button', { name: ' Import Spreadsheet Rows to' }).click();
  await expect(page.locator('#uploadBox')).toContainText('Choose a Spreadsheet');
});

test('Go to Mass Actions', async ({ page }) => {
  await page.getByRole('button', { name: ' Mass Actions Apply bulk' }).click();
  await expect(page.locator('#massActionContainer')).toContainText('Mass Action');
});

test('Go to New Account Updater', async ({ page }) => {
  await page.getByRole('button', { name: ' New Account Updater Update' }).click();
  await expect(page.locator('h2')).toContainText('New Account Updater');
});

test('Go to Sitemap Editor', async ({ page }) => {
  await page.getByRole('button', { name: ' Sitemap Editor Edit portal' }).click();
  await expect(page.getByRole('complementary')).toContainText('View Sitemap');
});

test('Go to Sitemap Search', async ({ page }) => {
  await page.getByRole('button', { name: ' Sitemap Search Search all' }).click();
  await expect(page.locator('#step_1')).toContainText('Step 1: Develop search filter');
});

test('Go to Combined Inbox Editor', async ({ page }) => {
  await page.getByRole('button', { name: ' Combined Inbox Editor Edit' }).click();
  await expect(page.locator('#LEAF_combined_inbox_editor')).toContainText('Cards can be created in the Sitemap Editor');
});

test('Go to Grid Splitter', async ({ page }) => {
  await page.getByRole('button', { name: ' Grid Splitter Export grid' }).click();
  await expect(page.locator('#formsContainer')).toContainText('Select a form:');
});

test('Go to Setup Quickstart Link', async ({ page }) => {
  await page.getByRole('button', { name: ' Setup Quickstart Link' }).click();
  await expect(page.locator('#setup')).toContainText('Setup Quickstart Link');
});
