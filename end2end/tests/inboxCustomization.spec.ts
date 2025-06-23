import { test, expect } from '@playwright/test';
import { Dir } from 'fs';

//This test is designed to test LEAF
test.describe.configure({ mode: 'default' });

//Global Variables
let siteMapname = `LEAF 4832 - Customization`;
let siteMapDesc = 'Testing for LEAF 4823 Customization';
let leafSiteCard = 'LEAF 4832 - CustomizationTesting for LEAF 4823 Customization';

let serviceRequest ='LEAF 4832 - Request';
let serviceRequest2 ='LEAF 4832 - Request2';
let stapledRequest = 'LEAF 4832 - Stapled Request';
let stapleName = 'Test IFTHEN staple | Multiple person designated';
let requestId;
let requestId2
let stapledRequestId;


test.describe('SiteMap Creation, Verification and Inbox Customazation', () => {
test('create New Sitemap Card', async ({ page }, testInfo) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/');
  
  await page.getByRole('link', { name: 'Admin Panel' }).click();
  await page.getByRole('button', { name: ' Sitemap Editor Edit portal' }).click();

  await expect(page.getByRole('button', { name: '+ Add Site' })).toBeVisible();


 //Check to see if Custom LEAF Sitemap is present
  if ( await page.getByText(leafSiteCard).isVisible() ){
    //Perform Cleanup
  console.log("Cleanup");
  await expect(page.getByRole('button', { name: '+ Add Site' })).toBeVisible();
  await page.getByRole('heading', { name: siteMapname }).getByRole('link').click();
  await page.getByRole('button', { name: 'Delete Site' }).click();

  } 
    console.log ("Sitemap not present");
  

  //Style the Sitemap
  let siteMapURL = 'https://host.docker.internal/Test_Request_Portal/';
  let siteMapColor = '#5d1adb';
  let siteMapFontColor = '#e2db08';
  await page.getByRole('button', { name: '+ Add Site' }).click();
  await page.locator('#button-title').click();
  await page.locator('#button-title').fill(siteMapname);
  await page.getByRole('textbox', { name: 'Enter group name' }).click();
  await page.getByRole('textbox', { name: 'Enter group name' }).fill(siteMapDesc);
  await page.locator('#button-target').click();
  await page.locator('#button-target').click();
  await page.locator('#button-target').fill(siteMapURL);
  await page.locator('input[name="btnColor"]').click();
  await page.locator('input[name="btnColor"]').fill(siteMapColor);
  await page.locator('input[name="btnFntColor"]').click();
  await page.locator('input[name="btnFntColor"]').fill(siteMapFontColor);
  await page.locator('#xhr').click();
  await page.getByRole('img', { name: 'application-x-executable.svg' }).click();
  await page.getByRole('button', { name: 'Save Change' }).click();

  //Verify the customized card is present
  await expect(page.getByText(leafSiteCard)).toBeVisible();
 
  //Screenshot
  const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });

});

