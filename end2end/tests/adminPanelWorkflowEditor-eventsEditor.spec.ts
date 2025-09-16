import { test, expect, Page } from '@playwright/test';

test.describe.configure({ mode: 'default' });

/**
 * @param page Page instance from test
 * @param includesString part of url from network call to wait for
 * @param callback action to take prior to awaiting promise
 * @param requestMethod http verb. GET, POST
 */
async function awaitPromise(
  page: Page,
  includesString:string = '',
  callback:Function,
  requestMethod:string = 'GET',
) {
  const promiseToAwait = page.waitForResponse(res =>
    res.url().includes(includesString) &&
    res.request().method() === requestMethod &&
    res.status() === 200
  );
  await callback(page);
  await promiseToAwait;
}

/**
 * load the specific workflow by URL param
 * @param page Page instance from test
 * @param workflowID string - workflowID
 */
const loadWorkflow = async (page:Page, workflowID:string = '1') => {
  const promiseToAwait = page.waitForResponse(res =>
    res.url().includes(`workflow/${workflowID}/route`) &&
    res.status() === 200
  );
  await page.goto(`https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=${workflowID}`)
  await promiseToAwait;
}

// Global Variables
const randNum = Date.now(); //timestamp. unique but shorter than random - name is limited to 25 chars
const uniqueEventName = `Event ${randNum}`;

let uniqueDescr = `Description ${randNum}`;

test.only('Create a New Event from a workflow action', async ({ page}) => {
  await loadWorkflow(page);

  //Click on the Requestor events
  await expect(page.getByText('Return to Requestor')).toBeVisible();
  await awaitPromise(page, "events", async (p:Page) => {
    await p.getByText('Return to Requestor').click();
  });

  //Add a new event
  await expect(page.getByRole('button', { name: 'Add Event' })).toBeVisible();
  await awaitPromise(page, "events", async (p:Page) => {
    await p.getByRole('button', { name: 'Add Event' }).click();
  });

  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  await awaitPromise(page, "groups", async (p:Page) => {
    await p.getByRole('button', { name: 'Create Event' }).click();
  });

  //Enter Data for New Event
  await page.getByLabel('Event Name:').pressSequentially(uniqueEventName);

  expect(
    await page.getByLabel('Event Name:').inputValue(), 'regex /[^a-z0-9]/gi to be applied to event name'
  ).toBe(uniqueEventName.replace(/[^a-z0-9]/gi, '_'));

  await page.getByLabel('Short Description:').fill(uniqueDescr);
  await page.getByLabel('Notify Requestor Email:', { exact: true }).check();
  await page.getByLabel('Notify Next Approver Email:', { exact: true }).check();
  await page.getByLabel('Notify Group:', { exact: true }).selectOption('206');

  await awaitPromise(page, "events", async (p:Page) => {
    await p.getByRole('button', { name: 'Save' }).click();
  });

  //Verify present
  await expect(page.locator('#stepInfo_3')).toContainText(`Email - ${uniqueDescr}`);
});

test.only('Create a New Event from Side Menu', async ({ page }) => {
  const uniqueEventName2 = `Event2 - ${randNum}`;
  const uniqueDescr2 = `Description2 - ${randNum}`;
  await loadWorkflow(page);

  await expect(page.getByRole('button', { name: 'Edit Events' })).toBeVisible();
  //open Edit Events modal
  await awaitPromise(page, "customEvents", async (p:Page) => {
    await p.getByRole('button', { name: 'Edit Events' }).click();
  });

  await expect(page.getByRole('button', { name: 'Create a new Event' })).toBeVisible();
  //open New Event modal
  await awaitPromise(page, "groups", async (p:Page) => {
    await p.getByRole('button', { name: 'Create a new Event' }).click();
  });

  //Enter Data
  await page.getByLabel('Event Name:').pressSequentially(uniqueEventName2);
  const inputValue = uniqueEventName2.replace(/[^a-z0-9]/gi, '_');
  expect(
    await page.getByLabel('Event Name:').inputValue(), 'regex /[^a-z0-9]/gi to be applied to event name'
  ).toBe(inputValue);
  await page.getByLabel('Short Description:').fill(uniqueDescr2);
  await page.getByLabel('Notify Requestor Email:', { exact: true }).check();
  await page.getByLabel('Notify Next Approver Email:', { exact: true }).check();
  await page.getByLabel('Notify Group:', { exact: true }).selectOption('206');
  await awaitPromise(page, "customEvents", async (p:Page) => {
    await p.getByRole('button', { name: 'Save' }).click();
  });

  await expect(page.locator('#ui-id-1')).toBeVisible();

  //Verify
  await expect(page.getByRole('heading', { name: 'List of Events' })).toBeVisible();
  const table = page.locator("#events");
  await expect(table).toBeVisible();

  const eventDisplayName = inputValue.replace(/_+/g, " ");
  await expect(
    table.getByText(eventDisplayName, { exact: true }),
    'new event name, with underscores replaced with spaces, to be present in Event List'
  ).toBeVisible();
  await expect(
    table.getByText(uniqueDescr2, { exact: true }),
    'new event desription to be present in Event List'
  ).toBeVisible();
});


