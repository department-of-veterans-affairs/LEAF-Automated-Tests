import { test, expect, Browser, Page} from '@playwright/test';
import {
  LEAF_URLS,
  getRandomId,
  createTestForm,
  deleteTestFormByFormID,
  addFormQuestion,
  
} from '../../leaf_test_utils/leaf_util_methods.ts';

let page:Page;

let formID = '';
let testID = '';
let formName = '';
let formDescription = '';

//set up a browser context that can be used to create a page in cleanup afterAll
  test.beforeAll(async ({ browser }) => {

    page = await browser.newPage();
    testID = getRandomId();
    formName = `Regression Form ${testID}`;
    formDescription = formName + " Description";
  });

test('Create digital forms based on business process',{ tag: ['@LEAF-FM-001'] }, async () => {

    // Create a new form
  formID = await createTestForm(page, formName, formDescription);

  // Add a new section
  const sectionName = "Regression Section";
  const sectionID = await addFormQuestion(page, "Add Section", sectionName);

  // Add a question to the section
  const primaryQuestion = "Supervisor Name";
  const questionID = await addFormQuestion(page, "Add Question to Section", primaryQuestion, "Single line text");

  // Add a sub-question to the above question 
  const subQestion = 'Do we need their permission?';
  await page.getByLabel('add sub-question').click();
  await page.getByLabel('Field Name').fill(subQestion);

  // Make the answers be Yes or No with radio buttons
  const subOptions1 = 'Yes\nNo';

  await page.getByLabel('Input Format').selectOption('radio');
  await page.getByLabel('Options (One option per line)').fill(subOptions1);
  
  // Make the default answer be 'Yes"
  const subDefault1 = 'Yes';

  await page.getByLabel('Default Answer').fill(subDefault1);
  await page.getByRole('button', { name: 'Save' }).click();
  const subQuestionID = +questionID + 1;

  // Verify the Yes radio button is selected
  await expect(page.getByText(subDefault1)).toBeChecked();

  // Change the primary question's input 
  await page.getByTitle(`edit indicator ${questionID}`).click();
  await page.getByLabel('Input Format').selectOption('orgchart_employee');

  const primaryID = "#301";
  const primaryName = 'Abbott, Hank Hessel.';

  await page.getByLabel('search input').fill(primaryID);
  await expect(page.getByRole('cell', { name: primaryName })).toBeVisible();
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByRole('button', { name: 'Save' })).not.toBeVisible();
  await expect(page.getByLabel('search input')).toHaveValue(primaryID);
  await expect(page.getByRole('cell', { name: primaryName })).toBeVisible();

  const subOption2 = "Yes";
  const subDefault2 = "Yes";

  await page.getByTitle(`edit indicator ${subQuestionID}`).click();
  await page.getByLabel('Input Format').selectOption('checkbox');
  await page.getByLabel('Text for checkbox').fill(subOption2);
  await page.getByLabel('Default Answer').fill(subDefault2);
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText(subDefault2)).toBeChecked();
});

test.afterAll(async () => {

  if(formID != '') {
    await deleteTestFormByFormID(page, formID);
  }
});