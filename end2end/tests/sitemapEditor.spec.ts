import { test, expect } from '@playwright/test';

test('Validate sitemap card edit functionality', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/');

    const sitemapEditorButton = page.getByRole('button', { name: 'Sitemap Editor' });
    await sitemapEditorButton.click();

    // First sitemap card
    const firstSitemapCard = page.locator('#sortable div').nth(0);
    await firstSitemapCard.waitFor({ state: 'visible' });
    await firstSitemapCard.click();

    const editSiteDialog = page.locator('text=Edit Site');
    await editSiteDialog.waitFor({ state: 'visible' });

    // Add new site title
    const siteInput = page.locator('label:has-text("Site Title")');
    await siteInput.fill('New Site Title');

    // Add new site description
    const siteDescriptionInput = page.locator('label:has-text("Site Description")');
    await siteDescriptionInput.fill('This is the site description');

    const saveButton = page.locator('button', { hasText: 'Save Change' });
    await saveButton.click();

    // Wait for the first sitemap card to reappear
    await firstSitemapCard.waitFor({ state: 'visible' });

    // Ensure that the new title is visible on the page
    const firstCardHeading = firstSitemapCard.locator('h3');
    await firstCardHeading.waitFor({ state: 'visible' });
    const updatedFirstCardHeading = await firstCardHeading.textContent();
    expect(updatedFirstCardHeading).toContain('New Site Title');

    // Reload the page to ensure the changes are reflected
    await page.reload();

    // Retrieve the new heading and description from the first sitemap card
    const firstCardDescription = await firstSitemapCard.locator('p').textContent();

    // Assert that the card description contains the new text
    expect(firstCardDescription).toContain('This is the site description');
});

test('Validate sitemap card deletion', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/');

    const sitemapEditorButton = page.getByRole('button', { name: 'Sitemap Editor' });
    await sitemapEditorButton.click();

    // Second sitemap card
    const secondSitemapCard = page.locator('#sortable div').nth(1);
    await secondSitemapCard.waitFor({ state: 'visible' });
    await secondSitemapCard.click();

    const editSiteDialog = page.getByText('Edit Site');
    await editSiteDialog.waitFor({ state: 'visible' });

    const deleteSiteButton = page.getByRole('button', { name: 'Delete Site' });
    await deleteSiteButton.click();

    // Add timeout to complete the backend process
    await page.waitForTimeout(1000);

    // Assert that the second sitemap card is no longer visible
    await expect(secondSitemapCard).toBeHidden();
});

test('Validate sitemap card creation', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/');

    const sitemapEditorButton = page.getByRole('button', { name: 'Sitemap Editor' });
    await sitemapEditorButton.click();

    const addSiteButton = page.getByRole('button', { name: 'Add Site' });
    await addSiteButton.click();

    const addSiteDialog = page.locator('span:text("Add Site")');
    await addSiteDialog.waitFor({ state: 'visible' });

    // Add site title
    const siteInput = page.locator('#button-title');
    await siteInput.fill('Test 3');

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

    await page.reload();

    // Verify the new card appears with the correct title
    const newCard = page.getByRole('heading', { name: 'Test 3', exact: true });
    await newCard.waitFor()
    await expect(newCard).toBeVisible();

    // Verify the card styles
    const newCardElement = page.locator('div.leaf-sitemap-card:has(h3:has-text("Test 3"))');
    const styleAttribute = await newCardElement.getAttribute('style');
    expect(styleAttribute).toContain('background-color: #9e4747');
    expect(styleAttribute).toContain('color: #a4bd17');
});
