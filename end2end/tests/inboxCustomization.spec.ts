import { test, expect } from '@playwright/test';

//This test is designed to test LEAF
test.describe.configure({ mode: 'serial' });

//Global Variables
let randNum = Math.random();
let siteMapname = `LEAF 4832 - Customization`;
let siteMapDesc = 'Testing for LEAF 4823 Customization';
let leafSiteCard = 'LEAF 4832 - CustomizationTesting for LEAF 4823 Customization';
let siteMapURL = 'https://host.docker.internal/Test_Request_Portal/';
let siteMapColor = '#5d1adb';
let siteMapFontColor = '#e2db08';
let serviceRequest ='LEAF 4832 - Request';
let stapledRequest = 'LEAF 4832 - Stapled Request';
let stapleName = 'Test IFTHEN staple | Multiple person designated';
let requestId;
let stapledRequestId;



//Create Sitemap Card
test('create New Sitemap Card', async ({ page }, testInfo) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/');
  
  await page.getByRole('link', { name: 'Admin Panel' }).click();
  await page.getByRole('button', { name: ' Sitemap Editor Edit portal' }).click();

  await expect(page.getByRole('button', { name: '+ Add Site' })).toBeVisible();

  //Style the Sitemap
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
  await expect(page.getByText(siteMapname, { exact: true })).toBeVisible();

 //Add Customization
  await page.getByRole('textbox', { name: 'Click to search. Limit 7' }).fill('p');
  await page.getByRole('option', { name: 'Priority Press to select' }).click();
  await page.getByRole('option', { name: 'Days Since Last Action Press' }).click();

  await page.getByRole('link', { name: 'Home' }).click();
  await expect(page.getByText('Review and apply actions to')).toBeVisible();
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

 });

//Personalized a Form
test('Personalized a Form', async ({ page }, testInfo) => {

  await page.goto('https://host.docker.internal/Test_Request_Portal/');
  
  await page.getByRole('link', { name: 'Admin Panel' }).click();
  await page.getByRole('button', { name: 'admin submenu' }).click();
  await expect(page.getByRole('button', { name: ' Combined Inbox Editor Edit' })).toBeVisible();
  await page.getByRole('button', { name: ' Combined Inbox Editor Edit' }).click();
  
  await expect(page.getByText('LEAF 4832 - CustomizationUIDServiceTitleStatusPriorityDays Since Last')).toBeVisible();
  
  await page.getByLabel('Select a form to add specific').selectOption('form_f8b95');
  await page.getByRole('textbox', { name: 'Click to search. Limit 7' }).click();

  //Add Reviewer 1 & Date Submitted
  await page.getByRole('option', { name: 'Multiple person designated: Reviewer 1 (ID: 14) Press to select' }).click();
  await page.getByRole('option', { name: 'Date Submitted Press to select' }).click();

  //Remove Status
  await page.getByRole('button', { name: 'Remove item: \'status\'' }).click();

  //Verify the columns  
  await expect(page.getByText('Multiple person designated (form_f8b95)Service, Title, id#14, Date Submitted')).toBeVisible();

   //Check Inbox to verify updates
  await page.getByRole('link', { name: 'Home' }).click();

  //Open the Inbox
  await expect(page.getByText('Inbox Review and apply')).toBeVisible();
  await page.getByText('Inbox Review and apply').click();
 
  await page.getByRole('button', { name: 'Toggle sections' }).click();
  const reviewCol = page.locator('text=Reviewer 1').nth(0);
  expect(await reviewCol.isVisible).toBeTruthy();

  const dateCol = page.locator('text=Date Submitted').nth(0);
  expect(await dateCol.isVisible).toBeTruthy();

  //Screenshot
  const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });


});


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
  

  await page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 1' }).fill('ad');
  await page.getByRole('cell', { name: 'Wolf, Adan Williamson. Direct' }).click();
  await expect(page.getByRole('cell', { name: 'Wolf, Adan Williamson. Direct' })).toBeVisible();

  await page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 2' }).fill('h');
  await page.getByRole('cell', { name: 'Hackett, Linsey Spinka.' }).click();
  await expect(page.getByRole('cell', { name: 'Hackett, Linsey Spinka.' })).toBeVisible();

 //Screenshot
   const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });

  await expect(page.locator('#nextQuestion2')).toBeVisible();
  await page.locator('#nextQuestion2').click({force:true});
  
  //await expect(page.locator('#formcontent div').filter({ hasText: '1Reviewer 1 Adan Wolf' }).nth(1)).toBeVisible();

  //Submit Request
  await page.getByRole('button', { name: 'Submit Request' }).click();
  await page.getByRole('link', { name: 'Home' }).click();


});

