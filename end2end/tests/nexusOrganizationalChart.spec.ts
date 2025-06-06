import { test, expect, Locator } from '@playwright/test';

//Run test in order
test.describe.configure({ mode: 'serial' });


//View Organizational Chart
test ('View Organizational Charts', async ({ page}, testinfo) => {
  
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
// End of Organizational Chart


//View Organization Details
test ('View Organization Details', async ({ page}, testinfo) => {

    await page.goto('https://host.docker.internal/Test_Nexus/');

    //Wait for page to Load
    await expect(page.getByText('Browser View Organizational Charts Service Org. Chart View your service\'s Org.')).toBeVisible();
    await page.getByText('Browser View Organizational').click();
 
    //View Organizational Charts
    await expect(page.getByRole('button', { name: 'Edit Orgchart' })).toBeVisible();
    await page.getByRole('button', { name: 'Assistant Director', exact: true }).click();
    await page.getByRole('button', { name: 'Assistant Director', exact: true }).hover();
 
  //View Cheif of Staff Director Details Page
  await page.getByRole('link', { name: 'View Details' }).click();
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
//View Card Details


//Relocate cards
test ('Relocate Cards', async ({ page}, testinfo) => {
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

  // Wait for homepage to load
  await expect(
    page.getByText("Browser View Organizational Charts Service Org. Chart View your service's Org.")
  ).toBeVisible({ timeout: 30000 });

  await page.getByText('Browser View Organizational').click();

  // Wait for Edit Orgchart button
  await expect(page.getByRole('button', { name: 'Edit Orgchart' })).toBeVisible({ timeout: 30000 });
  await page.getByRole('button', { name: 'Edit Orgchart' }).click();

  // Zoom In and find position
  await expect(page.getByRole('button', { name: 'Zoom In' })).toBeVisible({ timeout: 30000 });
  const chiefBtn = page.getByRole('button', { name: 'Chief of Everything' });
  await expect(chiefBtn).toBeVisible();
  await chiefBtn.hover();

  // Click "Add Subordinate"
  // const addSubBtn = page.getByRole('button', { name: 'Add Subordinate' });
  const addSubBtn = page.locator(`body > main:nth-child(3) > div:nth-child(2) > div:nth-child(1) > div:nth-child(9) > div:nth-child(3) > div:nth-child(2) > button:nth-child(2)`);
  await expect(addSubBtn).toBeVisible();
  await addSubBtn.click();

  // Fill the subordinate info
  const titleInput = page.getByLabel('Full Position Title:');
  await expect(titleInput).toBeVisible({ timeout: 30000 });
  await titleInput.fill('Medical Tech Test');

  await page.getByRole('button', { name: 'Save Change' }).click();

  // Verify the subordinate card appears
  const newCard = page.getByRole('button', { name: 'Medical Tech Test' });
  await expect(newCard).toBeVisible({ timeout: 10000 });

  // Screenshot for validation
  const newCardCreated = await page.screenshot();
  await testInfo.attach('Card Create', { body: newCardCreated, contentType: 'image/png' });
});

// New Subordinate


// Remove Position
test ('Remove Position', async ({ page}, testinfo) => {

  await page.goto('https://host.docker.internal/Test_Nexus/');

  //Wait for page to Load
  await expect(page.getByText('Browser View Organizational Charts Service Org. Chart View your service\'s Org.')).toBeVisible();
 
  await page.getByText('Browser View Organizational').click();

  //Select a card
  await expect(page.getByRole('button', { name: 'Medical Tech Test' })).toBeVisible();
  await page.getByRole('button', { name: 'Medical Tech Test' }).click();

  //View Details
  await page.getByRole('button', { name: 'Edit Orgchart' }).click();
  await page.getByRole('button', { name: 'Medical Tech Test ' }).hover();

  await page.getByRole('link', { name: 'View Details' }).click();

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

     //Verify remove
  await expect(page.getByRole('button', { name: 'Medical Tech Test' })).not.toBeVisible();

  //Screenshot Card is removed
  const newCardRemoved = await page.screenshot();
  await testinfo.attach('Card Removed', { body: newCardRemoved, contentType: 'image/png' });
});