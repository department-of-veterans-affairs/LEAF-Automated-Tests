import { test, expect } from '@playwright/test';

test('Edit and revert a sitemap card title', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/report.php?a=LEAF_sitemaps_template');

    const firstSitemapCard = page.locator('#sortable div').nth(0);
    await firstSitemapCard.waitFor({ state: 'visible' });

    // Capture the original site title
    const firstCardHeading = firstSitemapCard.locator('h3');
    const originalSiteTitle = await firstCardHeading.textContent();

    // Edit the site title
    await firstSitemapCard.click();
    const editSiteDialog = page.locator('text=Edit Site');
    await editSiteDialog.waitFor({ state: 'visible' });

    const siteInput = page.locator('label:has-text("Site Title")');
    await siteInput.fill('New Site Title');

    const saveButton = page.locator('button:has-text("Save Change")');
    await saveButton.click();

    // Wait for the alert to become visible
    const sitemapAlert = page.locator('#sitemap-alert');
    await sitemapAlert.waitFor({ state: 'visible' });

    // Validate the new site title
    const updatedFirstCardHeading = await firstCardHeading.textContent();
    expect(updatedFirstCardHeading).toContain('New Site Title');

    // Revert to the original site title
    await firstSitemapCard.click();
    await editSiteDialog.waitFor({ state: 'visible' });

    await siteInput.fill(originalSiteTitle);
    await saveButton.click();

    // Wait for the alert to become visible
    await sitemapAlert.waitFor({ state: 'visible' });

    // Validate the site title is reverted to the original
    const revertedFirstCardHeading = await firstCardHeading.textContent();
    expect(revertedFirstCardHeading).toContain(originalSiteTitle);
});

test('Inbox visibility on view combined inbox page', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/report.php?a=LEAF_sitemaps_template');

    // Wait for the new page to open in a popup when clicking the "View Combined Inbox" link
    const page1Promise = page.waitForEvent('popup');
    const viewSitemap = page.getByRole('link', { name: 'View Combined Inbox' });
    await viewSitemap.waitFor();
    await viewSitemap.click();
    const page1 = await page1Promise;

    await page1.waitForLoadState('domcontentloaded');

    // Validate new page url
    const newPageUrl = page1.url();
    expect(newPageUrl).toBe('https://host.docker.internal/Test_Request_Portal/report.php?a=LEAF_Inbox');

    // Validate if the inbox is visible on the new page
    const inbox = page1.locator('#inbox');
    await inbox.waitFor({ state: 'visible' });
    await expect(inbox).toBeVisible();
});

test('Sitemap card creation, deletion, and appearance on the view sitemap page', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/report.php?a=LEAF_sitemaps_template');

    const addSiteButton = page.getByRole('button', { name: 'Add Site' });
    await addSiteButton.click();

    const addSiteDialog = page.locator('span:has-text("Add Site")');
    await addSiteDialog.waitFor({ state: 'visible' });

    // Generate a unique site name
    const uniqueSiteName = `TestSite-${Math.floor(Math.random() * 10000)}`;

    // Add site title
    const siteInput = page.locator('#button-title');
    await siteInput.fill(uniqueSiteName);

    // Add site description
    const siteDescriptionInput = page.getByLabel('Enter group name');
    await siteDescriptionInput.fill('Test site description');

    // Set the site background color
    const siteColor = page.locator('input[name="btnColor"]');
    await siteColor.click();
    await siteColor.fill('#9e4747');

    // Set the site font color
    const addFontColor = page.locator('input[name="btnFntColor"]');
    await addFontColor.click();
    await addFontColor.fill('#a4bd17');

    const saveButton = page.getByRole('button', { name: 'Save Change' });
    await saveButton.click();

    const sitemapAlert = page.locator('#sitemap-alert');
    await sitemapAlert.waitFor({ state: 'visible' });

    // Verify the card background and font color
    const newCardElement = page.locator('div.leaf-sitemap-card:has(h3:has-text("' + uniqueSiteName + '"))');
    await newCardElement.waitFor({ state: 'visible' });
    const styleAttribute = await newCardElement.getAttribute('style');
    expect(styleAttribute).toContain('background-color: #9e4747');
    expect(styleAttribute).toContain('color: #a4bd17');

    // Wait for the new page to open in a popup when clicking the "View Sitemap" link
    const page1Promise = page.waitForEvent('popup');
    const viewSitemap = page.getByRole('link', { name: 'View Sitemap' });
    await viewSitemap.waitFor();
    await viewSitemap.click();
    const page1 = await page1Promise;

    await page1.waitForLoadState('domcontentloaded');

    // Validate new page url
    const newPageUrl = page1.url();
    expect(newPageUrl).toBe('https://host.docker.internal/Test_Request_Portal/?a=sitemap');

    const sitemapCard = page.locator('div.leaf-sitemap-card:has-text("' + uniqueSiteName + '")');
    await expect(sitemapCard).toBeVisible();

    await page1.close();
    await newCardElement.waitFor();
    await newCardElement.click();

    // Wait for the "Edit Site" dialog to appear
    const editSiteDialog = page.getByText('Edit Site');
    await editSiteDialog.waitFor({ state: 'visible' });

    await page.getByRole('button', { name: 'Delete Site' }).click();
    await sitemapAlert.waitFor({ state: 'visible' });

    // Assert that the created sitemap card is no longer visible or attached
    await expect(sitemapCard).not.toBeVisible();
});