test('View Request in Inbox', async ({ page }, testInfo) => {

  await page.goto('https://host.docker.internal/Test_Request_Portal/');

  await page.getByText('Review and apply actions to').click();

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
  await expect(page.getByRole('cell', { name: 'Adan Wolf' })).toBeVisible();
  const typeColrole = page.locator('text=Type').nth(1);
  expect(await typeColrole.isVisible).toBeTruthy();

  
   //Screenshot
   const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });

  

});

//Verify custom form columns should show if there is only one form type in the section.
test('Verify Role View Custom Column not Present', async ({ page }, testInfo) => {

 await page.goto('https://host.docker.internal/Test_Request_Portal/');


 //Select the request
  await expect(page.getByRole('link', { name: serviceRequest})).toBeVisible();
  await page.getByRole('link', { name: serviceRequest }).click();

  //Update Request
  await expect(page.getByRole('button', { name: 'Edit Reviewer 1 field' })).toBeVisible();
  await page.getByRole('button', { name: 'Edit Reviewer 1 field' }).click();
  await page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 1' }).clear();
  
  await page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 1' }).click();
  await page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 1' }).fill('test');
    await expect(page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 1' })).toHaveValue('test');

    await page.getByRole('cell', { name: 'Tester, Tester Product Liaison' }).click();

 // await expect(page.getByText('NameLocationContact Tester,')).toBeVisible();

  //Save updated Request
  await expect(page.getByRole('button', { name: 'Save Change' })).toBeVisible();
  await page.getByRole('button', { name: 'Save Change' }).click();

  //Return to the homepage
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
  await page.getByRole('link', { name: 'Home' }).click();

  //Go to the Custom Inbox
  await expect(page.getByText('Inbox Review and apply')).toBeVisible();
  await page.getByText('Inbox').click();

  //Switch to Role View
  await expect(page.getByRole('button', { name: 'Toggle sections' })).toBeVisible();
  await page.getByRole('button', { name: 'Organize by Roles' }).click();
  

  //Select Tester
  const dynTxt = 'Tester Tester View';
  const dynRegex = new RegExp(`^${dynTxt}.*`);
  const formTxt = 'LeafFormGrid';
  const formRegex =new RegExp('^${formTxt}.*')
  
  await page.getByRole ('button', {name: dynRegex}).click();
  
  await expect(page.getByRole('cell', { name: serviceRequest })).toBeVisible();

    await expect(page.getByLabel('LEAF 4832 - Request')).toMatchAriaSnapshot(`
    - cell /LEAF \\d+ - Request/:
      - link /LEAF \\d+ - Request/
      - button "Quick View"
    `);
  
   await expect(page.getByRole('cell', { name: 'Tester Tester' })).not.toBeVisible();

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

  //Enter the required information
  await expect(page.getByRole('cell', { name: 'Select an Option Service' }).locator('a')).toBeVisible();
  await page.getByRole('cell', { name: 'Select an Option Service' }).locator('a').click();
  await page.getByRole('option', { name: 'AS - Service' }).click();
  await page.getByRole('textbox', { name: 'Title of Request' }).click();
  await page.getByRole('textbox', { name: 'Title of Request' }).fill(stapledRequest);
  await page.locator('label').filter({ hasText: 'Multiple person designated' }).locator('span').click();
  await expect(page.getByRole('button', { name: 'Click here to Proceed' })).toBeVisible();
  await page.getByRole('button', { name: 'Click here to Proceed' }).click();

  //Enter information for multipledesginated form
  await expect(page.getByText('Form completion progress: 0% Next Question')).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 1' }).fill('ad');
  await page.getByRole('cell', { name: 'Wolf, Adan Williamson. Direct' }).click();
  await expect(page.getByRole('cell', { name: 'Wolf, Adan Williamson. Direct' })).toBeVisible();

  await page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 2' }).fill('h');
  await page.getByRole('cell', { name: 'Hackett, Linsey Spinka.' }).click();
  await expect(page.getByRole('cell', { name: 'Hackett, Linsey Spinka.' })).toBeVisible();
  await expect(page.locator('#nextQuestion')).toBeVisible();
 
 //Screenshot
  const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });

  const buttonClick = await page.getByRole('button', {name: 'Next Question'}).first();
  await buttonClick.click({force:true});
  
 //Enter information for If then Form
  await expect(page.locator('a').filter({ hasText: 'Select an Option' })).toBeVisible();
  await page.locator('a').filter({ hasText: 'Select an Option' }).click();
  await page.getByRole('option', { name: '2' }).click();
  await expect(page.locator('#nextQuestion2')).toBeVisible();
  await page.locator('#nextQuestion2').click({force:true});

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

  //Organize by Role to verify the stapled
  await expect(page.getByRole('button', { name: 'Organize by Roles' })).toBeVisible();
  await page.getByRole('button', { name: 'Organize by Roles' }).click();
  await expect(page.getByRole('button', { name: 'View as Admin' })).toBeVisible();
  await page.getByRole('button', { name: 'View as Admin' }).click();

  //Verify Stapled 
  const formTxt = 'LeafFormGrid';
  const formRegex =new RegExp('^${formTxt}.*')

  await expect(page.getByRole('button', { name: 'Adan Wolf View 1 requests' })).toBeVisible();
  await page.getByRole('button', { name: 'Adan Wolf View 1 requests' }).click();
 // await expect(page.locator('#LeafFormGrid805_970_type')).toContainText(stapleName);
  await expect(page.getByRole('cell', { name: stapleName })).toBeVisible();

   //Screenshot
  const screenshot = await page.screenshot();
  await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });

  await expect(page.getByRole('button', { name: 'Organize by Forms' })).toBeVisible();
  await page.getByRole('button', { name: 'Organize by Forms' }).click();
  await expect(page.getByRole('button', { name: 'Multiple person designated' })).toBeVisible();
  await page.getByRole('button', { name: 'Multiple person designated' }).click();

  
});

