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
  await page.waitForLoadState('load');

  await expect(page.locator('#maintabs div').filter({ hasText: 'Messages Sessions' }).nth(2)).toBeVisible();

   await page.getByText('leaf.noreply@fake-email.com').first().click();

    await expect(page.getByLabel('Messages')).toMatchAriaSnapshot(`
    - paragraph: "From: leaf.noreply@va.gov"
    - paragraph:
      - text: "To:"
      - strong: tester.tester@fake-email.com
      - text: ","
      - strong: Donte.Glover@fake-email.com
      - text: ","
    - paragraph:
      - text: "To:"
      - strong: Rhona.Goodwin@fake-email.com
      - text: ","
    - paragraph: "/Subject: Reminder for General Form \\\\(#\\\\d+\\\\)/"
    `);

    await page.getByRole('button', { name: 'Delete' }).click();


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
}); //End Testing of 4891

//LEAF - 4888
test.describe('LEAF-4888 If/then condition', () => {
//LEAF - 4888 If/then condition This added test verifies when a user selects both "hide except" and "show except" they recieve a warning message
test('Verify warning message is displayed', async ({ page }) => {

  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/');

  //Variables
  const formName = "Test LEAF-4888";
  const formDescription = "Testing the if/then warning message";
  const sectionHeading = "Header One";
  const questionOne ="What is your age range?'";
  const questionOneInput ="12 -18\n19 - 25\n26 - 33\n34 -45";
  const questionTwo= "Where do you go to school?";
  const questionTwoInput = "Middle School\nHigh School";


  //Wait for page to load
  await page.waitForLoadState('domcontentloaded');

  await expect(page.getByRole('button', { name: 'Create Form' })).toBeVisible();
  await page.getByRole('button', { name: 'Create Form' }).click();

  await expect(page.getByRole('heading', { name: 'New Form' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Form Name  (up to 50' }).click();
  await page.getByRole('textbox', { name: 'Form Name  (up to 50' }).fill(formName);
  await page.getByRole('textbox', { name: 'Form Description  (up to 255' }).click();
  await page.getByRole('textbox', { name: 'Form Description  (up to 255' }).fill('Testing the if/then warning message');
  await page.getByRole('button', { name: 'Save' }).click();

  //Wait for page to load
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByRole('heading', { name: 'Admin  Form Browser  Form' })).toBeVisible();

  await page.getByRole('button', { name: 'Add Section' }).click();
  await page.getByRole('textbox', { name: 'Section Heading' }).click();
  await page.getByRole('textbox', { name: 'Section Heading' }).fill(sectionHeading);
  await page.getByRole('button', { name: 'Save' }).click();

  await page.getByRole('button', { name: 'Add Question to Section' }).click();

  //Get ID
   //Get Question ID number
  let questionIdmain = await page.textContent('#leaf_dialog_content_drag_handle');
  console.log(questionIdmain);
  let str2;
  str2 = questionIdmain;
  let seperateStr = str2.split("to", 2);
  let firstPart = seperateStr[0];
  let secondPart = seperateStr[1];
  console.log(firstPart, secondPart);
  const number1 = 1;
  const number2 = Number(secondPart);
  const sum = number1 + number2;
  const mainQuestionId: string = String(sum);



  await page.getByRole('textbox', { name: 'Field Name' }).fill(questionOne);
  await page.getByLabel('Input Format').selectOption('dropdown');
  await page.getByRole('textbox', { name: 'Options (One option per line)' }).click();
  await page.getByRole('textbox', { name: 'Options (One option per line)' }).fill(questionOneInput);
  await page.getByRole('button', { name: 'Save' }).click();

  await page.getByRole('button', { name: 'add sub-question' }).click();

  //Get Question ID number
  let questionId = await page.textContent('#leaf_dialog_content_drag_handle');
  console.log(questionId);
  str2 = questionId;
  seperateStr = str2.split("to", 2);
  firstPart = seperateStr[0];
  secondPart = seperateStr[1];
  console.log(firstPart, secondPart);
  const questionIdnum =Number(secondPart) + number1;

  let editIdData =  `#edit_conditions_${questionIdnum}`;
  let mainOption1 = "19 - 25";
  let mainOption2 = "12 -18";


  await page.getByRole('textbox', { name: 'Field Name' }).fill(questionTwo);
  await page.getByLabel('Input Format').selectOption('dropdown');
  await page.getByRole('textbox', { name: 'Options (One option per line)' }).click();
  await page.getByRole('textbox', { name: 'Options (One option per line)' }).fill(questionTwoInput);
  await page.getByRole('button', { name: 'Save' }).click();

  await page.locator(editIdData).click();
//Create the first condition
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('#condition_editor_inputs')).toBeVisible();
  await page.getByRole('button', { name: 'New Condition' }).click();

  await page.getByLabel('Select an outcome').selectOption('show');
  await page.getByLabel('select controller question').selectOption(mainQuestionId);
  await page.getByLabel('select condition').selectOption('!=');
  await page.getByLabel('select a value').selectOption(mainOption1);
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('This field will be hidden')).toBeVisible();
  await expect(page.getByRole('button', { name: 'New Condition' })).toBeVisible();
  await page.getByRole('button', { name: 'New Condition' }).click();
//Create a second condition
  await page.getByLabel('Select an outcome').selectOption('hide');
   await page.getByLabel('select controller question').selectOption(mainQuestionId);
  await page.getByLabel('select condition').selectOption('==');
  await page.getByLabel('select a value').selectOption(mainOption2);
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  await page.getByRole('button', { name: 'Save' }).click();

//Verify error is displayed
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByRole('button', { name: 'Save' })).toBeHidden();
  await expect(page.getByText('Close')).toBeVisible();
  await page.getByLabel('Close').click();

//Clean up Form
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByRole('heading', { name: 'Admin  Form Browser  Form' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'delete this form' })).toBeVisible();
  await page.getByRole('button', { name: 'delete this form' }).click();
  await expect(page.getByRole('heading', { name: 'Delete this form' })).toBeVisible();
  await page.getByRole('button', { name: 'Yes' }).click();
});
});
//End of Testing 4888

