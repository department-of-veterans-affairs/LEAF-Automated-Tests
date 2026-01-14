import { test, expect } from '@playwright/test';
import { LEAF_URLS } from '../leaf_test_utils/leaf_util_methods';

// Using RFC 2606 reserved domains for testing (example.com, example.org, test)
// These are specifically reserved for testing and documentation purposes

test.describe('Authentication Security - Comprehensive Open Redirect Prevention', () => {

  test.use({
    ignoreHTTPSErrors: true
  });

  // ============================================================================
  // LEGITIMATE USE CASES (Should Work)
  // ============================================================================

  test('allows valid relative path redirect', async ({ page }) => {
    const requestedPage = '/?a=reports';
    const encodedRedirect = Buffer.from(requestedPage).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await expect(page).toHaveURL(/.*a=reports/);
  });

  test('allows relative path to admin', async ({ page }) => {
    const relativePath = '/../admin/';
    const encodedRedirect = Buffer.from(relativePath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await expect(page).toHaveURL(/.*admin/);
  });

  test('preserves query parameters in redirect', async ({ page }) => {
    const relativePath = '/?a=reports&status=active&year=2024';
    const encodedRedirect = Buffer.from(relativePath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await expect(page).toHaveURL(/.*a=reports/);
    await expect(page).toHaveURL(/.*status=active/);
    await expect(page).toHaveURL(/.*year=2024/);
  });

  test('uses default redirect when no parameter provided', async ({ page }) => {
    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/`);
    await expect(page).toHaveURL(new RegExp(LEAF_URLS.PORTAL_HOME));
  });

  // ============================================================================
  // CATEGORY 1: HTML TAG INJECTION
  // ============================================================================

  test('CRITICAL: blocks <br> tag followed by URL', async ({ page }) => {
    const maliciousPath = '/<br>https://malicious.example.com/phishing';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    const finalURL = page.url();
    expect(finalURL, 'Should not redirect to malicious domain').not.toContain('malicious.example.com');
    expect(finalURL, 'Should stay on our host').toContain('host.docker.internal');
  });

  test('blocks <div> tag injection', async ({ page }) => {
    const maliciousPath = '/<div>https://attacker.example.org';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('attacker.example.org');
  });

  test('blocks <script> tag injection', async ({ page }) => {
    const maliciousPath = '/<script>location="https://phishing.test"</script>';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('phishing.test');
  });

  // ============================================================================
  // CATEGORY 2: PROTOCOL-RELATIVE URLS (CRITICAL)
  // ============================================================================

  test('CRITICAL: blocks protocol-relative URL (//malicious.example.com)', async ({ page }) => {
    const maliciousPath = '//malicious.example.com/phishing';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    const finalURL = page.url();
    expect(finalURL, 'Should not redirect using protocol-relative URL').not.toContain('malicious.example.com');
    expect(finalURL, 'Should stay on our host').toContain('host.docker.internal');
  });

  test('CRITICAL: blocks triple slash URL (///attacker.test)', async ({ page }) => {
    const maliciousPath = '///attacker.test/phishing';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('attacker.test');
  });

  test('CRITICAL: blocks quadruple slash URL (////malicious.example.com)', async ({ page }) => {
    const maliciousPath = '////malicious.example.com';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('malicious.example.com');
  });

  // ============================================================================
  // CATEGORY 3: URL ENCODING BYPASS (CRITICAL)
  // ============================================================================

  test('CRITICAL: blocks URL-encoded protocol (%68%74%74%70%73)', async ({ page }) => {
    // "https://malicious.example.com" with "https" URL-encoded
    const maliciousPath = '/%68%74%74%70%73%3A%2F%2Fmalicious.example.com';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('malicious.example.com');
  });

  test('CRITICAL: blocks URL-encoded newline (%0a)', async ({ page }) => {
    const maliciousPath = '/%0ahttps://phishing.test';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('phishing.test');
  });

  test('CRITICAL: blocks URL-encoded carriage return (%0d)', async ({ page }) => {
    const maliciousPath = '/%0dhttps://attacker.example.org';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('attacker.example.org');
  });

  test('CRITICAL: blocks partial URL encoding', async ({ page }) => {
    const maliciousPath = '/%68ttps://malicious.example.com'; // "h" in "https" encoded
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('malicious.example.com');
  });

  // ============================================================================
  // CATEGORY 4: BACKSLASH BYPASS
  // ============================================================================

  test('blocks single backslash (\\attacker.test)', async ({ page }) => {
    const maliciousPath = '/\\attacker.test';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('attacker.test');
  });

  test('blocks double backslash (\\\\malicious.example.com)', async ({ page }) => {
    const maliciousPath = '\\\\malicious.example.com';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('malicious.example.com');
  });

  test('blocks mixed slashes (\\/\\/phishing.test)', async ({ page }) => {
    const maliciousPath = '/\\/\\/phishing.test';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('phishing.test');
  });

  // ============================================================================
  // CATEGORY 5: AT-SIGN (@) BYPASS
  // ============================================================================

  test('blocks at-sign URL (/@attacker.example.org)', async ({ page }) => {
    const maliciousPath = '/@attacker.example.org';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('attacker.example.org');
  });

  test('blocks credentials in URL (/user:pass@malicious.example.com)', async ({ page }) => {
    const maliciousPath = '/user:pass@malicious.example.com';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('malicious.example.com');
  });

  test('blocks mixed at-sign technique (/legit@phishing.test)', async ({ page }) => {
    const maliciousPath = '/legitsite@phishing.test';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('phishing.test');
  });

  // ============================================================================
  // CATEGORY 6: WHITESPACE AND CONTROL CHARACTERS
  // ============================================================================

  test('blocks newline injection (\\n)', async ({ page }) => {
    const maliciousPath = '/\nhttps://attacker.example.org';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('attacker.example.org');
  });

  test('blocks carriage return injection (\\r)', async ({ page }) => {
    const maliciousPath = '/\rhttps://malicious.example.com';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('malicious.example.com');
  });

  test('blocks CRLF injection (\\r\\n)', async ({ page }) => {
    const maliciousPath = '/\r\nhttps://phishing.test';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('phishing.test');
  });

  test('blocks tab injection (\\t)', async ({ page }) => {
    const maliciousPath = '/\thttps://attacker.example.org';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('attacker.example.org');
  });

  test('blocks null byte injection (\\x00)', async ({ page }) => {
    const maliciousPath = '/\x00https://malicious.example.com';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('malicious.example.com');
  });

  // ============================================================================
  // CATEGORY 7: PROTOCOL VARIATIONS
  // ============================================================================

  test('blocks standard https protocol', async ({ page }) => {
    const maliciousUrl = 'https://phishing.test/steal-credentials';
    const encodedRedirect = Buffer.from(maliciousUrl).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('phishing.test');
  });

  test('blocks http protocol', async ({ page }) => {
    const maliciousUrl = 'http://attacker.example.org/phishing';
    const encodedRedirect = Buffer.from(maliciousUrl).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('attacker.example.org');
  });

  test('blocks ftp protocol', async ({ page }) => {
    const maliciousPath = '/ftp://malicious.example.com';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('malicious.example.com');
  });

  test('blocks file protocol', async ({ page }) => {
    const maliciousPath = '/file://attacker.example.org/secrets';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('attacker.example.org');
  });

  test('blocks javascript protocol', async ({ page }) => {
    const maliciousPath = '/javascript:alert(document.domain)';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('javascript:');
  });

  test('blocks data protocol', async ({ page }) => {
    const maliciousPath = '/data:text/html,<script>alert("xss")</script>';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('data:');
  });

  test('blocks vbscript protocol', async ({ page }) => {
    const maliciousPath = '/vbscript:msgbox("xss")';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('vbscript:');
  });

  // ============================================================================
  // CATEGORY 8: PROTOCOL IN PATH
  // ============================================================================

  test('blocks protocol embedded in path (/../https://phishing.test)', async ({ page }) => {
    const maliciousPath = '/../https://phishing.test';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('phishing.test');
  });

  test('blocks multiple protocols', async ({ page }) => {
    const maliciousPath = '/../https://https://malicious.example.com';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('malicious.example.com');
  });

  // ============================================================================
  // CATEGORY 9: EDGE CASES AND COMBINED ATTACKS
  // ============================================================================

  test('blocks path without leading slash', async ({ page }) => {
    const maliciousPath = 'admin/';  // Missing leading slash
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    const finalURL = page.url();
    expect(finalURL).toContain('host.docker.internal');
  });

  test('handles invalid base64 gracefully', async ({ page }) => {
    const invalidBase64 = 'this-is-not-valid-base64!!!';

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${invalidBase64}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('host.docker.internal');
  });

  test('blocks semicolon parameter pollution', async ({ page }) => {
    const maliciousPath = '/;https://attacker.example.org';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('attacker.example.org');
  });

  test('blocks combined attack: URL encoding + protocol-relative', async ({ page }) => {
    // //malicious.example.com URL-encoded
    const maliciousPath = '/%2F%2Fmalicious.example.com';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('malicious.example.com');
  });

  test('blocks combined attack: <br> + URL encoding', async ({ page }) => {
    // <br>https://phishing.test with "https" partially encoded
    const maliciousPath = '/<br>%68ttps://phishing.test';
    const encodedRedirect = Buffer.from(maliciousPath).toString('base64');

    await page.goto(`${LEAF_URLS.PORTAL_HOME}auth_domain/?r=${encodedRedirect}`);
    await page.waitForLoadState('networkidle');

    expect(page.url()).not.toContain('phishing.test');
  });
});