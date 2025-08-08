import { test, expect, Locator } from '@playwright/test';

//This test 

test.describe.configure({ mode: 'default' });

// Global Variables
  let randNum = Math.random();
  let uniqueText = `Event ${randNum}`;
  let uniqueDescr = `Description ${randNum}`;

//Create a New Event from the workflow
test ('Create a New Event', async ({ page}, testinfo) => {

 await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=1');
 
//Click on the Requestor 
  await expect(page.getByText('Return to Requestor')).toBeVisible();
  await page.getByText('Return to Requestor').click();

//Add a new event
  await expect(page.getByRole('button', { name: 'Add Event' })).toBeVisible();
  await page.getByRole('button', { name: 'Add Event' }).click();


  // Wait for the Create Event page to load
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await page.getByRole('button', { name: 'Create Event' }).click();
    
  //Enter Data for New Event

    await page.getByLabel('Event Name:').click();
    await page.getByLabel('Event Name:').fill(uniqueText);
    await page.getByLabel('Short Description: Notify').fill(uniqueDescr);
    await page.getByText('Notify Requestor Email: Notify Next Approver Email: Notify Group: None2911 TEST').click();
    await page.getByLabel('Notify Requestor Email:', { exact: true }).check();
    await page.getByLabel('Notify Next Approver Email:', { exact: true }).check();
    await page.getByLabel('Notify Group:', { exact: true }).selectOption('206');
   
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  
  //Save Event
  await page.getByRole('button', { name: 'Save' }).click();
   
  await expect(page.getByRole('button', { name: 'Remove Action' })).toBeVisible();
 
  //Verify present
  let eventTitle = `Email - ${uniqueDescr}`;
  await expect(page.locator('#stepInfo_3')).toContainText(eventTitle);

  //Add Screenshot
  const newEventscreenshot = await page.screenshot();
  await testinfo.attach('New Event', { body: newEventscreenshot, contentType: 'image/png' });
 
  await page.getByLabel('Close Modal').click();
  });

// End of 1st Test (Create New Event)

// Select Newly Created Event from Icon
test('Add Event from Action Icon', async ({ page }, testInfo) => {

 await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=1');
  await page.locator('#jsPlumb_1_51').click();
  await page.getByRole('button', { name: 'Add Event' }).click();
  await expect(page.getByRole('button', { name: 'Create Event' })).toBeVisible();
  //await page.locator('a').

  //locate the previous New Event and add it
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  let eventTitle = `Email - ${uniqueDescr}`;
  await page.getByLabel('Add Event').locator('a').click();
  await page.getByRole('option', { name: eventTitle }).click();
  

  await page.getByRole('button', { name: 'Save' }).click();

 //Verify New Event is added to the workflow
 await expect(page.getByRole('button', { name: 'Remove Action' })).toBeVisible();
 await page.getByText(eventTitle).click();

 const eventAdded = await page.screenshot();
  await testInfo.attach('Event Added', { body: eventAdded, contentType: 'image/png' });
 //Close the modal and return
 await page.getByLabel('Close Modal').click();
  
});
//End of select from ddrown

//Check for duplicates
test ('Verify Duplicate Event Name & Description are not Allowed', async ({ page }, testInfo) => {
//Load Page
 
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=1');

  //Add New Event
  await page.getByRole('button', { name: 'Edit Events' }).click();
  await expect(page.getByRole('button', { name: 'Create a new Event' })).toBeVisible();
 
//Enter Data
  await page.getByRole('button', { name: 'Create a new Event' }).click();
  await page.getByLabel('Event Name:').click();
  await page.getByLabel('Event Name:').fill(uniqueText);

  await page.getByLabel('Short Description: Notify').fill(uniqueDescr);
  await page.getByLabel('Notify Requestor Email:', { exact: true }).check();
  await page.getByLabel('Notify Next Approver Email:', { exact: true }).check();
  await page.getByLabel('Notify Group:', { exact: true }).selectOption('206');
 
 //Screehshot before Save
 const newEvent = await page.screenshot();
  await testInfo.attach('New Event Created', { body: newEvent, contentType: 'image/png' });
  
  //Verify Duplicate Data

      let diaMsg;
      let dialogMsg = `Event name already exists.`;
   //Read the modal then compare the values
      page.on('dialog', async (dialog) => {
        diaMsg = dialog.message();
        await dialog.accept();
      });

  //SAVE
  await page.getByRole('button', { name: 'Save' }).click();

  await page.getByRole('button', { name: 'Close' }).click();
 
});