//Inbox before Customization
test('Display Inbox Sitemap Personalization', async ({ page }, testInfo) => {

 await page.goto('https://host.docker.internal/Test_Request_Portal/');
  
  //Open the Inbox
  await expect(page.getByText('Inbox Review and apply')).toBeVisible();
  await page.getByText('Inbox Review and apply').click();

  await page.waitForLoadState('load');

  //Verify the customization is present 
  await expect(page.locator('#inbox').getByText(siteMapname)).toBeVisible();
  await expect(page.locator('#indexSites')).toContainText(siteMapname);


  //Verify display based on View
  //Form View
   await page.getByRole('button', { name: 'Toggle sections' }).click();
  
  //Complex Form View
  const uidCol = page.locator('text=UID').nth(0);
  expect(await uidCol.isVisible()).toBeTruthy();

  const serviceCol = page.locator('text=Service').nth(0);
  expect(await serviceCol.isVisible).toBeTruthy();

  const titleCol = page.locator('text=Title').nth(0);
  expect(await titleCol.isVisible).toBeTruthy();

  const statusCol = page.locator('text=Status').nth(0);
  expect(await statusCol.isVisible).toBeTruthy();

  const actionCol = page.locator('text=Action').nth(0);
  expect(await actionCol.isVisible).toBeTruthy();

   //Role View
   await expect(page.getByRole('button', { name: 'Organize by Roles' })).toBeVisible();
  await page.getByRole('button', { name: 'Organize by Roles' }).click();

  const dynTxt = 'Tester Tester View';
  const dynRegex = new RegExp(`^${dynTxt}.*`);
  await page.getByRole('button', { name: dynRegex}).click();

  const uidColrole = page.locator('text=UID').nth(0);
  expect(await uidColrole.isVisible()).toBeTruthy();

  const typeColrole = page.locator('text=Type').nth(0);
  expect(await typeColrole.isVisible).toBeTruthy();

  const serviceColrole = page.locator('text=Service').nth(2);
  expect(await serviceColrole.isVisible).toBeTruthy();

  const titleColrole = page.locator('text=Title').nth(0);
  expect(await titleColrole.isVisible).toBeTruthy();

  const statusColrole = page.locator('text=Status').nth(0);
  expect(await statusColrole.isVisible).toBeTruthy();

  const actionColrole = page.locator('text=Action').nth(0);
  expect(await actionColrole.isVisible).toBeTruthy();


});
//Add additional customization
test('Customized Column Display', async ({ page }, testInfo) => {

 await page.goto('https://host.docker.internal/Test_Request_Portal/');
  await page.getByRole('link', { name: 'Admin Panel' }).click();
  await expect(page.getByRole('button', { name: ' Combined Inbox Editor Edit' })).toBeVisible();
  await page.getByRole('button', { name: ' Combined Inbox Editor Edit' }).click();

   await page.waitForLoadState('load');
  await expect(page.getByText(siteMapname, { exact: true })).toBeVisible();

  //Get ID
  const option =await (page.getByText('☰ LEAF 4832 - Customization'));
 const siteId = await option.getAttribute('value');
 const  leafSiteId = `#site-container-${siteId}`;

  console.log('Text ID:', leafSiteId);
 

 //Add Customization

   await page.locator(leafSiteId).getByRole('textbox', { name: 'Click to search. Limit 7' }).click();
  await page.locator(leafSiteId).getByRole('textbox', { name: 'Click to search. Limit 7' }).fill('p');
  await page.locator(leafSiteId).getByRole('textbox', { name: 'Click to search. Limit 7' }).press('Enter');
  await page.locator(leafSiteId).getByRole('textbox', { name: 'Click to search. Limit 7' }).fill('d');
  await page.locator(leafSiteId).getByRole('textbox', { name: 'Click to search. Limit 7' }).press('ArrowDown');
  await page.locator(leafSiteId).getByRole('textbox', { name: 'Click to search. Limit 7' }).press('ArrowDown');
  await page.locator(leafSiteId).getByRole('textbox', { name: 'Click to search. Limit 7' }).press('Enter');

  await page.getByRole('link', { name: 'Home' }).click();
  await expect(page.getByText('Review and apply actions to')).toBeVisible();

   await page.waitForLoadState('load');
  await expect(page.getByText('Inbox Review and apply')).toBeVisible();
  await page.getByText('Inbox Review and apply').click();

  await expect(page.getByRole('button', { name: 'Organize by Roles' })).toBeVisible();
  await page.getByRole('button', { name: 'Organize by Roles' }).click();

  const dynTxt = 'Tester Tester View';
  const dynRegex = new RegExp(`^${dynTxt}.*`);
  await page.getByRole('button', { name: dynRegex}).click();

  //Verify Role Customization
  const uidColrole = page.locator('text=UID').nth(0);
  expect(await uidColrole.isVisible()).toBeTruthy();

    const typeColrole = page.locator('text=Type').nth(0);
  expect(await typeColrole.isVisible).toBeTruthy();

  const serviceColrole = page.locator('text=Service').nth(2);
  expect(await serviceColrole.isVisible).toBeTruthy();

  const titleColrole = page.locator('text=Title').nth(0);
  expect(await titleColrole.isVisible).toBeTruthy();

  const statusColrole = page.locator('text=Status').nth(0);
  expect(await statusColrole.isVisible).toBeTruthy();

  const actionColrole = page.locator('text=Action').nth(0);
  expect(await actionColrole.isVisible).toBeTruthy();

  const priorityColrole = page.locator('text=Priority').nth(0);
  expect(await priorityColrole.isVisible).toBeTruthy();

  const daysColrole = page.locator('text=Days Since Last Action').nth(0);
  expect(await daysColrole.isVisible).toBeTruthy();


 //Form View
  await page.getByRole('button', { name: 'Organize by Forms' }).click();
 
  const dynTxt2 = 'Complex Form';
  const dynRegex2 = new RegExp(`^${dynTxt2}.*`);
  await page.getByRole('button', { name: dynRegex2}).click();
  
  //Complex Form View
  const uidCol = page.locator('text=UID').nth(0);
  expect(await uidCol.isVisible()).toBeTruthy();

  const serviceCol = page.locator('text=Service').nth(0);
  expect(await serviceCol.isVisible).toBeTruthy();

  const titleCol = page.locator('text=Title').nth(0);
  expect(await titleCol.isVisible).toBeTruthy();

  const statusCol = page.locator('text=Status').nth(0);
  expect(await statusCol.isVisible).toBeTruthy();

  const actionCol = page.locator('text=Action').nth(0);
  expect(await actionCol.isVisible).toBeTruthy();

   const priorityCol = page.locator('text=Priority').nth(0);
  expect(await priorityCol.isVisible).toBeTruthy();

  const daysCol = page.locator('text=Days Since Last Action').nth(0);
  expect(await daysCol.isVisible).toBeTruthy();

 });

