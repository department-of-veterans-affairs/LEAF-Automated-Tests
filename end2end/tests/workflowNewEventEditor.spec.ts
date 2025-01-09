import{test, expect} from "../fixtures/MyCustomWorkflowFixtures"

test.use({
  ignoreHTTPSErrors: true
});


test.beforeAll(async ({workflowData})=>{
  let randNum = Math.random();
  workflowData.uniqueText = `New Event ${randNum}`;
  workflowData.uniqueDescr = `Adding description ${randNum}`;

});

//Create a New Event
test ('CreateEvent', async ({ page, workflowData}, testinfo) => {

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

    //await page.getByRole('button', { name: 'Create Event' }).click();
    await page.getByLabel('Event Name:').click();
    await page.getByLabel('Event Name:').fill(workflowData.uniqueText);
    await page.getByLabel('Short Description: Notify').fill(workflowData.uniqueDescr);
    await page.getByText('Notify Requestor Email: Notify Next Approver Email: Notify Group: None2911 TEST').click();
    await page.getByLabel('Notify Requestor Email:', { exact: true }).check();
    await page.getByLabel('Notify Next Approver Email:', { exact: true }).check();
    await page.getByLabel('Notify Group:', { exact: true }).selectOption('206');
   
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  
  //Save Event
  await page.getByRole('button', { name: 'Save' }).click();
   
  await expect(page.getByRole('button', { name: 'Remove Action' })).toBeVisible();
 
  //Verify present
  let eventTitle = `Email - ${workflowData.uniqueDescr}`;
  await expect(page.locator('#stepInfo_3')).toContainText(eventTitle);

  //Add Screenshot
  const newEventscreenshot = await page.screenshot();
  await testinfo.attach('New Event', { body: newEventscreenshot, contentType: 'image/png' });
 
  await page.getByLabel('Close Modal').click();
  });

// End of 1st Test (Create New Event)

// Select Newly Created Event from dropdown
test('Add Event from ddown', async ({ page, workflowData }, testInfo) => {

 await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=1');
  await page.locator('#jsPlumb_1_51').click();
  await page.getByRole('button', { name: 'Add Event' }).click();
  await expect(page.getByRole('button', { name: 'Create Event' })).toBeVisible();
  //await page.locator('a').

  //locate the previous New Event and add it
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  let eventTitle = `Email - ${workflowData.uniqueDescr}`;
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

//Add Event From Side Bar 
test ('Add Event from side bar', async ({ page , workflowData }, testInfo) => {
//Load Page
 
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=1');
  //Update the unique values

  //Add New Event
  await page.getByRole('button', { name: 'Edit Events' }).click();
  await expect(page.getByRole('button', { name: 'Create a new Event' })).toBeVisible();

//Enter Data
let uniqueText = `new ${workflowData.uniqueText} `;
let uniqueDescr = `new ${workflowData.uniqueDescr}`;
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
  //SAVE
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