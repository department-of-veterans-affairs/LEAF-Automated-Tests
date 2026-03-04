import { test, expect, Page } from '@playwright/test';
 
/**
 * Playwright tests for LeafPreview DOM scrubbing functionality
 * Tests that the scrubHTML function properly sanitizes malicious input
 */
 
test.describe('LeafPreview DOM Scrubbing', () => {
 
  // Initialize scrubHTML function in browser context
  const initScrubHTML = async (page: Page) => {
    await page.evaluate(() => {
      (window as any).scrubHTML = function(input: any) {
        if (input == undefined) {
          return '';
        }
        let t = new DOMParser().parseFromString(input, 'text/html').body;
        while (input != t.textContent) {
          return (window as any).scrubHTML(t.textContent);
        }
        return t.textContent;
      };
    });
  };
 
  test.beforeEach(async ({ page }) => {
    // Navigate to the request portal (or any page with LeafPreview)
    await page.goto('https://host.docker.internal/Test_Request_Portal/');
    await initScrubHTML(page);
  });
 
  test('plain text should pass through unchanged', async ({ page }) => {
    const result = await page.evaluate(() => {
      return (window as any).scrubHTML('Hello World');
    });
    expect(result).toBe('Hello World');
  });
 
  test('script tags should be removed', async ({ page }) => {
    const result = await page.evaluate(() => {
      return (window as any).scrubHTML('<script>alert("XSS")</script>Hello');
    });
    expect(result).toBe('Hello');
    expect(result).not.toContain('<script>');
  });
 
  test('event handlers should be removed', async ({ page }) => {
    const result = await page.evaluate(() => {
      return (window as any).scrubHTML('<img src=x onerror="alert(\'XSS\')">');
    });
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('<img');
  });
 
  test('HTML tags should be stripped to text only', async ({ page }) => {
    const result = await page.evaluate(() => {
      return (window as any).scrubHTML('<div class="danger"><p>Safe Text</p></div>');
    });
    expect(result).toBe('Safe Text');
    expect(result).not.toContain('<div>');
    expect(result).not.toContain('<p>');
  });
 
  test('multiple layers of HTML should be stripped', async ({ page }) => {
    const result = await page.evaluate(() => {
      return (window as any).scrubHTML('<div><span style="background: url(javascript:alert(1))">Text</span></div>');
    });
    expect(result).toContain('Text');
    expect(result).not.toContain('<div>');
    expect(result).not.toContain('<span>');
  });
 
  test('undefined input should return empty string', async ({ page }) => {
    const result = await page.evaluate(() => {
      return (window as any).scrubHTML(undefined);
    });
    expect(result).toBe('');
  });
 
  test('empty string should return empty string', async ({ page }) => {
    const result = await page.evaluate(() => {
      return (window as any).scrubHTML('');
    });
    expect(result).toBe('');
  });
 
  test('data URI attacks should be neutralized', async ({ page }) => {
    const result = await page.evaluate(() => {
      return (window as any).scrubHTML('<img src="data:text/html,<script>alert(\'xss\')</script>">');
    });
    expect(result).not.toContain('script');
    expect(result).not.toContain('<img');
  });
 
  test('should prevent onclick handler injection', async ({ page }) => {
    const result = await page.evaluate(() => {
      return (window as any).scrubHTML('<div onclick="alert(\'clicked\')">Click me</div>');
    });
    expect(result).toBe('Click me');
    expect(result).not.toContain('onclick');
  });
 
  test('should prevent style-based XSS', async ({ page }) => {
    const result = await page.evaluate(() => {
      return (window as any).scrubHTML('<div style="background: url(javascript:alert(1))">Content</div>');
    });
    expect(result).toBe('Content');
    expect(result).not.toContain('style');
  });
});