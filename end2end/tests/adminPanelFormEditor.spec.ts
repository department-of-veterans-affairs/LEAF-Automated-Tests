import { test, expect } from '@playwright/test';

test('change field heading', async ({ page }) => {
  await page.goto('https://host.docker.internal/Test_Request_Portal/admin/');

  let randNum = Math.random();
  let uniqueText = `Single line text ${randNum}`;

  await page.getByRole('button', { name: ' Form Editor Create and' }).click();
  await page.getByRole('link', { name: 'General Form' }).click();
  await page.getByTitle('edit indicator 3').click();
  await page.getByLabel('Section Heading').click();
  await page.getByLabel('Section Heading').fill(uniqueText);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.locator('#format_label_3')).toContainText(uniqueText);
});
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
  await expect(page.getByText('⚠️ Having both \'hide except\'')).toBeVisible();
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