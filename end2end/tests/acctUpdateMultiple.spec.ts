import { test, expect, Locator } from '@playwright/test';

test.use({
  ignoreHTTPSErrors: true
});

test.only('oldAcctGroupsAndPosition', async ({ page }) => {
    
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/');
  //Open the New Account Update Page
    await page.getByRole('button', { name: ' New Account Updater' }).click();
  //Sync the Service forst
  
  await page.getByRole('link', { name: 'Sync Services' }).click();

//Wait for the new page to popup
  const page1Promise = page.waitForEvent('popup');
  const page1 = await page1Promise;

//Verify the Sync Service was completed
  await expect(page1.getByText('Syncing has finished. You are')).toBeInViewport();

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
await OldRep.fill("vtriujtalisha");
//await expect(page.getByText('Old Account Search results')).toBeInViewport();
//await expect(page.getByRole('cell', { name: 'Jacobs, Gilbert Wilderman.' })).toBeInViewport();
await page1.getByRole('cell', { name: 'Kozey, Kirstin Schimmel.' }).click();
  
 
const oldAcct:Locator = page1.getByLabel('Kozey, Kirstin Schimmel.');
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

//Old Account with Groups & Positions

  //Veirfy Goups and Positions is empty have value

  await expect (page1.locator('#grid_groups_info')).toContainText('No groups found');

 await expect (page1.locator('#grid_positions_info')).toContainText('No Positions found');
 
//Accept changes
await page1.getByRole('button', { name: 'Update Records' }).click();

//await expect(page1.getByText('Syncing has finished. You are')).toBeInViewport();
//Verify there are not any group/positions updates
await expect(page1.locator('#groups_no_updates')).toContainText('no updates');
await expect(page1.locator('#positions_no_updates')).toContainText('no updates');

//No processing errors
await expect(page.locator('#no_errors')).toContainText('no errors');


});