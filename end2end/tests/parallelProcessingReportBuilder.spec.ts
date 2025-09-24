import { test, expect, Locator } from '@playwright/test';


//Run test in order
test.describe.configure({ mode: 'serial' });

//Global Variables
let randNum = Math.random();
let uniqueFormName = `Parallel_Process_${randNum}`;
let uniqueFormDescr = `Description Parallel Processing Form testing_${randNum}`;
let questionThrere =`'Please select one or more groups?'`;
let workflowTitle = `Workflow_${randNum}`;
let newStepTitle = `ParallelTest_${randNum}`;
let newRequestForm = `Request Form_${randNum}`;
let ddownText = `Please select one or more groups?`;

//Create Form
test ('Create a New Form', async ({ page}, testinfo) => {
  
    //Open browser and create new form
    await page.goto('https://host.docker.internal/Test_Request_Portal/');
    await page.getByRole('link', { name: 'Admin Panel' }).click();
    await page.getByRole('button', { name: ' Form Editor Create and' }).click();

    //Set up New Form
    await expect(page.getByRole('button', { name: 'Create Form' })).toBeVisible();
    await page.getByRole('button', { name: 'Create Form' }).click();
    //Heading
    await expect(page.getByRole('heading', { name: 'New Form' })).toBeVisible();

    //Enter Form Name and Description
    await page.getByRole('textbox', { name: 'Form Name  (up to 50' }).click();
    await page.getByRole('textbox', { name: 'Form Name  (up to 50' }).fill(uniqueFormName);
    await page.getByRole('textbox', { name: 'Form Description  (up to 255' }).click();
    await page.getByRole('textbox', { name: 'Form Description  (up to 255' }).fill(uniqueFormDescr);
    await page.getByRole('button', { name: 'Save' }).click();

    //Verify Form Save
    await expect(page.getByRole('button', { name: 'delete this form' })).toBeVisible();

    //Add Section for Questions
    await page.getByRole('button', { name: 'Add Section' }).click();
    await page.getByRole('textbox', { name: 'Section Heading' }).click();
    await page.getByRole('textbox', { name: 'Section Heading' }).fill('Section 1');
    await expect(page.getByRole('heading', { name: 'Adding new Section' })).toBeVisible();
    await page.getByRole('button', { name: 'Save' }).click();

    //Add Questions
    await page.getByRole('button', { name: 'Add Question to Section' }).click();
    await page.getByRole('button', { name: 'Advanced Formatting' }).click();
    await page.locator('.trumbowyg-editor').click();
    //Question 1
    await page.locator('.trumbowyg-editor').fill('Please select an employee?');
    await page.getByLabel('Input Format').selectOption('orgchart_employee');
    await page.getByRole('button', { name: 'Save' }).click();
    

    await page.getByRole('button', { name: 'Add Question to Section' }).click();
    await page.getByRole('button', { name: 'Advanced Formatting' }).click();
    await page.locator('.trumbowyg-editor').click();

    //Question 2
    await page.locator('.trumbowyg-editor').fill('Please enter a position?');
    await page.getByLabel('Input Format').selectOption('orgchart_position');
    await page.getByRole('button', { name: 'Save' }).click();

    await page.getByRole('button', { name: 'Add Question to Section' }).click();
    await page.getByRole('button', { name: 'Advanced Formatting' }).click();
   
    //Question 3
    await page.locator('.trumbowyg-editor').fill(questionThrere);
    await page.getByLabel('Input Format').selectOption('orgchart_group');
    
    await page.locator('.trumbowyg-editor').click();
    await page.locator('.trumbowyg-editor').press('ControlOrMeta+a');
    await page.getByRole('button', { name: 'Formatting' }).click();
    await page.getByRole('button', { name: 'Paragraph' }).click();
    await page.getByRole('button', { name: 'Text color' }).click();
    await page.getByRole('button', { name: 'foreColor8064a2' }).click();
    await page.getByText('Short label for spreadsheet').click();
    await page.getByRole('button', { name: 'Save' }).click();

  //Verify you are able to see the tags present **Screenshot**
   const spanTxt = `<p><span style="color: rgb(128, 100, 162);">${questionThrere}</span></p> `;
    await page.getByRole('button', { name: 'Edit', exact: true }).nth(2).click();
    await page.getByRole('button', { name: 'Show formatted code' }).click();
    await expect(page.getByLabel('Field Name')).toContainText(spanTxt);
    await page.getByRole('button', { name: 'Save' }).click();

  //Preview Form
  await page.getByRole('button', { name: 'Preview this Form' }).click();

  //Screenshot of NewForm
  const newForm = await page.screenshot();
  await testinfo.attach('New Form', { body: newForm, contentType: 'image/png' });
   
  //Set Form 
  await page.getByLabel('Form Type: StandardParallel').selectOption('parallel_processing');
  await page.getByLabel('Status:').selectOption('1');

});
//end of Create Form