//Personalized a Form
test('Personalized a Form', async ({ page }, testInfo) => {

  await page.goto('https://host.docker.internal/Test_Request_Portal/');
  
  await expect(page.getByRole('link', { name: 'Admin Panel' })).toBeVisible();
  await page.getByRole('link', { name: 'Admin Panel' }).click();
  await expect(page.getByRole('button', { name: ' Combined Inbox Editor Edit' })).toBeVisible();
  await page.getByRole('button', { name: ' Combined Inbox Editor Edit' }).click();
  
await page.waitForLoadState();

  await expect(page.getByText('☰ LEAF 4832 - Customization')).toBeVisible();
  
    //Get ID
  const option =await (page.getByText('☰ LEAF 4832 - Customization'));
 const siteId = await option.getAttribute('value');
 const  leafSiteId = `#site-container-${siteId}`;
 const formSiteId = `#form_select_${siteId}`;

  console.log('Text ID:', leafSiteId);


  await page.locator(formSiteId).selectOption('form_f8b95');

 await page.locator(leafSiteId).getByText('StatusRemove item').click();

  await page.locator(leafSiteId).getByRole('textbox', { name: 'Click to search. Limit 7' }).click();
  await page.locator(leafSiteId).getByRole('textbox', { name: 'Click to search. Limit 7' }).fill('d');
  await page.locator(leafSiteId).getByRole('textbox', { name: 'Click to search. Limit 7' }).press('ArrowDown');
  await page.locator(leafSiteId).getByRole('textbox', { name: 'Click to search. Limit 7' }).press('ArrowDown');
  await page.locator(leafSiteId).getByRole('textbox', { name: 'Click to search. Limit 7' }).press('ArrowDown');
  await page.locator(leafSiteId).getByRole('textbox', { name: 'Click to search. Limit 7' }).press('Enter');
  await page.locator(leafSiteId).getByRole('textbox', { name: 'Click to search. Limit 7' }).click();
  await page.locator(leafSiteId).getByRole('textbox', { name: 'Click to search. Limit 7' }).fill('s');
  await page.locator(leafSiteId).getByRole('textbox', { name: 'Click to search. Limit 7' }).press('Enter');


   //Check Inbox to verify updates
  await page.getByRole('link', { name: 'Home' }).click();

  //Open the Inbox
  await expect(page.getByText('Inbox Review and apply')).toBeVisible();
  await page.getByText('Inbox Review and apply').click();
 
 await page.waitForLoadState('load');
  //await page.getByRole('button', { name: 'Toggle sections' }).click();

  const dynTxt2 = 'Multiple person designated View';
  const dynRegex2 = new RegExp(`^${dynTxt2}.*`);

  await page.getByRole('button', { name: dynRegex2}).click();

  const reviewCol = page.locator('text=Reviewer 1').nth(0);
  expect(await reviewCol.isVisible).toBeTruthy();

  const dateCol = page.locator('text=Date Submitted').nth(0);
  expect(await dateCol.isVisible).toBeTruthy();

  //Screenshot
  const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });

});

 });
 //End of Creation and Customization

