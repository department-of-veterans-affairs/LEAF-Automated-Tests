import { test, expect } from '@playwright/test';
 
// Docker-optimized waiting function (from primer)
async function dockerWait(page: any, extraBuffer: number = 1000) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(extraBuffer);
}
 
// Reliable form field filling with verification (from primer)
async function fillAndVerifyField(page: any, locator: any, value: string, fieldName: string) {
  await locator.waitFor({ state: 'visible' });
  await locator.click();
  await locator.fill(''); // Clear first
  await locator.fill(value);
 
  // Verify the value was actually set
  const actualValue = await locator.inputValue();
  if (actualValue !== value) {
    throw new Error(`Form field '${fieldName}' not set correctly. Expected: ${value}, Got: ${actualValue}`);
  }
}
 
test('Search functionality with URL in title', async ({ page }) => {
  // Generate unique test data (applying primer lessons)
  const testId = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const searchTestUrl = `https://www.va.gov/${testId}`;
  const originalTitle = 'Available for test case';
 
  let recordFound = false;
 
  try {
    await page.goto('https://host.docker.internal/Test_Request_Portal/');
    await dockerWait(page, 2000);
   
    // First, try to find record 957 and verify its current state
    const record957Element = page.locator('[id$="_957_title"]');
    const record957Count = await record957Element.count();
   
    if (record957Count === 0) {
      console.warn('Record 957 not found. Skipping test - record may not exist in current environment.');
      test.skip(true, 'Record 957 not available');
      return;
    }
   
    // Get the current title to ensure proper cleanup
    const titleLink = record957Element.getByRole('link', {name: originalTitle}).first();
    await titleLink.waitFor({ state: 'visible' });
   
    console.info(`Found record 957 with current title: "${originalTitle}"`);
    recordFound = true;
   
    // Change name of request to unique search URL
    await titleLink.click();
    await dockerWait(page, 2000);
   
    await page.getByRole('button', { name: 'Edit Title' }).click();
    await dockerWait(page);
   
    const titleField = page.locator('#title');
    await fillAndVerifyField(page, titleField, searchTestUrl, 'Title');
   
    await page.getByRole('button', { name: 'Save Change' }).click();
    await dockerWait(page, 2000); // Extra buffer for save operation
   
    // Navigate back to home
    await page.getByRole('link', { name: 'Home' }).click();
    await dockerWait(page, 2000);
   
    // Perform search with unique URL
    const searchField = page.getByLabel('Enter your search text');
    await fillAndVerifyField(page, searchField, searchTestUrl, 'Search');
   
    // Wait for search results with Docker optimization
    await dockerWait(page, 3000); // Extra buffer for search processing
   
    // Verify the search actually worked by checking for our specific record
    const searchResultLink = page.getByRole('link', { name: '957' });
    await expect(searchResultLink).toBeVisible({ timeout: 15000 });
   
    // Verify the URL title appears in results
    const urlTitleLink = page.getByRole('link', { name: searchTestUrl });
    await expect(urlTitleLink).toBeVisible({ timeout: 10000 });
   
    // More robust way to count results - check if search actually filtered
    // Look for the results container and verify it has limited results
    const searchResults = page.locator('table tbody tr');
    await searchResults.first().waitFor({ state: 'visible' });
   
    // Give search time to complete and update the DOM
    await dockerWait(page, 2000);
   
    const numRows = await searchResults.count();
    console.info(`Search returned ${numRows} results`);
   
    // The search should return a small number of results (ideally 1, but may be more)
    // If it returns all 50 records, the search didn't work
    if (numRows >= 25) {
      throw new Error(`Search failed to filter results. Expected few results, got ${numRows}. Search may not have processed correctly.`);
    }
   
    // Verify our record 957 is in the results
    await expect(searchResultLink).toBeVisible();
    console.info(`Search successfully filtered to ${numRows} results and found record 957`);
   
  } finally {
    // CRITICAL: Always clean up, even if test fails (primer lesson)
    if (recordFound) {
      try {
        console.info('Cleaning up: restoring original title...');
       
        // Navigate to the record (might be via search results or direct navigation)
        const urlTitleLink = page.getByRole('link', { name: searchTestUrl });
        const urlLinkCount = await urlTitleLink.count();
       
        if (urlLinkCount > 0) {
          await urlTitleLink.click();
        } else {
          // Fallback: navigate directly to the record
          await page.goto('https://host.docker.internal/Test_Request_Portal/');
          await dockerWait(page, 2000);
          const record957Element = page.locator('[id$="_957_title"]');
          const titleLink = record957Element.getByRole('link').first();
          await titleLink.click();
        }
       
        await dockerWait(page, 2000);
       
        await page.getByRole('button', { name: 'Edit Title' }).click();
        await dockerWait(page);
       
        const titleField = page.locator('#title');
        await fillAndVerifyField(page, titleField, originalTitle, 'Cleanup Title');
       
        await page.getByRole('button', { name: 'Save Change' }).click();
        await dockerWait(page, 2000);
       
        console.info(`Successfully restored title to: "${originalTitle}"`);
       
        // Clear search box for cleaner end state
        await page.getByRole('link', { name: 'Home' }).click();
        await dockerWait(page);
       
        const searchField = page.getByLabel('Enter your search text');
        await searchField.click();
        await searchField.press('ControlOrMeta+a');
        await searchField.fill('');
       
        console.info('Test cleanup completed successfully');
       
      } catch (cleanupError) {
        console.error(`Cleanup failed: ${cleanupError}`);
        // Don't fail the test due to cleanup issues, but log the problem
      }
    }
  }
});

