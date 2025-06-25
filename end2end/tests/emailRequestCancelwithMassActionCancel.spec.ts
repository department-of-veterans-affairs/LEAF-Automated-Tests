import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'default' });

test.describe('Cancel Request, View Email and Clean up', () => {
test('Cancel Submitted Request', async ({ page }, testInfo) => {

  await page.goto('https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=112');
  
  //Wait for page to load
  await page.waitForLoadState('domcontentloaded');

  //Cancel The Request
  await expect(page.getByRole('button', { name: 'Cancel Request' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel Request' }).click();
  await expect(page.getByText('Are you sure you want to')).toBeVisible();
  await page.getByRole('textbox', { name: 'Enter Comment' }).click();
  await page.getByRole('textbox', { name: 'Enter Comment' }).fill('Cancel Request 112.');
  await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
  await page.getByRole('button', { name: 'Yes' }).click();

  //Verify Request is Cancelled
  await expect(page.getByText('Request #112 has been')).toBeVisible();

  await page.goto('http://host.docker.internal:5080/');

  //Wait for page to load
  await page.waitForLoadState('domcontentloaded');

  await page.getByText('leaf.noreply@fake-email.com').first().click();

 await expect(page.getByLabel('Messages')).toContainText('The request for General Form (#112) has been canceled.');

  //Cleanup
  await page.goto('https://host.docker.internal/Test_Request_Portal/report.php?a=LEAF_mass_action');
  
  //Wait for page to load
  await page.waitForLoadState('domcontentloaded');
  
  await expect(page.getByLabel('Choose Action')).toBeVisible();
  await page.getByLabel('Choose Action').selectOption('restore');

  await expect(page.getByRole('link', { name: '112' })).toBeVisible();
  await page.getByRole('row', { name: '112 General Form LEAF-4872' }).getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Take Action' }).nth(1).click();

  await expect(page.getByText('Are you sure you want to')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
  await page.getByRole('button', { name: 'Yes' }).click();

  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByText('1 successes and 0 failures of 1 total.')).toBeVisible();



});
});
//End of TC-001

test.describe('Cancel Unsubmitted Request and View Email', () => {
test('Cancel unSubmitted Request', async ({ page }, testInfo) => {

  await page.goto('https://host.docker.internal/Test_Request_Portal/');
  
   //Wait for page to load
  await page.waitForLoadState('domcontentloaded');
  
  //Create New Request
  await expect(page.getByText('New Request Start a new')).toBeVisible();
  await page.getByText('New Request Start a new').click();

  //Wait for page to load
  await page.waitForLoadState('domcontentloaded');

 
  //Enter required information
  await expect(page.getByRole('heading', { name: 'Step 1 - General Information' })).toBeVisible();

  await page.getByRole('cell', { name: 'Select an Option Service' }).locator('a').click();
  await page.getByRole('option', { name: 'AS - Service' }).click();

  await page.getByRole('textbox', { name: 'Title of Request' }).click();
  await page.getByRole('textbox', { name: 'Title of Request' }).fill('LEAF-4872 Request');

  await page.locator('label').filter({ hasText: 'General Form' }).locator('span').click();
  
  await page.getByRole('heading', { name: 'Step 1 - General Information' }).click();
  await expect(page.getByRole('button', { name: 'Click here to Proceed' })).toBeVisible();
  await page.getByRole('button', { name: 'Click here to Proceed' }).click();

   //Get UID
  let requestId = await page.textContent('#headerTab');
  console.log('Text inside span:', requestId);
  let str2; 
  str2 = requestId;
  let parts = str2.split("#", 2);
  let firstPart = parts[0];
  let secondPart = parts[1];
  console.log(firstPart, secondPart);
  requestId =secondPart;
  let cancelMsg = `Request #${requestId} has been`;
  let subjectTxt = `The request for General Form (#${requestId}) has been canceled.`;

  await expect(page.getByRole('button', { name: 'Cancel Request' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel Request' }).click();

  await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
  await page.getByRole('button', { name: 'Yes' }).click();

  await expect(page.getByText(cancelMsg)).toBeVisible();

  //Verify Request is not present in the inbox
  await expect(page.getByText(cancelMsg)).toBeVisible();

  await page.goto('http://host.docker.internal:5080/');

  //Wait for page to load
  await page.waitForLoadState('domcontentloaded');

  await page.getByText('leaf.noreply@fake-email.com').first().click();

  await expect(page.getByLabel('Messages')).not.toContainText(subjectTxt);

});
});
//End of TC-002


test.describe('Cancel Mass Action Request, View Email and Clean up', () => {
test('Cancel MassAction Request', async ({ page }, testInfo) => {

  await page.goto('https://host.docker.internal/Test_Request_Portal/report.php?a=LEAF_mass_action');
  
  //Wait for page to load
  await page.waitForLoadState('domcontentloaded');

  await expect(page.getByLabel('Choose Action')).toBeVisible();
  
  //Wait for page to load
  await page.waitForLoadState('domcontentloaded');

  await page.getByLabel('Choose Action').selectOption('cancel');

    //Wait for page to load
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByRole('button', { name: 'Take Action' }).first()).toBeVisible();
   
  await expect(page.getByRole('textbox', { name: 'Comment * required' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Comment * required' }).fill('Cancel #113 & #114');


  await expect(page.getByRole('textbox', { name: 'Enter your search text' })).toBeVisible();

  await page.getByRole('textbox', { name: 'Enter your search text' }).click();
  await page.getByRole('textbox', { name: 'Enter your search text' }).fill('LEAF-4872');


  await page.getByRole('row', { name: '113 General Form LEAF-4872' }).getByRole('checkbox').check();
  await page.getByRole('row', { name: '114 General Form LEAF-4872' }).getByRole('checkbox').check();

  await page.getByRole('button', { name: 'Take Action' }).first().click();
  await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
  await page.getByRole('button', { name: 'Yes' }).click();


   //Wait for page to load
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByText('2 successes and 0 failures of 2 total.')).toBeVisible();
  
  await page.goto('http://host.docker.internal:5080/');
    
   //Wait for page to load
  await page.waitForLoadState('domcontentloaded');

  await page.getByText('leaf.noreply@fake-email.com').first().click();

  await expect(page.locator('iframe').contentFrame().getByText('Reason for cancelling: Cancel #113 & #114')).toBeVisible();

  await page.goto('https://host.docker.internal/Test_Request_Portal/report.php?a=LEAF_mass_action');
  
 //Wait for page to load
  await page.waitForLoadState('domcontentloaded');

  await expect(page.getByLabel('Choose Action')).toBeVisible();

  //Cleanup
  await page.getByLabel('Choose Action').selectOption('restore');

      //Wait for page to load
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByRole('button', { name: 'Take Action' }).first()).toBeVisible();

   await page.getByRole('textbox', { name: 'Enter your search text' }).click();
  await page.getByRole('textbox', { name: 'Enter your search text' }).fill('Leaf-4872');

  await page.getByRole('row', { name: '113 General Form LEAF-4872' }).getByRole('checkbox').check();
  await page.getByRole('row', { name: '114 General Form LEAF-4872' }).getByRole('checkbox').check();

  await page.getByRole('button', { name: 'Take Action' }).nth(1).click();
  await page.getByRole('button', { name: 'Yes' }).click();

  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByText('2 successes and 0 failures of 2 total.')).toBeVisible();


});
test('Supress Cancel MassAction Request', async ({ page }, testInfo) => {

  await page.goto('https://host.docker.internal/Test_Request_Portal/report.php?a=LEAF_mass_action');
  
  //Wait for page to load
  await page.waitForLoadState('domcontentloaded');

  await expect(page.getByLabel('Choose Action')).toBeVisible();
  
  //Wait for page to load
  await page.waitForLoadState('domcontentloaded');

  await page.getByLabel('Choose Action').selectOption('cancel');

    //Wait for page to load
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByRole('button', { name: 'Take Action' }).first()).toBeVisible();

  await expect(page.getByText('Suppress Email Notification')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Suppress Email Notification' }).check();
   
  await expect(page.getByRole('textbox', { name: 'Comment * required' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Comment * required' }).fill('Cancel #115');

  await page.getByRole('textbox', { name: 'Enter your search text' }).click();
  await page.getByRole('textbox', { name: 'Enter your search text' }).fill('Leaf-4872');
  await expect(page.getByRole('textbox', { name: 'Enter your search text' })).toHaveValue('Leaf-4872');


  await page.getByRole('row', { name: '115 General Form LEAF-4872' }).getByRole('checkbox').check();

  await page.getByRole('button', { name: 'Take Action' }).first().click();

  await expect(page.getByText('Are you sure you want to')).toBeVisible();
  await page.getByRole('button', { name: 'Yes' }).click();

   //Wait for page to loadcd 
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByText('1 successes and 0 failures of 1 total.')).toBeVisible();
  
  await page.goto('http://host.docker.internal:5080/');
    
   //Wait for page to load
  await page.waitForLoadState('domcontentloaded');

  await page.getByText('leaf.noreply@fake-email.com').first().click();

  await expect(page.getByLabel('Messages')).not.toContainText('The request for General Form (#115) has been canceled.');

  await page.goto('https://host.docker.internal/Test_Request_Portal/report.php?a=LEAF_mass_action');
  
 //Wait for page to load
  await page.waitForLoadState('domcontentloaded');

  await expect(page.getByLabel('Choose Action')).toBeVisible();

  //Cleanup
  await page.getByLabel('Choose Action').selectOption('restore');

  
    //Wait for page to load
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByRole('button', { name: 'Take Action' }).first()).toBeVisible();

   await page.getByRole('textbox', { name: 'Enter your search text' }).click();
  await page.getByRole('textbox', { name: 'Enter your search text' }).fill('Leaf-4872');

  await page.getByRole('row', { name: '115 General Form LEAF-4872' }).getByRole('checkbox').check();

  await page.getByRole('button', { name: 'Take Action' }).nth(1).click();
  await page.getByRole('button', { name: 'Yes' }).click();

  
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByText('1 successes and 0 failures of 1 total.')).toBeVisible();
  
});
});