test.describe('Creating and Validating Form Displays', () => {

//Create a New MUltipleperson request
test('Create a new Multiple Person Form', async ({ page }, testInfo) => {

  await page.goto('https://host.docker.internal/Test_Request_Portal/');

  //Start a new Multiple person designated
  await page.getByText('New Request Start a new').click();

  //Enter data needed to create Request
  await expect(page.getByRole('heading', { name: 'Step 1 - General Information' })).toBeVisible();
  await page.getByRole('cell', { name: 'Select an Option Service' }).locator('a').click();
  await page.getByRole('option', { name: 'AS - Service' }).click();
  await page.getByText('Please enter keywords to').click();
  await page.getByRole('textbox', { name: 'Title of Request' }).click();
  await page.getByRole('textbox', { name: 'Title of Request' }).fill(serviceRequest);
  await page.locator('label').filter({ hasText: 'Multiple person designated' }).locator('span').click();

  await page.getByRole('button', { name: 'Click here to Proceed' }).click();

  //Enter the Reviewer Information
  await expect(page.getByText('Form completion progress: 0% Next Question')).toBeVisible();

  //Get UID
  requestId = await page.textContent('#headerTab');
  console.log('Text inside span:', requestId);
  let str: string = requestId;
  let parts = str.split("#", 2);
  let firstPart = parts[0];
  let secondPart = parts[1];
  console.log(firstPart, secondPart);
  requestId =secondPart;
  let indicatorID;

  const indicators = page.locator('[id^="loadingIndicator_"]');
 
  const reviewer1Id = await indicators.nth(0).getAttribute('id');
  const reviewer2Id = await indicators.nth(1).getAttribute('id');
 
  console.log('Reviewer 1 ID:', reviewer1Id);
  console.log('Reviewer 2 ID:', reviewer2Id);

  await page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 1' }).fill('ad');
  await page.getByRole('cell', { name: 'Wolf, Adan Williamson. Direct' }).click();

  await expect(page.getByRole('cell', { name: 'Wolf, Adan Williamson. Direct' })).toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 1' })).toHaveValue('userName:VTRHJHROSARIO');

  await page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 2' }).fill('h');
  await page.getByRole('cell', { name: 'Hackett, Linsey Spinka.' }).click();


  const loadingInc = await page.locator(`#${reviewer2Id}`);
  await expect(loadingInc).toBeVisible();
  console.log('text', loadingInc);
  await expect(loadingInc).not.toBeVisible();
  //await page.locator(reviewer2Id).to

  await expect(page.getByRole('cell', { name: 'Hackett, Linsey Spinka.' })).toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 2' })).toHaveValue('userName:VTRXVPMADELAINE');

 // const myLocator = page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 2' });
//  myLocator.waitFor();


//await page.waitForSelector('searchbox', { name: 'Search for user to add as Reviewer 2' }).
//console.log('Search results are visible!');/

 //Screenshot
  const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });

  await expect(page.locator('#nextQuestion2')).toBeVisible();
  await page.locator('#nextQuestion2').click({force:true});
  
   //Submit Request
   //await page.waitForSelector('#')

 page.waitForLoadState('domcontentloaded');

  await expect(page.getByRole('button', { name: 'Submit Request' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit Request' }).click({force:true});
  await page.getByRole('link', { name: 'Home' }).click();


});

test('View Request in Inbox', async ({ page }, testInfo) => {

  await page.goto('https://host.docker.internal/Test_Request_Portal/');

  await page.getByText('Review and apply actions to').click();

  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('#inbox').getByText(siteMapname)).toBeVisible();
  await expect(page.getByRole('button', { name: 'View as Admin' })).toBeVisible();
  

 // await page.getByRole('button', {name:'Multiple person designated'}).click();
  await page.getByRole('button', { name: 'Organize by Roles' }).click();
  await page.getByRole('button', { name: 'View as Admin' }).click();

  const dynTxt = 'Adan Wolf View ';
  const dynRegex = new RegExp(`^${dynTxt}.*`);
  await page.getByRole('button', { name: dynRegex}).click();
 
 //Verify Text
 
  await expect(page.getByRole('cell', { name: requestId })).toBeVisible();
 //await expect(page.getByRole('cell', { name: 'Adan Wolf' })).toBeVisible();
  
  const reviewCol = page.locator('text=Reviewer 1').nth(0);
  expect(await reviewCol.isVisible).toBeTruthy();

  const dateCol = page.locator('text=Date Submitted').nth(0);
  expect(await dateCol.isVisible).toBeTruthy();

  const typeColrole = page.locator('text=Type').nth(1);
  expect(await typeColrole.isVisible).toBeTruthy();

 
   //Screenshot
   const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });

});

