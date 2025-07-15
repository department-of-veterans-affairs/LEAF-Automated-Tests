import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'default' });

test.describe('Update heading of a General Form then reset back to orginal heading', () => {
 test('change field heading', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/');

  let randNum = Math.random();
  let uniqueText = `Single line text ${randNum}`;
  let originalText = `Single line Text`;

  await page.getByRole('button', { name: ' Form Editor Create and' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.getByRole('link', { name: 'General Form' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.getByTitle('edit indicator 3').click();
  await page.getByLabel('Section Heading').click();
  await page.getByLabel('Section Heading').fill(uniqueText);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.locator('#format_label_3')).toContainText(uniqueText);

  //Adding end2end testing for LEAF-4891
 
  //update the heading back to orginal name
   await page.getByTitle('edit indicator 3').click();
  await page.getByLabel('Section Heading').click();
  await page.getByLabel('Section Heading').fill(originalText);
  await page.getByRole('button', { name: 'Save' }).click();
 
});
});

//LEAF-4891 end2end Testing
test.describe('LEAF-4891 Create New Request, Send Mass Email, then Verify Email', () => {

  test('Create a New Request', async ({ page }) => {
  
  let titleText = `LEAF-4891`;
  let singleLineText = `Single line Text`;
  let multiLineText = `This is some multi link test. This is some multi link test. This is some multi link test.`;
  let numericText =`1922`;
  let radioTxt =`B`;
  let groupText = `Group A`;
  let assignedPersonOne = `Tester, Tester Product Liaison`;
  let assignedPersonTwo = `Bauch, Herbert Purdy. Human`;  

  await page.goto('https://host.docker.internal/Test_Request_Portal/');

  await page.getByText('Start a new request').click();
  await page.waitForLoadState('load');
 

  await page.getByRole('cell', { name: 'Select an Option Service' }).locator('a').click();
  await page.getByRole('option', { name: 'AS - Service' }).click();
  await page.getByRole('textbox', { name: 'Title of Request' }).click();
  await page.getByRole('textbox', { name: 'Title of Request' }).fill(titleText);
  await page.locator('label').filter({ hasText: 'General Form' }).locator('span').click();
  await page.getByRole('button', { name: 'Click here to Proceed' }).click();

  await page.waitForLoadState('load');
  await expect(page.getByText('Form completion progress: 0% Next Question')).toBeVisible();
   await expect(page.locator('#xhr')).toBeVisible();
  
//1. Single line Text
  await page.getByRole('textbox', { name: 'Single line Text', exact: true }).fill(singleLineText);
  await page.getByRole('textbox', { name: 'Multi line text' }).click();
  await page.getByRole('textbox', { name: 'Multi line text' }).fill(multiLineText);
  await page.getByRole('textbox', { name: 'Numeric' }).click();
  await page.getByRole('textbox', { name: 'Numeric' }).fill(numericText);
  await page.getByRole('textbox', { name: 'Single line text B' }).click();
  await page.getByRole('textbox', { name: 'Single line text B' }).fill(singleLineText);
  await page.locator('#radio_options_7 label').filter({ hasText: radioTxt }).locator('span').click();
  await expect(page.locator('#nextQuestion2')).toBeVisible();
  await page.locator('#nextQuestion2').click();
 
  await expect(page.getByText('Form completion progress: 0% Next Question')).toBeVisible();
//2. Assigned Person  
  await page.getByRole('searchbox', { name: 'Search for user to add as Assigned Person', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Search for user to add as Assigned Person', exact: true }).fill('tes');
  await page.getByRole('cell', { name: assignedPersonOne }).click();
  await page.getByRole('searchbox', { name: 'Search for user to add as Assigned Person 2' }).click();
  await page.getByRole('searchbox', { name: 'Search for user to add as Assigned Person 2' }).fill('h');
  await page.getByRole('cell', { name: assignedPersonTwo}).click();
  await expect(page.locator('#nextQuestion2')).toBeVisible();
  await page.locator('#nextQuestion2').click();

  await expect(page.getByText('Form completion progress: 50% Next Question')).toBeVisible();
//3. Assigned Group  
  await page.getByRole('searchbox', { name: 'Search for user to add as' }).click();
  await page.getByRole('searchbox', { name: 'Search for user to add as' }).fill('group');
  await page.getByRole('cell', { name: groupText }).click();
  await expect(page.getByText('Search results found for term group#206 listed below Group TitleGroup A')).toBeVisible();
  await expect(page.locator('#nextQuestion2')).toBeVisible();
  await page.locator('#nextQuestion2').click();
  await expect(page.getByRole('button', { name: 'Submit Request' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Submit Request' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit Request' }).click();
  });

  test('Mass Action Email Reminder', async ({ page }) => {

  await page.goto('https://host.docker.internal/Test_Request_Portal/report.php?a=LEAF_mass_action');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByText('Choose Action -Select- Cancel')).toBeVisible();

 //Start The Mass Email Reminder
  await page.getByLabel('Choose Action').selectOption('email');
  await expect(page.getByRole('textbox', { name: 'Enter your search text' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Enter your search text' }).click();
  await page.getByRole('textbox', { name: 'Enter your search text' }).fill('Leaf-4891');

  await page.getByRole('spinbutton', { name: 'Days Since Last Action' }).click();
  await page.getByRole('spinbutton', { name: 'Days Since Last Action' }).fill('0');
    await expect(page.getByRole('button', { name: 'Search Requests' })).toBeVisible();

  await page.getByRole('button', { name: 'Search Requests' }).click();

  //Send out email Reminder
  await page.locator('#selectAllRequests').check();
  await expect(page.getByRole('button', { name: 'Take Action' }).nth(1)).toBeVisible();
  await page.getByRole('button', { name: 'Take Action' }).nth(1).click();
  await expect(page.getByText('Are you sure you want to')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
  await page.getByRole('button', { name: 'Yes' }).click();

  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByText('1 successes and 0 failures of 1 total.')).toBeVisible();

  });

  test('Verify Email Sent', async ({ page }) => {

     await page.goto('http://host.docker.internal:5080/');
    
   //Wait for page to load
  await page.waitForLoadState('domcontentloaded');

  await page.getByText('leaf.noreply@fake-email.com').first().click();
  
   await expect(page.getByRole('tab', { name: 'View' })).toBeVisible();
  await page.getByRole('tab', { name: 'View' }).click();

  await expect(page.getByLabel('Messages')).toContainText('To: tester.tester@fake-email.com, Donte.Glover@fake-email.com,');
  await expect(page.getByLabel('Messages')).toContainText('To: Rhona.Goodwin@fake-email.com,');
  await expect(page.getByLabel('Messages')).toContainText('Subject: Reminder for General Form');

 
  });

  test('Cancel Request', async ({ page }, testInfo) => {

  await page.goto('https://host.docker.internal/Test_Request_Portal/');
  
  //Wait for page to load
  await page.waitForLoadState('domcontentloaded');
   let requestText = `LEAF-4891`;
  
  //Find the Request
  await expect(page.getByRole('button', { name: 'Advanced Options' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Enter your search text' }).fill(requestText);
  await expect(page.getByRole('button', { name: 'Show more records' })).toBeVisible();
  await page.getByRole('link', { name: requestText }).click();

  //Wait for page to load
  await page.waitForLoadState('domcontentloaded');

    let requestId = await page.textContent('#headerTab');
  console.log('Text inside span:', requestId);
  let str2; 
  str2 = requestId;
  let parts = str2.split("#", 2);
  let firstPart = parts[0];
  let secondPart = parts[1];
  console.log(firstPart, secondPart);
  requestId =secondPart;
  let cancelMsg = `Request #${requestId} has been cancelled!`;
 
  //Cancel The Request
  
  await expect(page.getByRole('button', { name: 'Cancel Request' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel Request' }).click();
  await expect(page.getByText('Are you sure you want to')).toBeVisible();
  await page.getByRole('textbox', { name: 'Enter Comment' }).click();
  await page.getByRole('textbox', { name: 'Enter Comment' }).fill('Delete Request');
  await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
  await page.getByRole('button', { name: 'Yes' }).click();

  await page.waitForLoadState('load');
await expect(page.locator('#bodyarea')).toBeVisible();
  await expect(page.locator('#bodyarea')).toContainText(cancelMsg);
  });
});
