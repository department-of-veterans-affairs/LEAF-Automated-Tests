import { test, expect } from '@playwright/test';

/**
 * end2end test for LEAF 5075
 */
test('Upload .mjs files to File Manager', async ({ page }) => {

  let fileUploaded = false;

  try {

    // Go to file manager and upload test .mjs file
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_file_manager');
    await page.getByRole('button', { name: 'Upload File' }).click();
    await page.getByLabel('Select file to upload').setInputFiles('./artifacts/LEAF-5086.mjs');

    // Verify file has been uploaded
    await expect(page.locator("[id$='_0_file']")).toContainText('../files/LEAF-5086.mjs');
    fileUploaded = true;

    // Click on file link and verify it opened with the correct content
    const filePromise = page.waitForResponse(
          res => res.url().includes('files/LEAF-5086.mjs') && res.status() === 200
    );
      
    await page.getByRole('link', { name: '../files/LEAF-5086.mjs' }).click();
    await expect(page.getByText('This is a test file for LEAF 5075 / LEAF 5086')).toBeVisible();

    // Verify that the content type is 'text/javascript'
    const fileRes = await filePromise;
    const headerContentType = fileRes.headers()?.['content-type'] ?? '';
    expect(headerContentType).toBe('text/javascript');

  } finally {

    // if the file was uploaded successfully delete it
    if(fileUploaded) {
      await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_file_manager');
      await page.locator("[id$='_0_delete']").getByRole('link', { name: 'Delete' }).click();
      await page.getByRole('button', { name: 'Yes' }).click();
    }
  }
});