import { test, expect } from '@playwright/test';
import { LEAF_URLS } from '../leaf_test_utils/leaf_util_methods';

test.describe('Shortener Security - Redirect Validation', () => {

  test.use({
    ignoreHTTPSErrors: true
  });

  let csrfToken: string;

  test.beforeEach(async ({ page }) => {
    await page.goto(LEAF_URLS.PORTAL_HOME);

    csrfToken = await page.evaluate(() => {
      return (window as any).CSRFToken || '';
    });

    if (!csrfToken) {
      const hiddenInput = page.locator('input[name="CSRFToken"]').first();
      if (await hiddenInput.count() > 0) {
        csrfToken = await hiddenInput.inputValue();
      }
    }
  });

  test('valid relative path redirects correctly', async ({ page }) => {
    const validPath = '/?a=reports&v=3';

    // Create shortened link
    const createResponse = await page.request.post(
      'https://host.docker.internal/Test_Request_Portal/api/open/report',
      {
        form: {
          CSRFToken: csrfToken,
          data: validPath
        },
        ignoreHTTPSErrors: true
      }
    );

    expect(createResponse.ok(), 'API should successfully create shortened link').toBeTruthy();
    const shortCode = JSON.parse(await createResponse.text());
    expect(shortCode.length, `Short code should be at least 5 characters, got: ${shortCode}`).toBeGreaterThanOrEqual(5);

    // Access the shortened URL using open.php?report={shortcode}
    await page.goto(`https://host.docker.internal/Test_Request_Portal/open.php?report=${shortCode}`);

    const finalURL = page.url();

    // Verify we got redirected to the reports page
    expect(finalURL, `Should redirect to reports page with 'a=reports' parameter, got: ${finalURL}`).toContain('a=reports');
    expect(finalURL, `Should preserve 'v=3' parameter in redirect, got: ${finalURL}`).toContain('v=3');
    expect(finalURL, `Should stay on our host (host.docker.internal), got: ${finalURL}`).toContain('host.docker.internal');
  });

  test('SECURITY: malicious external URL does NOT redirect to external domain', async ({ page }) => {
    const maliciousURL = 'https://evil.com/phishing';

    // Create shortened link with malicious URL
    const createResponse = await page.request.post(
      'https://host.docker.internal/Test_Request_Portal/api/open/report',
      {
        form: {
          CSRFToken: csrfToken,
          data: maliciousURL
        },
        ignoreHTTPSErrors: true
      }
    );

    expect(createResponse.ok(), 'API should accept the URL for storage (validation happens on retrieval)').toBeTruthy();
    const shortCode = JSON.parse(await createResponse.text());

    // Try to access the malicious shortened link
    await page.goto(`https://host.docker.internal/Test_Request_Portal/open.php?report=${shortCode}`);

    const finalURL = page.url();

    // CRITICAL SECURITY CHECK: We should NOT be at evil.com
    expect(finalURL, `SECURITY: Should NOT redirect to evil.com, got: ${finalURL}`).not.toContain('evil.com');
    expect(finalURL, `SECURITY: Should stay on our host after blocking malicious redirect, got: ${finalURL}`).toContain('host.docker.internal');
  });

  test('SECURITY: protocol-relative malicious URL blocked', async ({ page }) => {
    const maliciousURL = '//evil.com/attack';

    const createResponse = await page.request.post(
      'https://host.docker.internal/Test_Request_Portal/api/open/report',
      {
        form: {
          CSRFToken: csrfToken,
          data: maliciousURL
        },
        ignoreHTTPSErrors: true
      }
    );

    expect(createResponse.ok(), 'API should accept protocol-relative URL for storage').toBeTruthy();
    const shortCode = JSON.parse(await createResponse.text());

    await page.goto(`https://host.docker.internal/Test_Request_Portal/open.php?report=${shortCode}`);

    const finalURL = page.url();

    // Should NOT redirect to evil.com
    expect(finalURL, `SECURITY: Protocol-relative URL should NOT redirect to evil.com, got: ${finalURL}`).not.toContain('evil.com');
    expect(finalURL, `SECURITY: Should stay on our host after blocking protocol-relative attack, got: ${finalURL}`).toContain('host.docker.internal');
  });

  test('SECURITY: another malicious domain blocked', async ({ page }) => {
    const maliciousURL = 'http://malicious.example.com/steal-data';

    const createResponse = await page.request.post(
      'https://host.docker.internal/Test_Request_Portal/api/open/report',
      {
        form: {
          CSRFToken: csrfToken,
          data: maliciousURL
        },
        ignoreHTTPSErrors: true
      }
    );

    expect(createResponse.ok(), 'API should accept external URL for storage').toBeTruthy();
    const shortCode = JSON.parse(await createResponse.text());

    await page.goto(`https://host.docker.internal/Test_Request_Portal/open.php?report=${shortCode}`);

    const finalURL = page.url();

    // Should NOT redirect to malicious.example.com
    expect(finalURL, `SECURITY: Should NOT redirect to malicious.example.com, got: ${finalURL}`).not.toContain('malicious.example.com');
    expect(finalURL, `SECURITY: Should stay on our host after blocking external domain, got: ${finalURL}`).toContain('host.docker.internal');
  });

  test('admin path redirects correctly', async ({ page }) => {
    const adminPath = '/admin/';

    const createResponse = await page.request.post(
      'https://host.docker.internal/Test_Request_Portal/api/open/report',
      {
        form: {
          CSRFToken: csrfToken,
          data: adminPath
        },
        ignoreHTTPSErrors: true
      }
    );

    expect(createResponse.ok(), 'API should successfully create admin shortlink').toBeTruthy();
    const shortCode = JSON.parse(await createResponse.text());

    await page.goto(`https://host.docker.internal/Test_Request_Portal/open.php?report=${shortCode}`);

    const finalURL = page.url();

    // Verify we're on admin page
    expect(finalURL, `Should redirect to admin page, got: ${finalURL}`).toContain('admin');
    expect(finalURL, `Should stay on our host, got: ${finalURL}`).toContain('host.docker.internal');
    await expect(page.getByRole('heading', { name: 'Get Help' }), 'Admin page should display "Get Help" heading').toBeVisible();
  });

  test('report link storage and deduplication works', async ({ page }) => {
    const testURL = '/?a=reports&test=dedup';

    // Create first short code
    const response1 = await page.request.post(
      'https://host.docker.internal/Test_Request_Portal/api/open/report',
      {
        form: {
          CSRFToken: csrfToken,
          data: testURL
        },
        ignoreHTTPSErrors: true
      }
    );

    expect(response1.ok(), 'First shortlink creation should succeed').toBeTruthy();
    const shortCode1 = JSON.parse(await response1.text());

    // Create second short code with same data
    const response2 = await page.request.post(
      'https://host.docker.internal/Test_Request_Portal/api/open/report',
      {
        form: {
          CSRFToken: csrfToken,
          data: testURL
        },
        ignoreHTTPSErrors: true
      }
    );

    expect(response2.ok(), 'Second shortlink creation should succeed').toBeTruthy();
    const shortCode2 = JSON.parse(await response2.text());

    // Should be identical (proves DB storage and hash-based deduplication)
    expect(shortCode1, `Duplicate URLs should return same short code. First: ${shortCode1}, Second: ${shortCode2}`).toBe(shortCode2);
  });

  test('form query retrieval works correctly', async ({ page }) => {
    const queryData = JSON.stringify({
      terms: [
        { id: "recordID", operator: "=", match: "5", gate: "AND" }
      ],
      joins: [],
      sort: {}
    });

    const createResponse = await page.request.post(
      'https://host.docker.internal/Test_Request_Portal/api/open/form/query',
      {
        form: {
          CSRFToken: csrfToken,
          data: queryData
        },
        ignoreHTTPSErrors: true
      }
    );

    expect(createResponse.ok(), 'Form query shortlink creation should succeed').toBeTruthy();
    const shortCode = JSON.parse(await createResponse.text());
    expect(shortCode.length, `Short code should be at least 5 characters, got: ${shortCode}`).toBeGreaterThanOrEqual(5);

    // Retrieve using the correct pattern: api/open/form/query/_{shortcode}
    const retrieveURL = `https://host.docker.internal/Test_Request_Portal/api/open/form/query/_${shortCode}`;
    const retrieveResponse = await page.request.get(retrieveURL, {
      ignoreHTTPSErrors: true
    });

    expect(retrieveResponse.ok(), `Form query retrieval should succeed for URL: ${retrieveURL}`).toBeTruthy();
    const data = await retrieveResponse.json();

    // Verify we got record 5 back
    expect(data, 'Form query should return data with record ID 5').toHaveProperty('5');
  });

  test('short codes have valid base56 format', async ({ page }) => {
    const response = await page.request.post(
      'https://host.docker.internal/Test_Request_Portal/api/open/report',
      {
        form: {
          CSRFToken: csrfToken,
          data: '/admin/'
        },
        ignoreHTTPSErrors: true
      }
    );

    expect(response.ok(), 'Shortlink creation should succeed').toBeTruthy();
    const shortCode = JSON.parse(await response.text());

    // At least 5 characters (due to offset of 10000000)
    expect(shortCode.length, `Short code should be at least 5 characters due to offset, got: ${shortCode}`).toBeGreaterThanOrEqual(5);

    // Only valid base56 characters (no 0, 1, I, O, l)
    const validChars = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz]+$/;
    expect(shortCode, `Short code should only contain base56 characters (no 0, 1, I, O, l), got: ${shortCode}`).toMatch(validChars);
  });
});