//Set up Workflow
test('Create Workflow', async ({ page}, testinfo) => {

  //Setup constant for workflow
 
  const requestorConnector = page.locator('rect').nth(1);
  const saveButton = page.locator('#button_save');

  //Open browser and create new form
  await page.goto('https://host.docker.internal/Test_Request_Portal/');
  await page.getByRole('link', { name: 'Admin Panel' }).click();
  await page.getByRole('button', { name: ' Workflow Editor Edit' }).click();

  
  await expect(page.getByRole('button', { name: 'New Workflow' })).toBeVisible();

  //Create Workflow
  await page.getByRole('button', { name: 'New Workflow' }).click();
  await page.getByRole('textbox', { name: 'Workflow Title:' }).click();
  await page.getByRole('textbox', { name: 'Workflow Title:' }).fill(workflowTitle);
  await page.getByRole('button', { name: 'Save' }).click();

  //Create New Step
  await page.getByRole('button', { name: 'New Step' }).click();
  await expect(page.getByText('Create new Step')).toBeVisible();

  await page.getByRole('textbox', { name: 'Step Title:' }).fill(newStepTitle);
  await page.getByRole('button', { name: 'Save' }).click();

   // Verify that the new step is visible
   const stepElement = page.getByLabel(`workflow step: ${newStepTitle}`, { exact: true });
   await expect(stepElement).toBeInViewport();

   // Hover over the new step and drag it to the desired position
   await page.reload();
   await stepElement.hover();
   await page.mouse.down();
   await page.mouse.move(300, 300);
   await page.mouse.up();




    // Locate connectors and drag them to connect steps
    const stepConnector = page.locator('.jtk-endpoint').nth(0);
    const endConnector = page.locator('.jtk-endpoint').nth(2);
    await stepConnector.dragTo(endConnector);

 // Select newly created action
 const selectActionDialog = page.getByRole('dialog');
 const actionTypeDropdown = page.locator('#actionType_chosen');
 const approveOption = page.getByRole('option', { name: 'Approve', exact: true });


 await expect(selectActionDialog).toBeInViewport();
 await actionTypeDropdown.click();
 await approveOption.click();
 //await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
 await saveButton.click({force:true});


 const newworkflow = await page.screenshot();
 await testinfo.attach('New Form', { body: newworkflow, contentType: 'image/png' });
  
 const actionButton = page.locator('text="Approve"');
    await expect(actionButton).toBeVisible();


await expect(page.getByRole('button', { name: 'workflow step: ParallelTest_0' })).toBeVisible();
await page.getByRole('button', { name: 'workflow step: ParallelTest_0' }).click();


await expect(page.getByRole('button', { name: 'Add Requirement' })).toBeVisible();
 await page.getByRole('button', { name: 'Add Requirement' }).click();
 await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
 await page.getByRole('dialog', { name: 'Add requirement to a workflow' }).locator('a').click();
 await page.getByRole('option', { name: 'Group Designated by the' }).click();
 await page.getByRole('button', { name: 'Save' }).click();

 await expect(page.getByRole('button', { name: 'Set Data Field' })).toBeVisible();
 await page.getByRole('button', { name: 'Set Data Field' }).click();
 const option =await page.locator('select > option', { hasText: uniqueFormName,}).first();
 const indicatorValue = await option.getAttribute('value');
 await page.locator('#indicatorID').selectOption(indicatorValue);
 await page.getByRole('button', { name: 'Save' }).click();

});
//end Create Workflow


