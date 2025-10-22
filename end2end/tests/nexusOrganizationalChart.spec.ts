import { test, expect } from '@playwright/test';
import { getRandomId } from '../leaf_test_utils/leaf_util_methods.ts';

//Run test in order
test.describe.configure({ mode: 'serial' });

const testPositionID = getRandomId();

//View Organizational Chart
test('Nexus View Organizational Charts link is functional', async ({ page}, testinfo) => {
  await page.goto('https://host.docker.internal/Test_Nexus/');

  //Wait for page to Load
  await expect(page.getByText('Browser View Organizational Charts Service Org. Chart View your service\'s Org.')).toBeVisible();
  await page.getByText('Browser View Organizational').click();

  //View Organizational Charts
  await expect(page.getByRole('button', { name: 'Medical Center Director' })).toBeVisible();

  //Screenshot of Org Chart
  const newOrgChart = await page.screenshot();
  await testinfo.attach('Org Chart', { body: newOrgChart, contentType: 'image/png' });
 
});


test('View Organization Details', async ({ page}, testinfo) => {
  await page.goto('https://host.docker.internal/Test_Nexus/');
  await expect(page.getByText('Browser View Organizational Charts Service Org. Chart View your service\'s Org.')).toBeVisible();
  await page.getByText('Browser View Organizational').click();

  //View Organizational Charts
  await expect(page.getByRole('button', { name: 'Edit Orgchart' })).toBeVisible();

  //Nav to Details Page
  const positionTitle = 'Assistant Director';
  const cardBtn = page.getByRole('button', { name: positionTitle, exact: true });
  const card = page.locator('div[id^="pos"].positionSmall').filter({ has: cardBtn });
  const cardLink = card.getByRole('link', { name: 'View Details' });
  await expect(cardBtn).toBeVisible();
  await cardBtn.hover();
  await expect(cardLink).toBeVisible();
  await cardLink.click();

  await expect(page.locator('#maincontent')).toBeVisible();
  //Display More Information
  await page.locator('#positionBody').getByRole('button', { name: 'Show_all_fields' }).click();
 
  //Verify Tools is displayed
  await expect(page.getByText('Tools View in Org Chart Add')).toBeVisible();

  //Verify Groups are displayed
  await expect(page.getByRole('heading', { name: 'Groups' })).toBeVisible();

  //Verify Security Permission is displayed
  await expect(page.getByText('Security Permissions You have')).toBeVisible();

  //Screenshot of Detail Page
  const newOrgDetails = await page.screenshot();
  await testinfo.attach('Org Details', { body: newOrgDetails, contentType: 'image/png' });
});


test('Relocate Cards', async ({ page}, testinfo) => {
 await page.goto('https://host.docker.internal/Test_Nexus/');

   //Wait for page to Load
  await expect(page.getByText('Browser View Organizational Charts Service Org. Chart View your service\'s Org.')).toBeVisible();
  await page.getByText('Browser View Organizational').click();

  //View Organizational Charts
  await expect(page.getByRole('button', { name: 'Edit Orgchart' })).toBeVisible();
  await page.getByRole('button', { name: 'Edit Orgchart' }).click();

    //Verify you are able to move
    await page.getByRole('button', { name: 'Zoom Out' }).click();
    await page.getByRole('button', { name: 'Zoom In' }).click();
    
    //Move card across the screen
    await page.getByRole('button', { name: 'AD, Patient Services' }).click();

   //loop through to move the cards across the screen

   //Set the counter for Arror Right
   let numberArray = [].constructor(51);
   let currentIndex = 0;

   for (let _ of numberArray) {      
   //Move Right
   await page.getByRole('button', { name: 'AD, Patient Services' }).press('ArrowRight');
    currentIndex++;
    }

   //reset counter for Arror Up
   numberArray = [].constructor(15);
   currentIndex = 0;
   for (let _ of numberArray) { 
    // Move Up
    await page.getByRole('button', { name: 'AD, Patient Services' }).press('ArrowUp');
     currentIndex++;
     }
 
  //Verify text displays to identify how to move cards
    await expect(page.getByText('You are moving the AD,')).toBeVisible(); 

    //Verify Card has been relocated
  const newCardMove = await page.screenshot();
  await testinfo.attach('Card Move', { body: newCardMove, contentType: 'image/png' });

});

test('Add Subordinate', async ({ page}, testInfo ) => {
  await page.goto('https://host.docker.internal/Test_Nexus/');
  await expect(page.getByText('Browser View Organizational Charts Service Org. Chart View your service\'s Org.')).toBeVisible();
  await page.getByText('Browser View Organizational').click();

  // Wait for Edit Orgchart button
  await expect(page.getByRole('button', { name: 'Edit Orgchart' })).toBeVisible();
  await page.getByRole('button', { name: 'Edit Orgchart' }).click();

  // Find position for test update
  const positionTitle = 'Chief of Everything';
  const cardBtn = page.getByRole('button', { name: positionTitle, exact: true });
  const card = page.locator('div[id^="pos"].positionSmall').filter({ has: cardBtn });
  const addSubBtn = card.getByRole('button', { name: 'Add Subordinate' });
  await expect(cardBtn).toBeVisible();
  await cardBtn.hover();
  await expect(addSubBtn).toBeVisible();
  await addSubBtn.click();

  // Fill the subordinate info
  const titleInput = page.getByLabel('Full Position Title:');
  await expect(titleInput).toBeVisible();
  await titleInput.fill(testPositionID);
  await page.getByRole('button', { name: 'Save Change' }).click();

  // Verify the subordinate card appears
  const newCard = page.getByRole('button', { name: testPositionID });
  await expect(newCard).toBeVisible();

  // Screenshot for validation
  const newCardCreated = await page.screenshot();
  await testInfo.attach('Card Create', { body: newCardCreated, contentType: 'image/png' });
});


// Remove Position
test('Remove Position', async ({ page}, testinfo) => {
  await page.goto('https://host.docker.internal/Test_Nexus/');
  await expect(page.getByText('Browser View Organizational Charts Service Org. Chart View your service\'s Org.')).toBeVisible();
  await page.getByText('Browser View Organizational').click();

  //View Details
  await page.getByRole('button', { name: 'Edit Orgchart' }).click();

  const positionTitle = testPositionID;
  const cardBtn = page.getByRole('button', { name: positionTitle, exact: true });
  const card = page.locator('div[id^="pos"].positionSmall').filter({ has: cardBtn });
  const cardLink = card.getByRole('link', { name: 'View Details' });
  await expect(cardBtn).toBeVisible();
  await cardBtn.hover();
  await expect(cardLink).toBeVisible();
  await cardLink.click();
  await expect(page.locator('#maincontent')).toBeVisible();

  //Remove Position
  await page.getByRole('button', { name: 'Delete Position Delete' }).click();

  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Yes' }).click();
  
  //Return to the main page
  await page.getByRole('link', { name: 'Main Page' }).click();
  await page.getByText('Browser').click();
  await expect(page.getByRole('button', { name: testPositionID })).not.toBeVisible();

  //Screenshot Card is removed
  const newCardRemoved = await page.screenshot();
  await testinfo.attach('Card Removed', { body: newCardRemoved, contentType: 'image/png' });
});