//Cleanup Remove Request

test('Clean up NewRequest Form', async ({ page }, testInfo) => {

  await page.goto('https://host.docker.internal/Test_Request_Portal/');
  
 await expect(page.getByText('Inbox Review and apply')).toBeVisible();

  //Find Request
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

//Cleanup Stapled Request

test('Clean up Stapled Request Form', async ({ page }, testInfo) => {

  await page.goto('https://host.docker.internal/Test_Request_Portal/');
  
 await expect(page.getByText('Inbox Review and apply')).toBeVisible();

  //Find Request
  await page.getByRole('link', {name: stapledRequest}).click();
  await expect(page.getByRole('button', { name: 'Cancel Request' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel Request' }).click();

  //Verify you want to Cancel Request

  await page.getByRole('dialog').getByText('Editor Close').click();
  await page.getByRole('textbox', { name: 'Enter Comment' }).click();
  await page.getByRole('textbox', { name: 'Enter Comment' }).fill('Comment Delete');
  await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
  await page.getByRole('button', { name: 'Yes' }).click();

});

//Removed Stapled Forms
test('Remove Stapled Forms', async ({ page }, testInfo) => {

  await page.goto('https://host.docker.internal/Test_Request_Portal/');

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

  //Verify stapled Fprm is removed
  await expect(page.locator('#form_index_display')).toMatchAriaSnapshot(`
    - status
    - button "Preview this Form"
    - button "Add Internal-Use"
    - button "Staple other form"
    - list:
      - listitem:
        - button "Multiple person designated, main form"
    `);

  //Return Home
  await page.getByRole('link', { name: 'Home' }).click();
  

});

//Delete Customized Card

test('delete Customized Sitemap Card', async ({ page }, testInfo) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/');

  await page.getByRole('link', { name: 'Admin Panel' }).click();
  await page.getByRole('button', { name: ' Sitemap Editor Edit portal' }).click();

  await expect(page.getByRole('button', { name: '+ Add Site' })).toBeVisible();
  await page.getByRole('heading', { name: siteMapname }).getByRole('link').click();
  await page.getByRole('button', { name: 'Delete Site' }).click();

 });