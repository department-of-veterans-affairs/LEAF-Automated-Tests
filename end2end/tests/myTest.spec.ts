import { test, expect, Locator } from '@playwright/test';



test.describe('Testing Data', () => {


    // Helper function to create a new request
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
  test('New Request Template', async ({ page}, testinfo) => {

// Generate unique test ID using timestamp
    const testId = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const serviceName = 'AS - Service';
    const title = 'TestRequest';
    const requestType = `General Form`;
    
    const requestId = await createNewRequest(page, testId, title, serviceName, requestType);

    //Dummy Test
  await page.getByRole('textbox', { name: 'Single line Text', exact: true }).click();
  await page.getByRole('textbox', { name: 'Single line Text', exact: true }).fill('Single line Text');
  await page.getByRole('textbox', { name: 'Multi line text' }).click();
  await page.getByRole('textbox', { name: 'Multi line text' }).fill('Multi Line');
  await page.getByRole('textbox', { name: 'Numeric' }).click();
  await page.getByRole('textbox', { name: 'Numeric' }).fill('Numeric');
  await page.getByRole('textbox', { name: 'Single line text B' }).click();
  await page.getByRole('textbox', { name: 'Single line text B' }).fill('Single');
 
  await page.getByRole('textbox', { name: 'Numeric' }).fill('500');

  await page.locator('#radio_options_7 label').filter({ hasText: 'B' }).locator('span').click();
  await page.locator('#radio_options_7 label').filter({ hasText: 'B' }).locator('span').click();

  await expect(page.locator('#nextQuestion2')).toBeVisible();
  await page.locator('#nextQuestion2').click();
  await page.waitForLoadState('load');


  await page.getByRole('searchbox', { name: 'Search for user to add as Assigned Person', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Search for user to add as Assigned Person', exact: true }).fill('gr');
   await expect(page.getByRole('cell', { name: 'Green, Erasmo Heidenreich.' })).toBeVisible();
  await page.getByRole('cell', { name: 'Green, Erasmo Heidenreich.' }).click();
  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Assigned Person', exact: true })).toHaveValue('userName:VTRHMITOCCARA');
  await page.waitForLoadState('domcontentloaded');
 
  await expect(page.locator('#nextQuestion2')).toBeVisible();
  await page.locator('#nextQuestion2').click();
   await page.waitForLoadState('domcontentloaded');

  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Assigned Group' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search for user to add as Assigned Group' }).click();
  await page.getByRole('searchbox', { name: 'Search for user to add as Assigned Group' }).fill('2');
  await page.getByRole('cell', { name: 'TEST Group' }).click();

  await expect(page.locator('#nextQuestion2')).toBeVisible();
  await page.locator('#nextQuestion2').click();
  await page.waitForLoadState('load');

  await expect(page.getByRole('button', { name: 'Submit Request' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit Request' }).click();


  });

  test ('Create a New Form', async ({ page}, testinfo) => {

    const formName =`Form_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const formDescription =`FormDescription_${Date.now()}_${Math.floor(Math.random() * 1000)}`;


    const FormId = await createNewForm(page, formName, formDescription);
    
  await page.getByRole('button', { name: 'Add Section' }).click();
  await page.getByRole('textbox', { name: 'Section Heading' }).click();
  await page.getByRole('textbox', { name: 'Section Heading' }).fill('Section Heading');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: 'Add Question to Section' }).click();
  await page.getByRole('textbox', { name: 'Field Name' }).fill('Section Question');
  await page.getByLabel('Workflow: No Workflow. Users').selectOption('1');
  await page.getByRole('button', { name: 'Save' }).click();
    await page.getByLabel('Status:').selectOption('1');
   await page.getByLabel('Status:').click();

  });
    
  test ('End2End Form to Request', async ({ page}, testinfo) => {


  //Create a New Form
    const formName =`Form_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const formDescription =`FormDescription_${Date.now()}_${Math.floor(Math.random() * 1000)}`;


    const FormId = await createNewForm(page, formName, formDescription);
  
  await page.getByLabel('Status:').selectOption('1');
  await page.getByLabel('Workflow: No Workflow. Users').selectOption('1');
 await page.getByLabel('Status:').click();
  await page.getByRole('button', { name: 'Add Section' }).click();
  await page.getByRole('textbox', { name: 'Section Heading' }).click();
  await page.getByRole('textbox', { name: 'Section Heading' }).fill('Section Heading');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: 'Add Question to Section' }).click();
  await page.getByRole('textbox', { name: 'Field Name' }).fill('Section Question');
  await page.getByRole('button', { name: 'Save' }).click();
    await page.getByLabel('Status:').selectOption('1');
   await page.getByLabel('Status:').click();

   //Create New Request for new Form
// Generate unique test ID using timestamp
    const testId = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const serviceName = 'AS - Service';
    const title = 'TestRequest';
    const requestType = formName;
    
    const requestId = await createNewRequest(page, testId, title, serviceName, requestType);

    //Create New Request
      //Dummy Test
  await page.getByRole('textbox', { name: 'Single line Text', exact: true }).click();
  await page.getByRole('textbox', { name: 'Single line Text', exact: true }).fill('Single line Text');
  await page.getByRole('textbox', { name: 'Multi line text' }).click();
  await page.getByRole('textbox', { name: 'Multi line text' }).fill('Multi Line');
  await page.getByRole('textbox', { name: 'Numeric' }).click();
  await page.getByRole('textbox', { name: 'Numeric' }).fill('Numeric');
  await page.getByRole('textbox', { name: 'Single line text B' }).click();
  await page.getByRole('textbox', { name: 'Single line text B' }).fill('Single');
 
  await page.getByRole('textbox', { name: 'Numeric' }).fill('500');

  await page.locator('#radio_options_7 label').filter({ hasText: 'B' }).locator('span').click();
  await page.locator('#radio_options_7 label').filter({ hasText: 'B' }).locator('span').click();

  await expect(page.locator('#nextQuestion2')).toBeVisible();
  await page.locator('#nextQuestion2').click();
  await page.waitForLoadState('load');


  await page.getByRole('searchbox', { name: 'Search for user to add as Assigned Person', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Search for user to add as Assigned Person', exact: true }).fill('gr');
   await expect(page.getByRole('cell', { name: 'Green, Erasmo Heidenreich.' })).toBeVisible();
  await page.getByRole('cell', { name: 'Green, Erasmo Heidenreich.' }).click();
  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Assigned Person', exact: true })).toHaveValue('userName:VTRHMITOCCARA');
  await page.waitForLoadState('domcontentloaded');
 
  await expect(page.locator('#nextQuestion2')).toBeVisible();
  await page.locator('#nextQuestion2').click();
   await page.waitForLoadState('domcontentloaded');

  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Assigned Group' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search for user to add as Assigned Group' }).click();
  await page.getByRole('searchbox', { name: 'Search for user to add as Assigned Group' }).fill('2');
  await page.getByRole('cell', { name: 'TEST Group' }).click();

  await expect(page.locator('#nextQuestion2')).toBeVisible();
  await page.locator('#nextQuestion2').click();
  await page.waitForLoadState('load');

  await expect(page.getByRole('button', { name: 'Submit Request' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit Request' }).click();


  });

test ('Create a New Event', async ({ page}, testinfo) => {
    

  await page.goto('https://host.docker.internal/Test_Request_Portal/');

   // Docker-optimized waiting
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

  const newTable = page.getByRole('table');
 
  const tableBody = await newTable.locator('tbody');
 
  const newRows = await tableBody.locator('tr');
  const rowContents = await newRows.allInnerTexts();
  console.log(rowContents.length );
  if(rowContents.length > 0) {
    console.log("There are rows in the table");
  } else {
    console.log("No values in table");
  }
  console.log("end of test");
 
  //const numNewRows = await newRows.length;
  //console.log(numNewRows);


});

});