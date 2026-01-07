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

    expect(createResponse.ok()).toBeTruthy();
    const shortCode = JSON.parse(await createResponse.text());
    console.log(`Created short code: ${shortCode} for path: ${validPath}`);

    // Access the shortened URL using open.php?report={shortcode}
    await page.goto(`https://host.docker.internal/Test_Request_Portal/open.php?report=${shortCode}`);

    const finalURL = page.url();
    console.log(`Final URL: ${finalURL}`);

    // Verify we got redirected to the reports page
    expect(finalURL).toContain('a=reports');
    expect(finalURL).toContain('v=3');
    expect(finalURL).toContain('host.docker.internal');

    console.log(`✓ Valid redirect working: ${finalURL}`);
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

    const shortCode = JSON.parse(await createResponse.text());
    console.log(`Created short code: ${shortCode} for malicious URL: ${maliciousURL}`);

    // Try to access the malicious shortened link
    await page.goto(`https://host.docker.internal/Test_Request_Portal/open.php?report=${shortCode}`);

    const finalURL = page.url();
    console.log(`Final URL after accessing malicious short link: ${finalURL}`);

    // CRITICAL SECURITY CHECK: We should NOT be at evil.com
    expect(finalURL).not.toContain('evil.com');

    // We should still be on our host
    expect(finalURL).toContain('host.docker.internal');

    console.log(`✓ SECURITY VERIFIED: Malicious redirect blocked, stayed on: ${finalURL}`);
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

    const shortCode = JSON.parse(await createResponse.text());
    console.log(`Testing protocol-relative URL: ${maliciousURL} -> ${shortCode}`);

    await page.goto(`https://host.docker.internal/Test_Request_Portal/open.php?report=${shortCode}`);

    const finalURL = page.url();

    // Should NOT redirect to evil.com
    expect(finalURL).not.toContain('evil.com');
    expect(finalURL).toContain('host.docker.internal');

    console.log(`✓ Protocol-relative URL blocked: ${finalURL}`);
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

    const shortCode = JSON.parse(await createResponse.text());
    console.log(`Testing malicious domain: ${maliciousURL} -> ${shortCode}`);

    await page.goto(`https://host.docker.internal/Test_Request_Portal/open.php?report=${shortCode}`);

    const finalURL = page.url();

    // Should NOT redirect to malicious.example.com
    expect(finalURL).not.toContain('malicious.example.com');
    expect(finalURL).toContain('host.docker.internal');

    console.log(`✓ Malicious domain blocked: ${finalURL}`);
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

    const shortCode = JSON.parse(await createResponse.text());
    console.log(`Created short code for admin: ${shortCode}`);

    await page.goto(`https://host.docker.internal/Test_Request_Portal/open.php?report=${shortCode}`);

    const finalURL = page.url();

    // Verify we're on admin page
    expect(finalURL).toContain('admin');
    expect(finalURL).toContain('host.docker.internal');
    await expect(page.getByRole('heading', { name: 'Get Help' })).toBeVisible();

    console.log(`✓ Admin path redirect working: ${finalURL}`);
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

    expect(response1.ok()).toBeTruthy();
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
    const shortCode2 = JSON.parse(await response2.text());

    // Should be identical (proves DB storage)
    expect(shortCode1).toBe(shortCode2);
    console.log(`✓ Report link deduplication working: ${shortCode1}`);
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

    expect(createResponse.ok()).toBeTruthy();
    const shortCode = JSON.parse(await createResponse.text());

    // Retrieve using the correct pattern: api/open/form/query/_{shortcode}
    const retrieveURL = `https://host.docker.internal/Test_Request_Portal/api/open/form/query/_${shortCode}`;
    const retrieveResponse = await page.request.get(retrieveURL, {
      ignoreHTTPSErrors: true
    });

    expect(retrieveResponse.ok()).toBeTruthy();
    const data = await retrieveResponse.json();

    // Verify we got record 5 back
    expect(data).toHaveProperty('5');
    console.log(`✓ Form query retrieved successfully`);
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

    const shortCode = JSON.parse(await response.text());

    // At least 5 characters (due to offset of 10000000)
    expect(shortCode.length).toBeGreaterThanOrEqual(5);

    // Only valid base56 characters (no 0, 1, I, O, l)
    const validChars = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz]+$/;
    expect(shortCode).toMatch(validChars);

    console.log(`✓ Short code format valid: ${shortCode}`);
  });
});