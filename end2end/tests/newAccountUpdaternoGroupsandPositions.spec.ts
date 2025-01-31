import { test, expect, Locator } from '@playwright/test';


//Test the old user do not have any groups and positions and everything works correctly
test('validate User does not have any Groups Or Positions', async ({ page }, testInfo) => {
    
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/');
  //Open the New Account Update Page
    await page.getByRole('button', { name: ' New Account Updater' }).click();
  //Sync the Service forst
  
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
await OldRep.fill("vtrmvtlynnette");
await page1.getByRole('cell', { name: 'Jacobs, Gilbert Wilderman.' }).click();
  
 
const oldAcct:Locator = page1.getByLabel('Jacobs, Gilbert Wilderman.');
oldAcct.click();


const screenshot = await page.screenshot()
await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });

// Enter New Account information
const newRep:Locator = page1.locator('css=input.employeeSelectorInput').nth(1);
await newRep.click();
await newRep.fill("vtrkmwroseann");
 

const newAcct:Locator = page1.getByLabel('Greenholt, Shirlene Parisian');
newAcct.click();

//await expect(page.getByRole('button', { name: 'Preview Changes' })).toBeInViewport();

await expect(page1.getByText('New Account Search results')).toBeVisible();


//Click to View Changes

const previewChange:Locator = page1.getByRole('button', {name: 'Preview Changes'});
await previewChange.hover();
await previewChange.click ();

  
await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
  
//Wait for page to refresh (


  //Veirfy Goups and Positions is empty. 

  await expect (page1.locator('#grid_groups_info')).toContainText('No groups found');

 await expect (page1.locator('#grid_positions_info')).toContainText('No Positions found');
 
 await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });

//Accept changes
await page1.getByRole('button', { name: 'Update Records' }).click();

await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });

//await expect(page1.getByText('Syncing has finished. You are')).toBeInViewport();
//Verify there are not any group/positions updates
await expect(page1.locator('#groups_no_updates')).toContainText('no updates');
await expect(page1.locator('#positions_no_updates')).toContainText('no updates');

//No processing errors
await expect(page.locator('#no_errors')).toContainText('no errors');
await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });


});