test('Advanced search functionality with URL in title', async ({ page }) => {
  // Generate unique test data (applying primer lessons)
  const testId = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const searchTestUrl = `https://www.va.gov/${testId}`;
  const originalTitle = 'Available for test case';
 
  let recordFound = false;
 
  try {
    await page.goto('https://host.docker.internal/Test_Request_Portal/');
    await dockerWait(page, 2000);
   
    // First, try to find record 957 and verify its current state
    const record957Element = page.locator('[id$="_957_title"]');
    const record957Count = await record957Element.count();
   
    if (record957Count === 0) {
      console.warn('Record 957 not found. Skipping test - record may not exist in current environment.');
      test.skip(true, 'Record 957 not available');
      return;
    }
   
    // Get the current title to ensure proper cleanup
    const titleLink = record957Element.getByRole('link', {name: originalTitle}).first();
    await titleLink.waitFor({ state: 'visible' });
   
    console.info(`Found record 957 with current title: "${originalTitle}"`);
    recordFound = true;
   
    // Change name of request to unique search URL
    await titleLink.click();
    await dockerWait(page, 2000);
   
    await page.getByRole('button', { name: 'Edit Title' }).click();
    await dockerWait(page);
   
    const titleField = page.locator('#title');
    await fillAndVerifyField(page, titleField, searchTestUrl, 'Title');
   
    await page.getByRole('button', { name: 'Save Change' }).click();
    await dockerWait(page, 2000); // Extra buffer for save operation
   
    // Navigate back to home
    await page.getByRole('link', { name: 'Home' }).click();
    await dockerWait(page, 2000);
   
    // Perform search with unique URL using Advanced options
    await page.getByRole('button', { name: 'Advanced Options' }).click();
    await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();
    await page.getByRole('option', { name: 'Title' }).click();

    const searchField = page.getByLabel('text', { exact: true });
    await fillAndVerifyField(page, searchField, searchTestUrl, 'Search');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
   
    // Wait for search results with Docker optimization
    await dockerWait(page, 3000); // Extra buffer for search processing
   
    // Verify the search actually worked by checking for our specific record
    const searchResultLink = page.getByRole('link', { name: '957' });
    await expect(searchResultLink).toBeVisible({ timeout: 15000 });
   
    // Verify the URL title appears in results
    const urlTitleLink = page.getByRole('link', { name: searchTestUrl });
    await expect(urlTitleLink).toBeVisible({ timeout: 10000 });
   
    // More robust way to count results - check if search actually filtered
    // Look for the results container and verify it has limited results
    const searchResults = page.locator('table tbody tr');
    await searchResults.first().waitFor({ state: 'visible' });
   
    // Give search time to complete and update the DOM
    await dockerWait(page, 2000);
   
    const numRows = await searchResults.count();
    console.info(`Search returned ${numRows} results`);
   
    // The search should return a small number of results (ideally 1, but may be more)
    // If it returns all 50 records, the search didn't work
    if (numRows >= 25) {
      throw new Error(`Search failed to filter results. Expected few results, got ${numRows}. Search may not have processed correctly.`);
    }
   
    // Verify our record 957 is in the results
    await expect(searchResultLink).toBeVisible();
    console.info(`Search successfully filtered to ${numRows} results and found record 957`);
   
  } finally {
    // CRITICAL: Always clean up, even if test fails (primer lesson)
    if (recordFound) {
      try {
        console.info('Cleaning up: restoring original title...');
       
        // Navigate to the record (might be via search results or direct navigation)
        const urlTitleLink = page.getByRole('link', { name: searchTestUrl });
        const urlLinkCount = await urlTitleLink.count();
       
        if (urlLinkCount > 0) {
          await urlTitleLink.click();
        } else {
          // Fallback: navigate directly to the record
          await page.goto('https://host.docker.internal/Test_Request_Portal/');
          await dockerWait(page, 2000);
          const record957Element = page.locator('[id$="_957_title"]');
          const titleLink = record957Element.getByRole('link').first();
          await titleLink.click();
        }
       
        await dockerWait(page, 2000);
       
        await page.getByRole('button', { name: 'Edit Title' }).click();
        await dockerWait(page);
       
        const titleField = page.locator('#title');
        await fillAndVerifyField(page, titleField, originalTitle, 'Cleanup Title');
       
        await page.getByRole('button', { name: 'Save Change' }).click();
        await dockerWait(page, 2000);
       
        console.info(`Successfully restored title to: "${originalTitle}"`);
       
        // Reset the Advanced Options back to default and go back to regular search
        await page.getByRole('link', { name: 'Home' }).click();
        await page.getByRole('cell', { name: 'Title' }).locator('a').click();
        await page.getByRole('option', { name: 'Current Status' }).click();
        
        await page.getByRole('button', { name: 'Close advanced search' }).click();
        await dockerWait(page);
       
        console.info('Test cleanup completed successfully');
       
      } catch (cleanupError) {
        console.error(`Cleanup failed: ${cleanupError}`);
        // Don't fail the test due to cleanup issues, but log the problem
      }
    }
  }
});