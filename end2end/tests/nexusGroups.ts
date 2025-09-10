import { test, expect } from '@playwright/test';


test('Delete Group Tags', async ({ page }) => {

  let academyDemoDeleted = false;
  let eltDeleted = false;
  let serviceDeleted = false;

  try{
    // Search for groups
    await page.goto('https://host.docker.internal/Test_Nexus/');
    await page.getByLabel('Search', { exact: true }).click();
    await page.keyboard.type('Group');
    await expect(page.getByText('Distribution Groups')).toBeVisible();

    // Confirm AS Test Group exists
    const asTestGroupLink = page.getByRole('link', { name: 'AS Test Group', exact: true }).nth(1);
    const asTestGroupLinkCount = await asTestGroupLink.count();

    if(asTestGroupLinkCount === 0) {
      console.warn('Group AS Test Group not found. Skipping test - record may not exist in current environment.');
      test.skip(true, 'AS Test Group not available');
      return;
    }

    // Go to AS Test Group
    await asTestGroupLink.click();
    await expect(page.getByText('AS Test Group')).toBeVisible();

    // Delete Academy_Demo1 tag
    await page.getByLabel('Academy_Demo1. Click to').click();
    await page.getByRole('button', { name: 'Yes' }).click();
    await expect(page.getByText('Academy_Demo1')).not.toBeVisible();
    academyDemoDeleted = true;
  
    // Delete ELT tag
    await page.getByLabel('ELT. Click to delete tag').click();
    await page.getByRole('button', { name: 'Yes' }).click();
    await expect(page.getByText('ELT', {exact: true})).not.toBeVisible();
    eltDeleted = true;

    // Delete service tag
    await page.getByLabel('service. Click to delete tag').click();
    await page.getByRole('button', { name: 'Yes' }).click();
    await expect(page.getByText('service', {exact: true})).not.toBeVisible();
    serviceDeleted = true;

  } 
  finally {
    try {
      if(academyDemoDeleted) {
        await page.getByRole('button', { name: 'Add Custom Tag' }).click();
        await page.getByLabel('Tag Name:').click();
        await page.getByLabel('Tag Name:').fill('Academy_Demo1');
        await page.getByRole('button', { name: 'Save Change' }).click();
        await expect(page.getByLabel('Academy_Demo1. Click to')).toContainText('Academy_Demo1');
      }
      if(eltDeleted) {
        await page.getByRole('button', { name: 'Add \'ELT\'' }).click();
        await expect(page.getByLabel('ELT. Click to delete tag')).toContainText('ELT');
      }
      if(serviceDeleted) {
        await page.getByRole('button', { name: 'Add \'service\'' }).click();
        await expect(page.getByLabel('service. Click to delete tag')).toContainText('service');
      }    
      
    } catch(cleanupError) {
      console.error(`Cleanup failed: ${cleanupError}`);
      // Don't fail the test due to cleanup issues, but log the problem
    }
  }
  
});