//LEAF-5005 fix incorrect display of an alert dialog
test.describe('LEAF-5005 Alert Dialog', () => {

  // Helper to Create New Form
  async function createNewForm(page: any,  formName: string, formDescription: string) {

   await page.goto(`https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/`);
   await page.waitForLoadState('networkidle');
   await page.waitForTimeout(1000);

   await page.getByRole('button', { name: 'Create Form' }).click();
   
   await page.waitForLoadState('networkidle');
   await page.waitForTimeout(1000);

   await page.getByRole('textbox', { name: 'Form Name  (up to 50' }).click();
   await page.getByRole('textbox', { name: 'Form Name  (up to 50' }).fill(formName);
   await page.getByRole('textbox', { name: 'Form Description  (up to 255' }).click();
   await page.getByRole('textbox', { name: 'Form Description  (up to 255' }).fill(formDescription);
   await page.getByRole('button', { name: 'Save' }).click();
  }

   async function createNewRequest(page: any, testId: string, title: string, serviceName: string, requestType: string ) {
    
    await page.goto('https://host.docker.internal/Test_Request_Portal/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.getByText('New Request Start a new').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.getByRole('cell', { name: 'Select an Option Service' }).locator('a').click();
    await page.getByRole('option', { name: serviceName}).click(); 
    
    // Reliable form filling with verification
    const titleField = page.getByRole('textbox', { name: 'Title of Request' });
    await titleField.waitFor({ state: 'visible' });
    await titleField.click();
    await titleField.fill('');
    await titleField.fill(title);
    
    // Verify the value was set correctly
    const actualValue = await titleField.inputValue();
    if (actualValue !== title) {
      throw new Error(`Title field not set correctly. Expected: ${title}, Got: ${actualValue}`);
    }
    
    await page.locator('label').filter({ hasText: requestType }).locator('span').click();
    await page.getByRole('button', { name: 'Click here to Proceed' }).click();
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.waitForSelector('#headerTab', { timeout: 15000 });
    const headerText = await page.textContent('#headerTab');
    const requestId = headerText?.split('#')[1];
    
    if (!requestId) {
      throw new Error(`Could not extract request ID for test ${testId}`);
    }

    console.log(`Created new request ${requestId} for test ${testId} (not submitted)`);
    return requestId;
  }
  
 test('Create Form & Verify Dialog message', async ({ page }) => {

  //Create A New Form
  const formName =`LEAF-5005_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const formDescription =`FormDescription_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const FormId = await createNewForm(page, formName, formDescription);
  const headerName = 'Upload Question';
  const sectionQuestion = 'Please upload your file?'; 
 
  //FORM Details
  await page.getByLabel('Workflow: No Workflow. Users').selectOption('1');
  await page.getByLabel('Status:').selectOption('1');
  await page.getByLabel('Form Type: StandardParallel').selectOption('parallel_processing');
  await page.getByRole('button', { name: 'Add Section' }).click();
  await page.getByRole('textbox', { name: 'Section Heading' }).click();
  await page.getByRole('textbox', { name: 'Section Heading' }).fill(headerName);
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: 'Add Question to Section' }).click();
  await page.getByLabel('Input Format').selectOption('fileupload');
  await page.getByRole('button', { name: 'Save' }).click();
  
  //NEW Request
  //Create New Request for new Form
  //Generate unique test ID using timestamp
    const testId = `LEAF-5005_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const serviceName = 'AS - Service';
    const title = 'LEAF-5005';
    const requestType = formName;
    
    const requestId = await createNewRequest(page, testId, title, serviceName, requestType);

    //Create New Request

 // await page.getByRole('button', { name: 'Upload a document' }).click();
  await page.getByRole('button', { name: 'Upload a document' }).setInputFiles('LEAF-5005.txt');
  await page.locator('#nextQuestion2').click();


  await expect(page.getByText('Select a data field Assigned PersonAssigned Group Selected Employee(s):')).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search for user to add as' }).selectOption('8');
  await page.locator('#indicator_selector').click();
  await page.getByRole('searchbox', { name: 'Search for user to add as' }).fill('gre');
  await page.getByRole('cell', { name: 'Green, Erasmo Heidenreich.' }).click();
  await page.getByLabel('Green, Erasmo Heidenreich.').getByRole('cell', { name: 'Select' }).click();
  
  await expect(page.getByRole('button', { name: 'Send Request to Selected' })).toBeVisible();
  await page.getByRole('button', { name: 'Send Request to Selected' }).click();
  
  await expect(page.locator('#reportTitleDisplay')).toContainText('Requests have been assigned to these people');

 });

});
//End of Testing 5005