//Verify custom form columns should show if there is only one form type in the section.
test('Create Multiple Form with User with multiple Forms', async ({ page }, testInfo) => {

 await page.goto('https://host.docker.internal/Test_Request_Portal/');

 //Start a new Multiple person designated
  await page.getByText('New Request Start a new').click();

  //Enter data needed to create Request
  await expect(page.getByRole('heading', { name: 'Step 1 - General Information' })).toBeVisible();
  await page.getByRole('cell', { name: 'Select an Option Service' }).locator('a').click();
  await page.getByRole('option', { name: 'AS - Service' }).click();
  await page.getByText('Please enter keywords to').click();
  await page.getByRole('textbox', { name: 'Title of Request' }).click();
  await page.getByRole('textbox', { name: 'Title of Request' }).fill(serviceRequest2);
  await page.locator('label').filter({ hasText: 'Multiple person designated' }).locator('span').click();

  await page.getByRole('button', { name: 'Click here to Proceed' }).click();

  //Enter the Reviewer Information
  await expect(page.getByText('Form completion progress: 0% Next Question')).toBeVisible();

  //Get UID
  requestId2 = await page.textContent('#headerTab');
  console.log('Text inside span:', requestId2);
  let str: string = requestId2;
  let parts = str.split("#", 2);
  let firstPart = parts[0];
  let secondPart = parts[1];
  console.log(firstPart, secondPart);
  requestId2 =secondPart;
  
  const indicators = page.locator('[id^="loadingIndicator_"]');
 
  const reviewer1Id = await indicators.nth(0).getAttribute('id');
  const reviewer2Id = await indicators.nth(1).getAttribute('id');
 
  console.log('Reviewer 1 ID:', reviewer1Id);
  console.log('Reviewer 2 ID:', reviewer2Id);


  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 1' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 1' }).fill('test');
  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 1' })).toHaveValue('test');
  await page.getByRole('cell', { name: 'Tester, Tester Product Liaison' }).click();

  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 2' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 2' }).fill('h');
  await page.getByRole('cell', { name: 'Hackett, Linsey Spinka.' }).click();

  const loadingInc = await page.locator(`#${reviewer2Id}`);
  await expect(loadingInc).toBeVisible();
  console.log('text', loadingInc);
  await expect(loadingInc).not.toBeVisible();

  await expect(page.getByRole('cell', { name: 'Hackett, Linsey Spinka.' })).toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 2' })).toHaveValue('userName:VTRXVPMADELAINE');

  const myLocator = page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 2' });
  myLocator.waitFor();

 //Screenshot
   const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });



  await expect(page.locator('#nextQuestion2')).toBeVisible();
  await page.locator('#nextQuestion2').click({force:true});
  await page.waitForLoadState('domcontentloaded');
  //Submit Request
  await expect(page.getByRole('button', { name: 'Submit Request' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit Request' }).click({force:true});
  await page.getByRole('link', { name: 'Home' }).click();
});

//Verify custom column is not present when multiple forms are present in Role View
test ('Validate Role View Custom Column not Present', async ({ page }, testInfo) => {

  await page.goto('https://host.docker.internal/Test_Request_Portal/');
 
  //Go to the Custom Inbox
  await expect(page.getByText('Inbox Review and apply')).toBeVisible();
  await page.getByText('Inbox').click();

   await page.waitForLoadState('load');

  //Switch to Role View
  await expect(page.getByRole('button', { name: 'Organize by Roles' })).toBeVisible();
  await page.getByRole('button', { name: 'Organize by Roles' }).click();
  
  //Select Tester
  const dynTxt = 'Tester Tester View';
  const dynRegex = new RegExp(`^${dynTxt}.*`);
  const formTxt = 'LeafFormGrid';
  const formRegex =new RegExp('^${formTxt}.*')
  
  await page.getByRole ('button', {name: dynRegex}).click();
 
  await expect(page.getByRole('cell', { name: requestId2 })).toBeVisible();
  
  const typeColrole = page.locator('text=Type').nth(1);
  expect(await typeColrole.isVisible).toBeTruthy();

   await expect(page.getByRole('columnheader', { name: 'Sort by Reviewer' })).not.toBeVisible();

  //Screenshot
  const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
 
});

//Create a Stapled Form
test ('Create a Stapled Form', async ({ page }, testInfo) => {

  await page.goto('https://host.docker.internal/Test_Request_Portal/');
 
 
  await expect(page.getByRole('link', { name: 'Admin Panel' })).toBeVisible();
  await page.getByRole('link', { name: 'Admin Panel' }).click();

  //Staple Form
  await page.getByRole('button', { name: ' Form Editor Create and' }).click();
  await page.getByRole('link', { name: 'Multiple person designated', exact: true }).click();
  await page.getByRole('button', { name: 'Staple other form' }).click();

  //Add and Verify the Staples
  await page.getByLabel('Select a form to merge').selectOption('form_dac2a');
  await expect(page.locator('#leaf_dialog_content_drag_handle')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Add', exact: true }).click();

  await page.getByText('Close').click();

   await expect(page.getByRole('button', { name: 'Test IFTHEN staple, stapled' })).toBeVisible();
  
  //Screenshot
  const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });

  await page.getByRole('link', { name: 'Home' }).click();

});

