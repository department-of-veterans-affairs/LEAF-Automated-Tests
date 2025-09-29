import { test, expect, Page } from '@playwright/test';
import {
  LEAF_URLS,
  getRandomId,
  createTestForm,
  deleteTestFormByFormID,
  addFormQuestion,
  createTestRequest,
  deleteTestRequestByRequestID,
  awaitPromise,
} from '../leaf_test_utils/leaf_util_methods.ts';


test.describe.configure({ mode: 'default' });

const testId = getRandomId();

test.describe('Update heading of a General Form then reset back to original heading', () => {
  const originalText = `Single line text`;
  const newText = `Single line text ${testId}`;
  let formEditorFieldsFormID = '';

  test.only('edit a section heading', async ({ page }) => {
    formEditorFieldsFormID = await createTestForm(page, `form_name_${testId}`, `form_descr_${testId}`);
    const sectionID = await addFormQuestion(page, 'Add Section', originalText, '');
    const headerEditSelector = `edit indicator ${sectionID}`;
    const headerLabelSelector = `#format_label_${sectionID}`;
    await expect(page.getByTitle(headerEditSelector)).toBeVisible();

    await page.getByTitle(headerEditSelector).click();
    await expect(page.getByLabel('Section Heading')).toBeVisible();
    await page.getByLabel('Section Heading').fill(newText);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator(headerLabelSelector)).toContainText(newText);

    await page.getByTitle(headerEditSelector).click();
    await expect(page.getByLabel('Section Heading')).toBeVisible();
    await page.getByLabel('Section Heading').fill(originalText);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator(headerLabelSelector)).toContainText(originalText);

    //cleanup
    await deleteTestFormByFormID(page, formEditorFieldsFormID);
  });
});


