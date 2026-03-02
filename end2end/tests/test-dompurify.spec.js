import { test, expect } from '@playwright/test';

test('DOMPurify sanitizes HTML as expected', async ({ page }) => {
    await page.setContent(`
        <html>
        <head>
            <script src="https://host.docker.internal/Test_Request_Portal/js/dompurify.min.js"></script>
        </head>
        <body>
            <div id="output"></div>
            <script>
                function renderSanitized(html) {
                    return window.DOMPurify.sanitize(html);
                }
            </script>
        </body>
        </html>
    `);

    // Test 1: input with safe and unsafe HTML
    const input1 = `Safe<br>Test<script>alert('xss')</script>`;
    const sanitized1 = await page.evaluate((input) => {
        // @ts-ignore
        return window.renderSanitized(input);
    }, input1);
    expect(sanitized1).not.toContain('<script>');
    expect(sanitized1).not.toContain('alert');
    expect(sanitized1).toContain('<br>');

    // Test 2: input with <img> and onerror
    const input2 = `<img src='x' onerror='alert(1)'>`;
    const sanitized2 = await page.evaluate((input) => {
        // @ts-ignore
        return window.renderSanitized(input);
    }, input2);
    expect(sanitized2).toContain('<img');
    expect(sanitized2).not.toContain('onerror');
    expect(sanitized2).not.toContain('alert');

    // Test 3: input with <a> and javascript: URL
    const input3 = `<a href="javascript:alert('xss')">Click me</a>`;
    const sanitized3 = await page.evaluate((input) => {
        // @ts-ignore
        return window.renderSanitized(input);
    }, input3);
    expect(sanitized3).toContain('<a');
    expect(sanitized3).not.toContain('javascript:');
    expect(sanitized3).toContain('Click me');
});