//Create a new Stapled Request
test('Create a new Stapled Request', async ({ page }, testInfo) => {

  await page.goto('https://host.docker.internal/Test_Request_Portal/');

  //Create a new stapled Request
  await expect(page.getByText('New Request Start a new')).toBeVisible();
  await page.getByText('New Request Start a new').click();

  await page.waitForLoadState('load');

  //Enter the required information
  await expect(page.getByRole('cell', { name: 'Select an Option Service' }).locator('a')).toBeVisible();
  await page.getByRole('cell', { name: 'Select an Option Service' }).locator('a').click();
  await page.getByRole('option', { name: 'AS - Service' }).click();
  await page.getByRole('textbox', { name: 'Title of Request' }).click();
  await page.getByRole('textbox', { name: 'Title of Request' }).fill(stapledRequest);
  await page.locator('label').filter({ hasText: 'Multiple person designated' }).locator('span').click();
  await expect(page.getByRole('button', { name: 'Click here to Proceed' })).toBeVisible();
  await page.getByRole('button', { name: 'Click here to Proceed' }).click();

  await page.waitForLoadState('load');

  //Enter information for multipledesginated form
  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 1' })).toBeVisible();

  const indicators = page.locator('[id^="loadingIndicator_"]');
  const reviewer1Id = await indicators.nth(0).getAttribute('id');
  const reviewer2Id = await indicators.nth(1).getAttribute('id');
 
  console.log('Reviewer 1 ID:', reviewer1Id);
  console.log('Reviewer 2 ID:', reviewer2Id);

  //Get UID
  stapledRequestId = await page.textContent('#headerTab');
  console.log('Text inside span:', stapledRequestId);
  let str: string = stapledRequestId;
  let parts = str.split("#", 2);
  let firstPart = parts[0];
  let secondPart = parts[1];
  console.log(firstPart, secondPart);
  stapledRequestId =secondPart;

  await page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 1' }).fill('ad');
  await page.getByRole('cell', { name: 'Wolf, Adan Williamson. Direct' }).click();
  await expect(page.getByRole('cell', { name: 'Wolf, Adan Williamson. Direct' })).toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 1' })).toHaveValue('userName:VTRHJHROSARIO');


 
  await page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 2' }).fill('h');
  await page.getByRole('cell', { name: 'Hackett, Linsey Spinka.' }).click();

  const loadingInc = await page.locator(`#${reviewer2Id}`);
  await expect(loadingInc).toBeVisible();
  console.log('text', loadingInc);
  await expect(loadingInc).not.toBeVisible();

  await expect(page.getByRole('cell', { name: 'Hackett, Linsey Spinka.' })).toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 2' })).toHaveValue('userName:VTRXVPMADELAINE');

    const myLocator = page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 2' });
  myLocator.waitFor();

 //Screenshot
  const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });

  await expect(page.locator('#nextQuestion')).toBeVisible();
 
  const buttonClick = await page.getByRole('button', {name: 'Next Question'}).first();
  await buttonClick.click({force:true});
  
  await page.waitForLoadState('load');
 //Enter information for If then Form
  await expect(page.locator('a').filter({ hasText: 'Select an Option' })).toBeVisible();
  await page.locator('a').filter({ hasText: 'Select an Option' }).click();
  await page.getByRole('option', { name: '2' }).click();
  await expect(page.locator('#nextQuestion2')).toBeVisible();
  await page.locator('#nextQuestion2').click({force:true});

 await page.waitForLoadState('load');

   //Submit Request
  await expect(page.locator('#submitControl')).toBeVisible();
  await page.getByRole('button', { name: 'Submit Request' }).click();
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
  await page.getByRole('link', { name: 'Home' }).click();
});

