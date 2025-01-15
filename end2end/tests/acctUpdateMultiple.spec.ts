import { test, expect, Locator } from '@playwright/test';

test.use({
  ignoreHTTPSErrors: true
});


//This test has an user with multiple groups and positions
test('oldAcctGroupsAndPosition', async ({ page }, testInfo) => {
    
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/');
  
    //Open the New Account Update Page
    await page.getByRole('button', { name: ' New Account Updater' }).click();
  
    //Sync the Service first
    await page.getByRole('link', { name: 'Sync Services' }).click();

//Wait for the new page to popup
  const page1Promise = page.waitForEvent('popup');
  const page1 = await page1Promise;

//Verify the Sync Service was completed
 await expect(page1.getByText('Syncing services from Org Chart... Syncing has finished. You are set to go.')).toBeVisible();


//Return the the Admin page
 await page1.getByLabel('admin submenu').click();
 await page1.getByLabel('admin submenu').click();
 await page1.getByRole('link', { name: 'Admin Panel' }).click();

//Return to the New Account Update page
 const acctUpdate:Locator = page1.getByRole('button', { name: ' New Account Updater' });
 await acctUpdate.click();

 //Identify the Old Account to be disabled
const OldRep:Locator = page1.locator('css=input.employeeSelectorInput').nth(0);
await OldRep.click();
await OldRep.fill("vtrfaufelecia");
await page1.getByRole('cell', { name: 'Schultz, Phuong Boyer.' }).click();
 
const oldAcct:Locator = page1.getByLabel('Schultz, Phuong Boyer.');
oldAcct.click();

// Enter New Account information
const newRep:Locator = page1.locator('css=input.employeeSelectorInput').nth(1);
await newRep.click();
await newRep.fill("vtrvxhconception");
const newAcct:Locator = page1.getByLabel('Predovic, Augustine Hammes.');
newAcct.click();

await expect(page1.getByText('New Account Search results')).toBeVisible();

//Click to View Changes
const previewChange:Locator = page1.getByRole('button', {name: 'Preview Changes'});
await previewChange.hover();
await previewChange.click ();

//Old Account with Groups & Positions Veirfy Goups and Positions have value

//Group
await expect(page1.getByText('Export Group NameCurrent')).toBeVisible();

//Position
await expect(page1.getByText('Export Position TitleCurrent')).toBeVisible();

// Need screenshot inserted in here
const screenshot = await page.screenshot();
await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });

//Accept changes
await page1.getByRole('button', { name: 'Update Records' }).click();

//Group - Verify updates
await expect(page1.locator('#groups_updated')).toContainText('Removed vtrfaufelecia and added vtrvxhconception to Iron Sports (nexus)');

//Positions - Verify updates
await expect(page1.locator('#positions_updated')).toContainText('Removed vtrfaufelecia and added vtrvxhconception to position: LEAF Coaches');
await expect(page1.locator('#positions_updated')).toContainText('Removed vtrfaufelecia and added vtrvxhconception to position: Chief of Everything');
await expect(page1.locator('#positions_updated')).toContainText('Removed vtrfaufelecia and added vtrvxhconception to position: Chief, Facilties');
await expect(page1.locator('#positions_updated')).toContainText('Removed vtrfaufelecia and added vtrvxhconception to position: Dog Sitter West');

//No processing errors
await expect(page.locator('#no_errors')).toContainText('no errors');


});