//Update Form
test('Update Form', async ({ page}, testInfo) => {

    //Open browser and Update form
    await page.goto('https://host.docker.internal/Test_Request_Portal/');
    await page.getByRole('link', { name: 'Admin Panel' }).click();

   //Locate the Form
    await expect(page.getByRole('button', { name: ' Form Editor Create and' })).toBeVisible();
    await page.getByRole('button', { name: ' Form Editor Create and' }).click();
    await expect(page.getByRole('heading', { name: 'Active Forms:', exact: true })).toBeVisible();
    await page.getByRole('link', { name: uniqueFormName }).click();

   //Connect the workflow to the form

   const workflowLocator = await page.locator('select > option', { hasText: workflowTitle,});
   const workflowValue = await workflowLocator.getAttribute('value');
   await expect(page.locator('#edit-properties-other-properties')).toBeVisible();
   await page.getByLabel('Workflow: No Workflow. Users').selectOption(workflowValue);
   
    console.log("Text : " + workflowValue);

      const page1Promise = page.waitForEvent('popup');
      await page.getByRole('link', { name: 'View Workflow' }).click();
      const page1 = await page1Promise;
      await page1.getByRole('button', { name: 'workflow step: ParallelTest_0' }).click();
      await expect(page1.getByLabel('Form Field:')).toBeVisible();
     
      //Find the correct value in the dropdown
     const option =await page1.locator('select > option', { hasText: uniqueFormName,}).first();
      const indicatorValue = await option.getAttribute('value');
      await page1.getByLabel('Form Field:').selectOption(indicatorValue);
      await page1.getByText('Requestor ParallelTest_0.').click();
  
      const updateFrm = await page.screenshot();
      await testInfo.attach('updateFrm', { body: updateFrm, contentType: 'image/png' });

 
});

//Create New Request
test('Create New Request', async ({ page }, testInfo) => {
  const serviceDropdown = page.locator('#service_chosen');
  await page.goto('https://host.docker.internal/Test_Request_Portal/');


  //Create New Request
  await expect(page.getByText('New Request Start a new')).toBeVisible();
  await page.getByText('New Request', { exact: true }).click();
  await expect(page.locator('#step1_questions')).toBeVisible();
  await expect(serviceDropdown).toBeVisible();
  await serviceDropdown.click();
  await page.getByRole('option', { name: 'Bronze Kids', exact: true }).click();

  await page.getByRole('textbox', { name: 'Title of Request' }).click();
  await page.getByRole('textbox', { name: 'Title of Request' }).fill(newRequestForm);
  await page.getByText(uniqueFormName).click();
  await page.getByRole('button', { name: 'Click here to Proceed' }).click();
  await expect(page.getByText('Form completion progress: 0% Next Question')).toBeVisible();


  //**Add a check */

  //Question 1
  await page.getByRole('searchbox', { name: 'Search for user to add as Please select an employee?' }).click();
  await page.getByRole('searchbox', { name: 'Search for user to add as Please select an employee?' }).fill('t');
  await page.getByRole('cell', { name: 'Bins, Terina Corkery. Dynamic' }).click();

  //Question 2
  await page.getByRole('searchbox', { name: 'Search for user to add as Please enter a position?' }).click();
  await page.getByRole('searchbox', { name: 'Search for user to add as Please enter a position?' }).fill('t');
  await page.getByRole('cell', { name: 'Accountability Officer (GS 14' }).click();

  //Question 3
  await page.getByRole('searchbox', { name: 'Search for user to add as \'' }).click();
  await page.getByRole('searchbox', { name: 'Search for user to add as \'' }).fill('t');
  await page.getByRole('cell', { name: 'Bronze Kids', exact: true }).click();
  await page.locator('#nextQuestion2').click();

   //**Add a check */
  await expect(page.getByText('Please review your request')).toBeVisible();
  await expect(page.locator('#indicator_selector')).toBeVisible();


//Find the correct value in the dropdown
const ddLocator = await page.locator('select > option', { hasText: ddownText,});
const ddOptions = await ddLocator.getAttribute('value');;
await page.locator('#indicator_selector').selectOption(ddOptions);


  await page.getByRole('searchbox', { name: 'Search for user to add as' }).click();
  await page.getByRole('searchbox', { name: 'Search for user to add as' }).fill('t');
  await page.locator('#btn202').click();
  await page.locator('#btn63').click();
  await page.locator('#btn78').click();
  await page.locator('#btn19').click();


   //**Add a check */
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Send Request to Selected' }).click();

  //Verify Report is displayed 
  await expect(page.getByText('Requests have been assigned to these people 4 recordsStop and show results')).toBeVisible();

  const rptBld = await page.screenshot();
  await testInfo.attach('rptBld', { body: rptBld, contentType: 'image/png' });
  
});
