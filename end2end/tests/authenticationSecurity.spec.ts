import { test, expect } from '@playwright/test';
import { LEAF_URLS } from '../leaf_test_utils/leaf_util_methods';

test.describe('Authentication Security', () => {

  test.use({
    ignoreHTTPSErrors: true
  });

  test('login redirects to requested page after authentication', async ({ page }) => {
    // Simulate a redirect through authentication
    const requestedPage = '/?a=reports';
    const encodedRedirect = Buffer.from(requestedPage).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);

    // After authentication completes, should be on the requested page
    await expect(page, `Should redirect to reports page after authentication with redirect parameter: ${requestedPage}`).toHaveURL(/.*a=reports/);
  });

  test('login uses default redirect when no redirect parameter provided', async ({ page }) => {
    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/`);

    // Should redirect to portal home
    await expect(page, `Should redirect to portal home when no redirect parameter provided`).toHaveURL(new RegExp(LEAF_URLS.PORTAL_HOME));
  });

  test('malicious redirect is blocked', async ({ page }) => {
    // This test verifies the security fix by attempting an open redirect
    const maliciousUrl = 'https://evil.com/phishing';
    const encodedRedirect = Buffer.from(maliciousUrl).toString('base64');

    // Attempt to use malicious redirect
    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);

    // Should NOT redirect to evil.com, should stay on host.docker.internal
    await page.waitForLoadState('networkidle');
    const finalURL = page.url();

    expect(finalURL, `SECURITY: Should NOT redirect to malicious domain evil.com, got: ${finalURL}`).not.toContain('evil.com');
    expect(finalURL, `SECURITY: Should stay on our host (host.docker.internal) after blocking redirect, got: ${finalURL}`).toContain('host.docker.internal');
  });

  test('relative paths are properly handled', async ({ page }) => {
    // Use a valid relative path from auth_domain back to admin
    const relativePath = '/../admin/';
    const encodedRedirect = Buffer.from(relativePath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);

    // Verify we successfully redirected to the admin page
    await expect(page, `Should successfully redirect to admin page using relative path: ${relativePath}`).toHaveURL(/.*admin/);
    await page.waitForLoadState('networkidle');
  });
});