//View Stapled Form
test('View Stapled Request', async ({ page }, testInfo) => {

 await page.goto('https://host.docker.internal/Test_Request_Portal/');

  //Go to the Inbox
  await expect(page.getByText('Inbox Review and apply')).toBeVisible();
  await page.getByText('Inbox Review and apply').click();


  await page.waitForLoadState('domcontentloaded');
  //Organize by Role to verify the stapled
  await expect(page.getByRole('button', { name: 'Organize by Roles' })).toBeVisible();
  await page.getByRole('button', { name: 'Organize by Roles' }).click();
  await expect(page.getByRole('button', { name: 'View as Admin' })).toBeVisible();
  await page.getByRole('button', { name: 'View as Admin' }).click();

  //Verify Stapled 
  const formTxt = 'LeafFormGrid';
  const formRegex =new RegExp('^${formTxt}.*')
  const dynTxt = 'Adan Wolf View';
  const dynRegex = new RegExp(`^${dynTxt}.*`);

  await expect(page.getByRole('button', { name: dynRegex })).toBeVisible();
  await page.getByRole('button', { name: dynRegex}).click();
 
  await expect(page.getByRole('cell', { name: stapleName })).toBeVisible();

  const typeColrole = page.locator('text=Type').nth(1);
  expect(await typeColrole.isVisible).toBeTruthy();

   //Screenshot
  const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
 
});

});
//End of Form Verification