//Add Event From Side Bar 
test ('Add Event from Side Navigation', async ({ page }, testInfo) => {
  //Load Page
   
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=1');
    await expect(page.getByRole('button', { name: 'Edit Events' })).toBeVisible();
    await page.getByRole('button', { name: 'Edit Events' }).click();

   
    //Add New Event
      await expect(page.getByRole('button', { name: 'Create a new Event' })).toBeVisible();
      await page.getByRole('button', { name: 'Create a new Event' }).click();
    
    //Enter Data
    
    let uniqueText2 = `Event2 - ${uniqueText}`;
    let uniqueDescr2 = `Description2 - ${uniqueDescr}`;
  
   
      await page.getByLabel('Event Name:').click();
      await page.getByLabel('Event Name:').fill(uniqueText2);
    
      await page.getByLabel('Short Description: Notify').fill(uniqueDescr2);
      await page.getByLabel('Notify Requestor Email:', { exact: true }).check();
      await page.getByLabel('Notify Next Approver Email:', { exact: true }).check();
      await page.getByLabel('Notify Group:', { exact: true }).selectOption('206');
  
      await page.getByRole('button', { name: 'Save' }).click(); 
   //Verify new  event is added
  
   await expect(page.locator('#ui-id-1')).toBeVisible();
   await expect(page.getByRole('heading', { name: 'List of Events' })).toBeVisible();
  
   //Screentshot
  
    const eventAdded = await page.screenshot();
    await testInfo.attach('Event Added', { body: eventAdded, contentType: 'image/png' });
  
   // Verify
   const table = page.locator("#events");
   const rows = table.locator("tbody tr");
   const cols = rows.first().locator("td");
  
   const eventMatch = rows.filter({
      has: page.locator("td"),
      hasText: uniqueText
  
   });
  
   await page.getByRole('button', { name: 'Close' }).click();
   
  });


//Edit Workflow event using the workflow Editor
test('Edit Event ', async ({ page }, testInfo) => {

  //OPen Page
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=1');

  //Edit Event Button
  await expect(page.getByRole('button', { name: 'Edit Events' })).toBeVisible();
  await page.getByRole('button', { name: 'Edit Events' }).click();
  await expect(page.getByRole('heading', { name: 'List of Events' })).toBeVisible();


   // Verify
 const table = page.locator("#events");
 const rows = table.locator("tbody tr");
 const cols = rows.first().locator("td");

 const eventMatch2 = rows.filter({
    has: page.locator("td"),
    hasText: uniqueDescr
    });

  
  //Screenshot
  const eventLocate = await page.screenshot();
  await testInfo.attach('Event Added', { body: eventLocate, contentType: 'image/png' });

  //Select the one that you need to update
  await eventMatch2.getByRole(`button`,{name:`Edit`}).click();

  uniqueDescr = `Update ${uniqueDescr}`;
  //Update the Data
  await page.getByLabel('Short Description:').fill(uniqueDescr);
  await page.getByLabel('Notify Requestor Email:').check();
  await page.getByLabel('Notify Next Approver Email:').check();
  await page.getByLabel('Notify Group:').selectOption('206');
  await page.getByRole('button', { name: 'Save' }).click();

  //Screenshot
  const eventUpdated = await page.screenshot();
  await testInfo.attach('Event Added', { body: eventUpdated, contentType: 'image/png' });

});
//End of Edit Event

//Remove Event 
test('Remove Event ', async ({ page }, testInfo) => {

//Open Page
await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=1');

//Open Edit Events
await page.getByRole('button', { name: 'Edit Events' }).isVisible();
await page.getByRole('button', { name: 'Edit Events' }).click();

//Locate Event
   
await expect(page.getByRole('heading', { name: 'List of Events' })).toBeVisible();


   const table = page.locator("#events");
   const rows = table.locator("tbody tr");
   const cols = rows.first().locator("td");
  
   const eventMatch3 = rows.filter({
      has: page.locator("td"),
      hasText: uniqueDescr
      });
  
    
  //Screenshot
    const eventLocate1 = await page.screenshot();
    await testInfo.attach('Event Added', { body: eventLocate1, contentType: 'image/png' });

  //Select the one that you need to Delete
  await eventMatch3.getByRole(`button`,{name:`Delete`}).click();

  await page.getByRole('button', { name: 'Yes' }).click();
  
  
 // Verify removed from Event List
 await expect(page.getByRole('heading', { name: 'List of Events' })).toBeVisible();

 const table1 = page.locator("#events");
 const rows1 = table.locator("tbody tr");
 const cols1 = rows.first().locator("td");

 const eventNotPresent = rows.filter({
    has: page.locator("td"),
    hasNotText:uniqueDescr
    });

//Screenshot
  //Screenshot
  const eventLocate = await page.screenshot();
  await testInfo.attach('Event Added', { body: eventLocate, contentType: 'image/png' });
 await page.getByRole('button', { name: 'Close' }).click();

});
//Remove Event