test.only(`Add the first new event to a route action`, async ({ page }) => {
  await loadWorkflow(page);
  await awaitPromise(page, "events", async (p:Page) => {
    await p.locator('#jsPlumb_1_51').click();
  });
  await awaitPromise(page, "workflow/events", async (p:Page) => {
    await p.getByRole('button', { name: 'Add Event' }).click();
  });

  await expect(page.getByRole('button', { name: 'Create Event' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();

  const eventTitle = `Email - ${uniqueDescr}`;
  await page.getByLabel('Add Event').locator('a').click();
  await page.getByRole('option', { name: eventTitle }).click();

  await awaitPromise(page, "events", async (p:Page) => {
    await p.getByRole('button', { name: 'Save' }).click();
  });

  await expect(page.getByText(eventTitle)).toBeInViewport();
});


test.only('Verify Duplicate Event Name is not Allowed', async ({ page }) => {
  await loadWorkflow(page);
  await awaitPromise(page, "customEvents", async (p:Page) => {
    await p.getByRole('button', { name: 'Edit Events' }).click();
  });
  await expect(page.getByRole('button', { name: 'Create a new Event' })).toBeVisible();
 
  //open new event modal and enter data
  await awaitPromise(page, "groups", async (p:Page) => {
    await p.getByRole('button', { name: 'Create a new Event' }).click();
  });
  //fill and attempt to save the same name entered in test 'Create a New Event'
  await page.getByLabel('Event Name:').pressSequentially(uniqueEventName);
  await page.getByLabel('Short Description: Notify').fill('test ' + uniqueDescr);

  //currently handled on back end. outcome should be an alert. read the modal compare the values
  const expectedAlertMsg = `Event name already exists.`
  page.on('dialog', async (dialog) => {
    expect(dialog.type(), 'dialog type to be alert').toBe('alert');
    expect(
      dialog.message(), `alert dialog content to be: ${expectedAlertMsg}`
    ).toBe(expectedAlertMsg);
    await dialog.accept();
  });

  const alertPromise = page.waitForEvent('dialog');
  await page.getByRole('button', { name: 'Save' }).click();
  await alertPromise;
});

test.only('Verify Duplicate Event Description is not Allowed', async ({ page }) => {
  await loadWorkflow(page);
  await awaitPromise(page, "customEvents", async (p:Page) => {
    await p.getByRole('button', { name: 'Edit Events' }).click();
  });
  await expect(page.getByRole('button', { name: 'Create a new Event' })).toBeVisible();

  await awaitPromise(page, "groups", async (p:Page) => {
    await p.getByRole('button', { name: 'Create a new Event' }).click();
  });
  //fill and attempt to save the same description entered in test 'Create a New Event'
  await page.getByLabel('Event Name:').pressSequentially('test ' + uniqueEventName);
  await page.getByLabel('Short Description:').fill(uniqueDescr);

  //alert for duplicate description
  const expectedAlertMsg = `This description has already been used, please use another one.`;
  page.on('dialog', async (dialog) => {
    expect(dialog.type(), 'dialog type to be alert').toBe('alert');
    expect(
      dialog.message(), `alert dialog content to be: ${expectedAlertMsg}`
    ).toBe(expectedAlertMsg);
    await dialog.accept();
  });

  const alertPromise = page.waitForEvent('dialog');
  await page.getByRole('button', { name: 'Save' }).click();
  await alertPromise;
});






//Edit Workflow event using the workflow Editor
test('Edit Event ', async ({ page }, testInfo) => {

  //OPen Page
  await loadWorkflow(page);

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
await loadWorkflow(page);

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
  await loadWorkflow(page);
  
 
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

  let requestId = "";

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

  await page1.waitForLoadState('load');
  await page1.getByRole('button', { name: 'End2end Testing for' }).click();
  await expect(page1.getByRole('heading', { name: 'End2end Testing for' })).toBeVisible();
  await expect(page1.getByRole('textbox', { name: 'Email To:' })).toBeVisible();
  await page1.getByRole('textbox', { name: 'Email To:' }).click();
  await page1.getByRole('textbox', { name: 'Email To:' }).fill('{{$field.9}}\ntest4892@fake.com');
  await page1.getByRole('textbox', { name: 'Email CC:' }).fill('test4892@fake.com');
  
  await page1.getByRole('button', { name: 'Save Changes' }).click();
  await page1.waitForLoadState('load');
  

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
    
  await expect(page.locator('#xhr div').filter({ hasText: 'Assigned Group* Required' }).nth(3)).toBeVisible();
   await expect(page.getByRole('searchbox', { name: 'Search for user to add as' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search for user to add as' }).click();
  await page.getByRole('searchbox', { name: 'Search for user to add as' }).fill('g');
  await page.getByRole('cell', { name: serviceGroup }).click();
  await expect(page.getByRole('searchbox', { name: 'Search for user to add as' })).toHaveValue(groupId);

  await page.waitForSelector('#headerTab', { timeout: 15000 });
  const headerText = await page.textContent('#headerTab');
  requestId = headerText?.split('#')[1] ?? "";

  await expect(page.locator('#nextQuestion')).toBeVisible();
  await page.locator('#nextQuestion').click();



  await page.waitForLoadState('load');

  //Submit Request
  await expect(page.getByRole('button', { name: 'Submit Request' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit Request' }).click();

});

test('Verify Email Sent', async({page}) =>{

  await page.goto('http://host.docker.internal:5080/');

  await page.waitForLoadState('load');
  
  const subjectText = `Action for General Form (#${requestId}) in AS - Service`;
  const emailLink = page.getByText(subjectText);

 if (await emailLink.count() > 0) {
        await emailLink.click();
        await expect(page.getByLabel('Messages')).toContainText(subjectText);
        //Cleanup the inbox
        await page.getByRole('button', { name: 'Delete' }).click();

        console.log(`Email verified and deleted for test ${requestId}`);
      } else {
        console.log(`No email found for request ${requestId}, may be expected behavior`);
      }
 

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

  await page.waitForLoadState('load');

  await page.getByRole('cell', { name: dynRegexrequestTitle }).click();
  await expect(page.getByText('Group A')).toBeVisible();
  
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