test.describe('Clean up all test data', () =>{ 

//Cleanup Remove Request

test('Clean up NewRequest Form', async ({ page }, testInfo) => {

 await page.goto('https://host.docker.internal/Test_Request_Portal/');
  
 await expect(page.getByText('Inbox Review and apply')).toBeVisible();

  //Find Request
  await expect(page.locator('#searchContainer')).toBeVisible();
  await page.getByRole('link', {name: requestId}).click();
  await expect(page.getByRole('button', { name: 'Cancel Request' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel Request' }).click();

  //Verify you want to Cancel Request
  await page.getByRole('dialog').getByText('Editor Close').click();
  await page.getByRole('textbox', { name: 'Enter Comment' }).click();
  await page.getByRole('textbox', { name: 'Enter Comment' }).fill('Comment Delete');
  await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
  await page.getByRole('button', { name: 'Yes' }).click();

});


//Cleanup Remove Request2

test('Clean up NewRequest Form2', async ({ page }, testInfo) => {

 await page.goto('https://host.docker.internal/Test_Request_Portal/');

  await page.waitForLoadState('domcontentloaded');
 await expect(page.getByText('Inbox Review and apply')).toBeVisible();
  

  //Find Request
  await expect(page.locator('#searchContainer')).toBeVisible();
  await expect(page.getByRole('link', { name: requestId2})).toBeVisible();
  await page.getByRole('link', {name: requestId2}).click();
  await expect(page.getByRole('button', { name: 'Cancel Request' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel Request' }).click();

  //Verify you want to Cancel Request
  await page.getByRole('dialog').getByText('Editor Close').click();
  await page.getByRole('textbox', { name: 'Enter Comment' }).click();
  await page.getByRole('textbox', { name: 'Enter Comment' }).fill('Comment Delete');
  await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
  await page.getByRole('button', { name: 'Yes' }).click();

});

//Cleanup Stapled Request

test('Clean up Stapled Request Form', async ({ page }, testInfo) => {

 await page.goto('https://host.docker.internal/Test_Request_Portal/');

  await page.waitForLoadState('load');
  
 await expect(page.getByText('Inbox Review and apply')).toBeVisible();


 //Find Request
 await expect(page.locator('#searchContainer')).toBeVisible();
 await expect(page.getByRole('link', { name: stapledRequestId})).toBeVisible();
 await page.getByRole('link', {name: stapledRequestId}).click();
 await expect(page.getByRole('button', { name: 'Cancel Request' })).toBeVisible();
 await page.getByRole('button', { name: 'Cancel Request' }).click();

 //Verify you want to Cancel Request

 await page.getByRole('dialog').getByText('Editor Close').click();
 await page.getByRole('textbox', { name: 'Enter Comment' }).click();
 await page.getByRole('textbox', { name: 'Enter Comment' }).fill('Comment Delete');
 await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
 await page.getByRole('button', { name: 'Yes' }).click();

});


//Delete Customized Card

test('delete Customized Sitemap Card', async ({ page }, testInfo) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/');

  await page.getByRole('link', { name: 'Admin Panel' }).click();
  await page.getByRole('button', { name: ' Sitemap Editor Edit portal' }).click();

  await expect(page.getByRole('button', { name: '+ Add Site' })).toBeVisible();
  await page.getByRole('heading', { name: siteMapname }).getByRole('link').click();
  await page.getByRole('button', { name: 'Delete Site' }).click();

     //Screenshot
  const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });

 });


//Removed Stapled Forms
test('Remove Stapled Forms', async ({ page }, testInfo) => {

  await page.goto('https://host.docker.internal/Test_Request_Portal/');

   await page.waitForLoadState('load');

  //Click on Form Editor
  await expect(page.getByRole('link', { name: 'Admin Panel' })).toBeVisible();
  await page.getByRole('link', { name: 'Admin Panel' }).click();
  await expect(page.getByRole('button', { name: ' Form Editor Create and' })).toBeVisible();
  await page.getByRole('button', { name: ' Form Editor Create and' }).click();

  //Find Multiple person designated Form
  await expect(page.getByRole('link', { name: 'Multiple person designated', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Multiple person designated', exact: true }).click();

  //Remove the stapled Form
  await expect(page.getByRole('button', { name: 'Staple other form' })).toBeVisible();
  await page.getByRole('button', { name: 'Staple other form' }).click();
  await expect(page.getByText('Test IFTHEN staple [ Remove ]')).toBeVisible();
  await page.getByRole('button', { name: 'remove Test IFTHEN staple' }).click();
  await expect(page.getByText('Close')).toBeVisible();
  await page.getByText('Close').click();
  
});



});

//End