test('Change and revert sitemap card color from sidenav link', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/report.php?a=LEAF_sitemaps_template');

    const firstItem = page.locator('ul.usa-sidenav li:first-child');
    await firstItem.click();

    const siteColor = page.locator('input[name="btnColor"]');
    const initialColor = await siteColor.inputValue();
    await siteColor.fill('#803838');

    // Save changes
    const saveButton = page.getByRole('button', { name: 'Save Change' });
    await saveButton.click();

    // Wait for the alert to become visible
    const sitemapAlert = page.locator('#sitemap-alert');
    await sitemapAlert.waitFor({ state: 'visible' });

    // Verify the color change on the first card
    const firstCard = page.locator('#sortable div').first();
    const styleAttribute = await firstCard.getAttribute('style');
    expect(styleAttribute).toContain('background-color: #803838');

    // Revert the color to the initial value
    await firstItem.click();
    await siteColor.fill(initialColor);
    await saveButton.click();

    // Verify the color reverted successfully
    const revertedStyleAttribute = await firstCard.getAttribute('style');
    expect(revertedStyleAttribute).toContain(`background-color: ${initialColor}`);
});

test('Inbox visibility from view sitemap page', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/report.php?a=LEAF_sitemaps_template');

    // Wait for the popup page to open when "View Sitemap" is clicked
    const sitemapPopup = page.waitForEvent('popup');
    const sitemapLink = page.getByRole('link', { name: 'View Sitemap' });
    await sitemapLink.waitFor();
    await sitemapLink.click();
    const sitemapPage = await sitemapPopup;

    await sitemapPage.waitForLoadState('domcontentloaded');

    // Validate the sitemap page URL
    const sitemapUrl = sitemapPage.url();
    expect(sitemapUrl).toBe('https://host.docker.internal/Test_Request_Portal/?a=sitemap');

    // Wait for the Combined Inbox page to open when "View Combined Inbox" is clicked
    const inboxPopup = sitemapPage.waitForEvent('popup');
    const inboxBtn = sitemapPage.getByRole('button', { name: 'View Combined Inbox' });
    await inboxBtn.waitFor();
    await inboxBtn.click();
    const inboxPage = await inboxPopup;

    // Wait for the combined inbox page to load
    await inboxPage.waitForLoadState('domcontentloaded');
    const inboxUrl = inboxPage.url();
    expect(inboxUrl).toMatch(/https:\/\/host\.docker\.internal\/Test_Request_Portal\/report\.php\?a=leaf_inbox/i);

    // Validate that the inbox is visible on the sitemap page
    const inbox = inboxPage.locator('#inbox');
    await inbox.waitFor({ state: 'visible' });
    await expect(inbox).toBeVisible();
});