test.describe('Create New Request, Send Mass Email, then Verify Email',  () => {
  let requestID_emailing = '';
  test.only('Create a New Request', async ({ page }) => {
    let singleLineText = `Single line Text ${testId}`;
    let multiLineText = `This is some multi link test ${testId}. This is some multi link test.`;
    let numericText =`1922`;
    let radioTxt =`B`;
    let groupText = `Group A`;
    let assignedPersonOne = `Tester, Tester Product Liaison`;
    let assignedPersonTwo = `Bauch, Herbert Purdy. Human`;  

    requestID_emailing = await createTestRequest(page, 'AS - Service', `LEAF-4891-${testId}`, 'General Form');
  
    await expect(page.getByText('Form completion progress: 0% Next Question')).toBeVisible();
    await expect(page.locator('#xhr')).toBeVisible();
    
    //1. Single line Text
    await page.getByRole('textbox', { name: 'Single line text', exact: true }).fill(singleLineText);
    await page.getByRole('textbox', { name: 'Multi line text' }).fill(multiLineText);
    await page.getByRole('textbox', { name: 'Numeric' }).fill(numericText);
    await page.getByRole('textbox', { name: 'Single line text B' }).fill(singleLineText);
    await page.locator('#radio_options_7 label').filter({ hasText: radioTxt }).locator('span').click();
    await expect(page.locator('#nextQuestion2')).toBeVisible();
    await page.locator('#nextQuestion2').click();
 
    //2. Assigned Person  
    await expect(page.getByText('Form completion progress: 0% Next Question')).toBeVisible();
    await page.getByRole('searchbox', { name: 'Search for user to add as Assigned Person', exact: true }).fill('tes');
    await expect(page.getByRole('cell', { name: assignedPersonOne })).toBeVisible();
    await page.getByRole('cell', { name: assignedPersonOne }).click();

    await page.getByRole('searchbox', { name: 'Search for user to add as Assigned Person 2' }).fill('h');
    await expect(page.getByRole('cell', { name: assignedPersonTwo })).toBeVisible();
    await page.getByRole('cell', { name: assignedPersonTwo}).click();
    await expect(page.locator('#nextQuestion2')).toBeVisible();
    await page.locator('#nextQuestion2').click();
    await expect(page.getByText('Form completion progress: 50% Next Question')).toBeVisible();

    //3. Assigned Group
    await expect(page.getByRole('searchbox', { name: 'Search for user to add as' })).toBeVisible();
    await page.getByRole('searchbox', { name: 'Search for user to add as' }).fill('group');
    await expect(page.getByRole('cell', { name: groupText })).toBeVisible();
    await page.getByRole('cell', { name: groupText }).click();
    await expect(page.getByText('Search results found for term group#206 listed below Group TitleGroup A')).toBeVisible();
    await expect(page.locator('#nextQuestion2')).toBeVisible();
    await page.locator('#nextQuestion2').click();

    await expect(page.getByRole('button', { name: 'Submit Request' })).toBeVisible();
    await page.getByRole('button', { name: 'Submit Request' }).click();
  });

  test.only('Mass Action Email Reminder', async ({ page }) => {
    await page.goto(LEAF_URLS.MASS_ACTION);
    await expect(page.getByText('Choose Action -Select- Cancel')).toBeVisible();

    //Start The Mass Email Reminder
    await page.getByLabel('Choose Action').selectOption('email');
    await expect(page.getByRole('textbox', { name: 'Enter your search text' })).toBeVisible();
    // Use a broader search term to find the request created by any test run
    await page.getByRole('textbox', { name: 'Enter your search text' }).fill('LEAF-4891');
    await page.getByRole('spinbutton', { name: 'Days Since Last Action' }).fill('0');
    await expect(page.getByRole('button', { name: 'Search Requests' })).toBeVisible();

    await awaitPromise(page, 'LEAF-4891', async (p:Page) => {
      p.getByRole('button', { name: 'Search Requests' }).click()
    });
 

    await expect(page.locator('table[id^="LeafFormGrid"] tbody tr').first()).toBeVisible();

    // Check if any requests were found
    const selectAllCheckbox = page.locator('#selectAllRequests');
    await selectAllCheckbox.check();
    await expect(page.getByRole('button', { name: 'Take Action' }).nth(1)).toBeVisible();
    await page.getByRole('button', { name: 'Take Action' }).nth(1).click();
    await expect(page.getByText('Are you sure you want to')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
    await page.getByRole('button', { name: 'Yes' }).click();
    await page.waitForLoadState('networkidle');

    const successMsg = /\d+ successes and 0 failures of \d+ total./;
    await expect(
      page.locator('#massActionContainer .progress', { hasText: successMsg }),
      `progress message, ${successMsg}, to be displayed`
    ).toBeVisible();
  });

  test.only('Verify Email Sent', { tag: ['@LEAF-4891'] }, async ({ page }) => {
    await page.goto(LEAF_URLS.EMAIL_SERVER);
    const emailLink = page.locator('td div.cell').getByText(`(#${requestID_emailing})`).first();
    const emailCount = await emailLink.count();
    if(emailCount === 1) {
      expect(
        emailLink,
        `a reminder notification email to be found for submitted request ${requestID_emailing}`
      ).toBeVisible();
      const tableRow = page.locator(`tr:has(td:has-text("(#${requestID_emailing})"))`);
      await expect(tableRow.locator('td').getByText('leaf.noreply@va.gov')).toBeVisible();
      await expect(tableRow.locator('td').getByText('tester.tester@fake-email.com')).toBeVisible();
      await expect(tableRow.locator('td').getByText('Reminder for General Form')).toBeVisible();

      await emailLink.click();
      await page.getByRole('button', { name: 'Delete' }).click();
      await expect(tableRow).not.toBeVisible();

    } else {
      expect(
        true,
        'reminder email to be found (note: API tests must be run prior to email reminder testing).'
      ).toBe(false);
    }

    //cleanup 
    await deleteTestRequestByRequestID(page, requestID_emailing)
  });
});


test.only('warning message is displayed if both hidden and shown display states are on the same question', async ({ page }) => {
  await page.goto(LEAF_URLS.FORM_EDITOR);

  const formName = `Test LEAF-4888-${testId}`;
  const formDescription = "Testing the if/then warning message";
  const sectionHeading = "Header One";
  const questionOne ="What is your age range?'";
  const questionOneOptions ="12 - 18\n19 - 25\n26 - 33\n34 -45";
  const questionTwo= "Where do you go to school?";
  const questionTwoOptions = "Middle School\nHigh School";

  const LEAF_4888_formId = await createTestForm(page, formName, formDescription);

  await expect(page.getByRole('heading', { name: 'Form Browser' })).toBeVisible();

  await addFormQuestion(page, 'Add Section', sectionHeading, '');
  const controllerIndID = await addFormQuestion(
    page, 'Add Question to Section', questionOne, 'dropdown', questionOneOptions
  );
  const conditionalIndID = await addFormQuestion(
    page, 'Add Question to Section', questionTwo, 'dropdown', questionTwoOptions
  );
  const mainOption1 = "19 - 25";
  const mainOption2 = "12 - 18";

  await page.locator(`#edit_conditions_${conditionalIndID}`).click();
  await expect(page.locator('#condition_editor_inputs')).toBeVisible();

  await page.getByRole('button', { name: 'New Condition' }).click();

  await expect(page.getByLabel('Select an outcome')).toBeVisible();
  await page.getByLabel('Select an outcome').selectOption('show');
  await page.getByLabel('select controller question').selectOption(controllerIndID);
  await page.getByLabel('select condition').selectOption('!=');

  await expect(page.getByRole('searchbox', { name: 'parent value choices'})).toBeVisible();
  await page.getByRole('searchbox', { name: 'parent value choices'}).click();
  await page.getByRole('option', { name: mainOption1 + ' Press to select' }).click();
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();

  await awaitPromise(page, `${conditionalIndID}/conditions`, async (p:Page) => {
    await p.getByRole('button', { name: 'Save' }).click();
  });
  await expect(page.getByText('This field will be shown IF')).toBeVisible();

  //Create a second condition
  await page.getByRole('button', { name: 'New Condition' }).click();

  await expect(page.getByLabel('Select an outcome')).toBeVisible();
  await page.getByLabel('Select an outcome').selectOption('hide');
  await page.getByLabel('select controller question').selectOption(controllerIndID);
  await page.getByLabel('select condition').selectOption('==');

  await expect(page.getByRole('searchbox', { name: 'parent value choices'})).toBeVisible();
  await page.getByRole('searchbox', { name: 'parent value choices'}).click();
  await page.getByRole('option', { name: mainOption2 + ' Press to select' }).click();
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();

  await awaitPromise(page, `${conditionalIndID}/conditions`, async (p:Page) => {
    await p.getByRole('button', { name: 'Save' }).click();
  });

  await expect(page.locator(
    '.entry_warning',
    { hasText: 'Having both \'hidden\' and \'shown\' can cause fields to display incorrectly.'}),
    'warning is about setting conflicting display states is visisble'
  ).toBeVisible();

  await expect(page.getByText('Close')).toBeVisible();
  await page.getByLabel('Close').click();
  await deleteTestFormByFormID(page, LEAF_4888_formId);
});


test.only('Verify Alert Dialog does not Appear', async ({ page }) => {
  const formName =`LEAF-5005_${testId}`;
  const formDescription =`FormDescription_${testId}`;
  const LEAF_5005_formId = await createTestForm(page, formName, formDescription);

  //FORM Details
  await expect(page.locator('#edit-properties-other-properties')).toBeVisible();
  await page.getByLabel('Workflow:').selectOption('1');
  await page.getByLabel('Status:').selectOption('1');
  await page.getByLabel('Form Type:').selectOption('parallel_processing');

  await addFormQuestion(page, 'Add Section', 'Heading', '');
  const fileUploadIndId = await addFormQuestion(page, 'Add Question to Section', 'Upload Question', 'fileupload');

  const title = `request LEAF-5005_${testId}`;
  const requestId = await createTestRequest(page, 'AS - Service', title, formName);

  await expect(page.getByRole('group', { name: 'File Attachment(s)' })).toBeVisible();
  await awaitPromise(page, `form/${requestId}`, async (p:Page) => {
    await p.locator(`#file${fileUploadIndId}_control input`).setInputFiles(`./artifacts/LEAF-5005.txt`);
  });
  await expect(page.getByText('File LEAF-5005.txt has been')).toBeVisible();
  await expect(page.locator('#nextQuestion2')).toBeVisible();
  await page.locator('#nextQuestion2').click();

  await expect(page.getByText('Select a data field Assigned PersonAssigned Group Selected Employee(s):')).toBeVisible();
  await page.locator('#indicator_selector').selectOption('9');
  await page.getByRole('searchbox', { name: 'Search for user to add as' }).fill('tes');
  await page.locator('#btn200').click();
  await expect(page.getByText('RemoveAS Test Group')).toBeVisible();

  await page.getByRole('button', { name: 'Send Request to Selected' }).click();
  await expect(page.locator('#saveLinkContainer')).toContainText('Requests have been assigned to these people 1 recordsStop and show results');

  //Clean Up
  await deleteTestFormByFormID(page, LEAF_5005_formId);
  await deleteTestRequestByRequestID(page, requestId)
});
