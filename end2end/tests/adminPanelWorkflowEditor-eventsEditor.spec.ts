import { test, expect, Locator } from '@playwright/test';

//This test 

test.describe.configure({ mode: 'serial' });

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
    
    let uniqueText2 = `Eve-${uniqueText}`;
    let uniqueDescr2 = `Desc-${uniqueDescr}`;
  
   
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
      hasText: uniqueDescr2
  
   });
  
   
   //Clean up Test Data

  //Select the one that you need to Delete
  await eventMatch.getByRole(`button`,{name:`Delete`}).click();

  await page.getByRole('button', { name: 'Yes' }).click();

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
  