//Verify Event Removed from Workflow Action
test('Verify Event Removed from Workflow Action', async ({ page }, testInfo) => {

  //Open Page
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=1');
  
 
    //Verify Event is not attached to the workflow
   //Click on the Requestor 
   await expect(page.getByText('Return to Requestor')).toBeVisible();
   await page.getByText('Return to Requestor').click();
   let eventTitle = `Email - ${uniqueDescr}`;
   await expect(page.getByText(eventTitle)).not.toBeVisible();
  
     //Screenshot
     const eventLocate2 = await page.screenshot();
     await testInfo.attach('Event Added', { body: eventLocate2, contentType: 'image/png' });
   
  
   await page.getByLabel('Close Modal').click();
  
  });
  
 // test.describe.configure({ mode: 'default' });

test.describe('LEAF 4892 ', () => {

test('Create Email Action', async({page}) =>{

 const eventName = 'LEAF_4892_Testing'; 
 const eventDescription = 'End2end Testing for 4892';
 const eventGroup = '202';
 const eventTitle = 'Email - End2end Testing for 4892';
    //Create an Event
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=1');
  
  //Wait for Page to full Load
  await page.waitForLoadState('load');

  await expect(page.getByText('Requestor Step 1 Step 2')).toBeVisible();
  await expect(page.getByText('Submit')).toBeVisible();

  await page.getByText('Submit').click();

  await page.waitForLoadState('load');
  await page.getByRole('button', { name: 'Add Event' }).click();
  await page.getByRole('dialog', { name: 'Add Event' }).locator('a').click();
  await page.getByRole('option', { name: 'Email - Notify the requestor' }).click();
  await page.getByRole('button', { name: 'Create Event' }).click();

  await page.waitForLoadState('load');
  await page.getByRole('textbox', { name: 'Event Name:' }).click();
  await page.getByRole('textbox', { name: 'Event Name:' }).fill(eventName);
  await page.getByRole('textbox', { name: 'Short Description: Notify' }).click();
  await page.getByRole('textbox', { name: 'Short Description: Notify' }).fill(eventDescription);
  await page.getByLabel('Notify Group:', { exact: true }).selectOption(eventGroup);
  //await page.getByRole('button', { name: 'Save' }).selectOption(eventGroup);
  await page.getByLabel('Notify Group:', { exact: true }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  //Verify it is present

  await page.waitForLoadState('load');
  await expect(page.getByText(eventTitle)).toBeVisible();
  await page.getByRole('button', { name: 'Close Modal' }).click();

  //Modify Email Template
  await page.getByRole('button', { name: 'Edit Events' }).click();
  await page.waitForLoadState('load');
  await page.locator('#editor_CustomEvent_LEAF_4892_Testing').getByRole('button', { name: 'Edit' }).click();
  const page1Promise = page.waitForEvent('popup');

  await page.getByRole('link', { name: 'Email Template Editor' }).click();
  const page1 = await page1Promise;

  await page.waitForLoadState('load');
  await page1.getByRole('button', { name: 'End2end Testing for' }).click();
  await expect(page1.getByRole('heading', { name: 'End2end Testing for' })).toBeVisible();
  await expect(page1.getByRole('textbox', { name: 'Email To:' })).toBeVisible();
  await page1.getByRole('textbox', { name: 'Email To:' }).click();
  await page1.getByRole('textbox', { name: 'Email To:' }).fill('{{$field.19}}\ntest4892@fake.com');
  await page1.getByRole('textbox', { name: 'Email CC:' }).fill('test4892@fake.com');
  
  await page1.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page1.getByText('Please note that only')).toBeVisible();


});

test('Create New Request', async({page}) =>{

  await page.goto('https://host.docker.internal/Test_Request_Portal/');
  
  const requestTitle = 'LEAF_4892_Test';
  const formType = 'General Form';
  const serviceType = 'AS - Service';
  const serviceGroup = '2911 TEST Group';
  const reviewerOne = 'Dare, Lyn Waters. Human Sales';
  const singlelineText = 'Single line Text';
  const reviewerUserName = "userName:VTRCFDJENINE";
  const groupId = 'group#202';

  //Wait for Page to full Load
  await page.waitForLoadState('load');

  await expect(page.getByText('New Request Start a new')).toBeVisible();
  await page.getByText('New Request', { exact: true }).click();

  await page.waitForLoadState('load');

  //Create the Request
  await expect(page.getByRole('heading', { name: 'Step 1 - General Information' })).toBeVisible();
  await page.getByRole('cell', { name: 'Select an Option Service' }).locator('a').click();
  await page.getByRole('option', { name: serviceType}).click();
  await page.getByRole('textbox', { name: 'Title of Request' }).click();
  await page.getByRole('textbox', { name: 'Title of Request' }).fill(requestTitle);
  await page.locator('label').filter({ hasText: formType }).locator('span').click();
  await page.getByRole('button', { name: 'Click here to Proceed' }).click();

  //1. Single line Text
  await page.waitForLoadState('load');

 
  await page.waitForLoadState('load');
  await page.getByRole('textbox', { name: 'Numeric' }).click();
  await page.getByRole('textbox', { name: 'Numeric' }).fill('1922'); 
  
  await expect(page.locator('#nextQuestion')).toBeVisible();
  await page.locator('#nextQuestion').click();

  await expect(page.getByText('2. Assigned Person')).toBeVisible();
  
  
  //2. Assigned Person
  await expect(page.getByText('Form completion progress: 0% Next Question')).toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Assigned Person', exact: true })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search for user to add as Assigned Person', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Search for user to add as Assigned Person', exact: true }).fill('da');
  await page.getByRole('cell', { name: reviewerOne}).click();
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Assigned Person', exact: true })).toHaveValue(reviewerUserName);
  await expect(page.getByText('3. Assigned Group')).toBeVisible();
  await page.getByText('3. Assigned Group').click();
  //await page.locator('#nextQuestion').click();
   
  await page.waitForLoadState('load');

  //3. Assigned Group
    
  await expect(page.getByText('Form completion progress: 50% Next Question')).toBeVisible();

  await page.getByRole('searchbox', { name: 'Search for user to add as' }).click();
  await page.getByRole('searchbox', { name: 'Search for user to add as' }).fill('g');
  await page.getByRole('cell', { name: serviceGroup }).click();
  await expect(page.getByRole('searchbox', { name: 'Search for user to add as' })).toHaveValue(groupId);
  await expect(page.locator('#nextQuestion')).toBeVisible();
  await page.locator('#nextQuestion').click();

  await page.waitForLoadState('load');

  //Submit Request
  await expect(page.getByRole('button', { name: 'Submit Request' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit Request' }).click();

});

test('Verify Email', async({page}) =>{

  await page.goto('http://host.docker.internal:5080/');

  await page.waitForLoadState('load');

  await page.locator('td:nth-child(2) > .cell').first().click();
  await expect(page.getByLabel('Messages')).toContainText('To: test4892@fake.com, Loyd.Cartwright10@fake-email.com, Morton.Anderson@fake-email.com, Roman.Abbott@fake-email.com, Booker.Feeney@fake-email.com,');
  await page.getByRole('tab', { name: 'Headers' }).click();

});

//Clean up

test('Clean up Test Data', async({page}) =>{

 await page.goto('https://host.docker.internal/Test_Request_Portal/');

  const requestTitle = 'LEAF_4892_Test';
  const dynRegexrequestTitle = new RegExp(`^\\d+\\s${requestTitle}`);
  const commentText ='Cleaning Up';
   

  await page.waitForLoadState('load');
  
  await expect(page.getByText('Inbox Review and apply')).toBeVisible();
  await page.getByRole('textbox', { name: 'Enter your search text' }).click();
  await page.getByRole('textbox', { name: 'Enter your search text' }).fill(requestTitle);

  await page.getByRole('cell', { name: dynRegexrequestTitle }).click();
  await expect(page.getByText('Group A')).toBeVisible();
  
  let requestId = await page.textContent('#headerTab');
  console.log('Text inside span:', requestId);
  let str ;
  str = requestId;
  let parts = str.split("#", 2);
  let firstPart = parts[0];
  let secondPart = parts[1];
  console.log(firstPart, secondPart);
  requestId =secondPart;
  const cancelledText = `Request #${requestId} has been cancelled!`;


  await page.getByRole('button', { name: 'Cancel Request' }).click();
  await page.getByRole('textbox', { name: 'Enter Comment' }).click();
  await page.getByRole('textbox', { name: 'Enter Comment' }).fill(commentText);
  await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
  await page.getByRole('button', { name: 'Yes' }).click();
  await expect(page.locator('#bodyarea')).toContainText(cancelledText);

  await page.getByRole('link', { name: 'Home' }).click();
});

test('Clean up Test Data Workflow', async({page}) =>{

  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=1');
 
  const deleteBtn = '#editor_CustomEvent_LEAF_4892_Testing';

  await page.waitForLoadState('load');
  await expect(page.getByRole('button', { name: 'Edit Events' })).toBeVisible();
  await page.getByRole('button', { name: 'Edit Events' }).click();

  await page.waitForLoadState('load');
  await expect(page.getByRole('heading', { name: 'List of Events' })).toBeVisible();

  await expect(page.locator(deleteBtn).getByRole('button', { name: 'Delete' })).toBeVisible();
  await page.locator(deleteBtn).getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByText('Confirmation required')).toBeVisible();
  await page.getByRole('button', { name: 'Yes' }).click();

 
});
});