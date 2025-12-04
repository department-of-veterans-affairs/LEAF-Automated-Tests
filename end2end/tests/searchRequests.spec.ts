import { test, expect, Page } from '@playwright/test';
import {
  LEAF_URLS, getRandomId,
  awaitPromise, fillAndVerifyField, selectChosenDropdownOption
} from '../leaf_test_utils/leaf_util_methods.ts'

const reservedTestCase = '957';
const testId = getRandomId();
const originalTitle = 'Search for a URL';
const searchTestTitle = `http://www.va.gov/${testId}`; //not testing nav, just that it can be searched for

/**
 * @param page (page instance, auto-passed by hook)
 */
test.beforeEach('set search test title', async ({ page }) => {
  await page.goto(LEAF_URLS.PRINTVIEW_REQUEST + reservedTestCase);
  await page.getByRole('button', { name: 'Edit Title'}).click();
  await fillAndVerifyField(page.locator('#title'), searchTestTitle);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.locator('#requestTitle')).toContainText(searchTestTitle);
});
/**
 * @param page (page instance, auto-passed by hook)
 */
test.afterEach('reset search test title', async ({ page }) => {
  await page.goto(LEAF_URLS.PRINTVIEW_REQUEST + reservedTestCase);
  await page.getByRole('button', { name: 'Edit Title'}).click();
  await fillAndVerifyField(page.locator('#title'), originalTitle);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.locator('#requestTitle')).toContainText(originalTitle);
});


/**
 * Test for LEAF 5003
 * Verify that a request with a URL in the title can be
 * searched for using basic or Advanced Search
 */
test.describe('URL can be searched for using basic and advanced search inputs', () => {
  test.describe.configure({ mode: 'serial'}); //title needs to have a specific value

  test('Advanced search for URL in title is functional', async ({ page }) => {
    await page.goto(LEAF_URLS.PORTAL_HOME);
    await page.getByRole('button', { name: 'Advanced Options' }).click();
    await expect(page.getByRole('button', { name: 'Close advanced search' })).toBeVisible();
    const selectLocator = page.locator('table[id$="_searchTerms"] tr td select').first();
    const selectID = await selectLocator.getAttribute('id') ?? "";
    const chosenID = `#${selectID}_chosen`;
    await selectChosenDropdownOption(page, chosenID, 'Title');

    const searchLocator = page.getByLabel('text', { exact: true });
    await fillAndVerifyField(searchLocator, searchTestTitle);
    await awaitPromise(page, testId, async (p:Page) => { //await query for request having testId in the title
      await p.getByRole('button', { name: 'Apply Filters' }).click();
    });
    await expect(page.locator('table[id^="LeafFormGrid"] tbody tr').first()).toBeVisible();

    //Verify the search actually worked by checking for our specific record
    const searchResultLink = page.getByRole('link', { name: reservedTestCase, exact: true });
    await expect(searchResultLink).toBeVisible();
    const urlTitleLink = page.getByRole('link', { name: searchTestTitle });
    await expect(urlTitleLink).toBeVisible();
  });

  test('Basic search for URL in title is functional', async ({ page }) => {
    await page.goto(LEAF_URLS.PORTAL_HOME);
    const awaitQuery = page.waitForResponse(res =>
      res.url().includes(testId) &&
      res.status() === 200
    );
    const searchField = page.getByLabel('Enter your search text');
    await fillAndVerifyField(searchField, searchTestTitle); //filling this field triggers the query
    await awaitQuery;

    await expect(page.locator('table[id^="LeafFormGrid"] tbody tr').first()).toBeVisible();
    const searchResultLink = page.getByRole('link', { name: reservedTestCase, exact: true });
    await expect(searchResultLink).toBeVisible();
    const urlTitleLink = page.getByRole('link', { name: searchTestTitle });
    await expect(urlTitleLink).toBeVisible();
  });
});