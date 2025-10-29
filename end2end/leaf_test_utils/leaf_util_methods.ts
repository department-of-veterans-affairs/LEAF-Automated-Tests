import { Page, Locator, expect } from '@playwright/test';

const baseTestPortal = 'https://host.docker.internal/Test_Request_Portal/';
const baseTestNexus = 'https://host.docker.internal/Test_Nexus/';

export const LEAF_URLS = {
  PORTAL_HOME: baseTestPortal,
  FORM_EDITOR: baseTestPortal + 'admin/?a=form_vue#/',
  FORM_EDITOR_FORM: baseTestPortal + 'admin/?a=form_vue#/forms?formID=',
  INITIAL_FORM: baseTestPortal + '?a=newform',
  WORKFLOW_EDITOR: baseTestPortal + 'admin/?a=workflow',
  WORKFLOW_EDITOR_WF: baseTestPortal + 'admin/?a=workflow&workflowID=',
  REPORT_BUILDER: baseTestPortal + '?a=reports&v=3',
  MASS_ACTION: baseTestPortal + 'report.php?a=LEAF_mass_action',
  PRINTVIEW_REQUEST: baseTestPortal + 'index.php?a=printview&recordID=',
  EDITVIEW_REQUEST: baseTestPortal + 'index.php?a=view&recordID=',
  ACCOUNT_UPDATER: baseTestPortal + 'admin/?a=mod_account_updater',

  NEXUS_HOME: baseTestNexus,

  EMAIL_SERVER: 'http://host.docker.internal:5080/'
}

/**
 * get a randomized ID that can be used for isolated test data
 * @returns string id_timestamp_####
 */
export const getRandomId = () => `id_${Date.now()}_${Math.floor(Math.random() * 10000)}`

/**
 * Sets up a promise around a specific action expected to result in a netork response.
 * @param page Page instance from test
 * @param includesString part of url from network call to wait for
 * @param callback action to take prior to awaiting promise
 * @param requestMethod http verb. GET, POST, DELETE
 */
export const awaitPromise = async (
  page: Page,
  includesString:string = '',
  callback:Function,
  requestMethod:string = '',
) => {
  const promiseToAwait = page.waitForResponse(res =>
    res.url().includes(includesString) &&
    (requestMethod === '' || res.request().method() === requestMethod) &&
    res.status() === 200
  );
  await callback(page);
  await promiseToAwait;
}

/**
 * Facilitate the selection of an option from a Chosen dropdown Plugin
 * @param page Page instance from test
 * @param dropdownID chosen dropdown DOM element ID. Include the #
 * @param dropOption the option to select
 */
export const selectChosenDropdownOption = async (page:Page, dropdownID:string, dropOption:string) => {
  const serviceDropdown = page.locator(dropdownID);
  await expect(serviceDropdown).toBeVisible();
  await serviceDropdown.click();
  await page.getByRole('option', { name: dropOption, exact: true }).click();
}

/**
 * Clear and then fill an input or textarea field with a given value.
 * NOTE: This method confirms the value but does not open modals or take any save action.
 * @param locator locator for the input field
 * @param value value to set for the input field
 */
export const fillAndVerifyField = async (locator:Locator, value:string) => {
  await expect(locator).toBeVisible();
  await locator.press('ControlOrMeta+A');
  await locator.press('Backspace');
  await locator.fill(value);
  await expect(locator).toHaveValue(value);
}


/**
 * Navigates to Form Editor and create a new form
 * @param page Page instance from test
 * @param formName
 * @param formDescription
 * @returns new form ID as string (Promise value)
 */
export const createTestForm = async (
  page:Page,
  formName:string,
  formDescription:string
):Promise<string> => {
  await page.goto(LEAF_URLS.FORM_EDITOR);
  await page.getByRole('button', { name: 'Create Form' }).click();
  await expect(page.getByRole('heading', { name: 'New Form' })).toBeVisible();
  await page.getByLabel('Form Name (up to 50').fill(formName);
  await page.getByLabel('Form Description (up to 255').fill(formDescription);
  await page.getByLabel('Form Name (up to 50').press('Tab');
  await awaitPromise(
    page, 'formEditor/new',
    async (p:Page) => await p.getByRole('button', { name: 'Save' }).click()
  );
  await expect(page.locator('#edit-properties-panel .form-id')).toBeVisible();
  const newFormID = await page.locator('#edit-properties-panel .form-id').innerText() ?? '';

  return new Promise((resolve, reject) => {
    if(newFormID !== '') {
      resolve(newFormID);
    } else {
      reject(`leaf_util createTestForm: unexpected formID value - ${newFormID}.`);
    }
  });
}


export const deleteTestFormByFormID = async (
  page:Page,
  formID:string,
) => {
  await page.goto(`${LEAF_URLS.FORM_EDITOR_FORM}${formID}`);
  await expect(page.locator('#edit-properties-panel .form-id')).toBeVisible();
  const viewFormID = await page.locator('#edit-properties-panel .form-id').innerText() ?? '';
  if (formID === viewFormID) {
    await page.getByRole('button', { name: 'Delete this Form' }).click();
    await expect(page.getByRole('heading', { name: 'Delete this Form' })).toBeVisible();
    await awaitPromise(
      page, `formStack/_${formID}`, async (p:Page) => {
        await p.getByRole('button', { name: 'Yes' }).click();
      }, 'DELETE'
    );
  }
}

/**
 * Add a question to a single page form with basic name, format and location options
 * @param page Page instance from test
 * @param sectionBtnText the text on the 'new section/add question to section' button
 * @param nameFillValue ** unique ** value for the question name
 * @param format the question format
 * @param options options for dropdown formats.  separate values with \n
 * @returns new indicator ID as string (Promise value)
 */
export const addFormQuestion = async (
  page:Page,
  sectionBtnText:string,
  nameFillValue:string,
  format:string = '',
  options:string = ''
):Promise<string> => {
  //the label text for an 'indicator name' input area is different for header questions
  const nameInputLabel = sectionBtnText === 'Add Section' ? 'Section Heading' : 'Field Name';
  await page.getByLabel(sectionBtnText).first().click();
  await expect(page.getByLabel(nameInputLabel)).toBeVisible();
  await page.getByLabel(nameInputLabel).fill(nameFillValue);
  await page.getByLabel('Input Format').selectOption(format);
  if (options !== '') {
    await page.getByRole('textbox', { name: 'Options (One option per line)' }).fill(options)
  }
  const newIndPromise = page.waitForResponse(res =>
    res.url().includes('formEditor/newIndicator') && res.status() === 200
  )
  page.getByRole('button', { name: 'Save' }).click();
  const newIndicatorRes = await newIndPromise;
  let newIndID = await newIndicatorRes.text();
  newIndID = newIndID.replaceAll('"', '');

  return new Promise((resolve, reject) => {
    if(+newIndID > 0) {
      resolve(newIndID);
    } else {
      reject(`leaf_util addFormQuestion: new question creation not successful.`);
    }
  });
}

/**
 * load a specific workflow by URL param
 * @param page Page instance from test
 * @param workflowID string
 */
export const loadWorkflow = async (page:Page, workflowID:string = '1') => {
  await awaitPromise(
    page, `workflow/${workflowID}/route`, async (p:Page) => await p.goto(
    `${LEAF_URLS.WORKFLOW_EDITOR_WF}${workflowID}`
  ));
}

/**
 * load a specific form by URL param
 * @param page Page instance from test
 * @param formID string
 */
export const loadForm = async (page:Page, formID:string = 'form_5ea07') => {
  await awaitPromise(
    page, `form/_${formID}`, async (p:Page) => await p.goto(
    `${LEAF_URLS.FORM_EDITOR_FORM}${formID}`
  ));
}

/**
 * Navigates to New Request page and creates a new request with specified info
 * @param page Page instance from test
 * @param service
 * @param requestTitel
 * @param formName
 * @returns new request ID as string (Promise value)
 */
export const createTestRequest = async (
  page:Page,
  service:string = 'AS - Service',
  requestTitel:string = 'test request',
  formName:string = 'General Form'
):Promise<string> => {
  await page.goto(LEAF_URLS.INITIAL_FORM);
  await selectChosenDropdownOption(page,'#service_chosen', service);
  await page.getByLabel('Title of Request').fill(requestTitel);
  await page.locator('label').filter({ hasText: formName }).locator('span').click();
  await awaitPromise(
    page, 'getindicator&recordID',
    async (p:Page) => await p.getByRole('button', { name: 'Click here to Proceed' }).click()
  );
  const url = page.url();
  expect(url).toContain('&recordID=');
  const newRecordID = url.match(/(?<=&recordID\=)\d+$/)?.[0] ?? '';

  return new Promise((resolve, reject) => {
    if(+newRecordID > 0) {
      resolve(newRecordID);
    } else {
      reject(`leaf_util createTestRequest: test request creation did not complete.`);
    }
  });
}

/**
 * @param page 
 * @param requestID 
 */
export const deleteTestRequestByRequestID = async (page:Page, requestID:string) => {
  await page.goto(`${LEAF_URLS.PRINTVIEW_REQUEST}${requestID}`);
  await expect(page.getByRole('button', { name: 'Cancel Request' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel Request' }).click();
  await page.getByPlaceholder('Enter Comment').fill('No longer needed');
  await page.getByRole('button', { name: 'Yes' }).click();
  await expect(page.locator('#bodyarea')).toContainText('has been cancelled!');
}

/**
 * Confirm an email with the given subject is present once and confirm recipients
 * @param page Page instance from test
 * @param emailSubjectText the text in the email's subject field, used to find the email
 * @param expectedEmailRecipients array of email addresses that should be found as recipients
 */
export const confirmEmailRecipients = async (
  page:Page,
  emailSubjectText:string,
  expectedEmailRecipients:Array<string>
) => {
  const row = page.locator(`tr:has-text("${emailSubjectText}")`);
  await expect(
    row, `one email with subject ${emailSubjectText} to be found`
  ).toHaveCount(1);

  const recipientEls = row.locator('.el-table_1_column_3 strong');
  for (let i = 0; i < expectedEmailRecipients.length; i++) {
    await expect(
      recipientEls.filter({ hasText: expectedEmailRecipients[i] }),
      `email recipient ${expectedEmailRecipients[i]} to be present once`
    ).toHaveCount(1);
  }
}


/**
 * Create a new basic workflow: requestor -submit-> intialstep.  No other config.
 * @param page Page instance from test
 * @param workflowName unique workflow name
 * @param intialStepName unique workflow step name
 * @returns new workflow ID and initial stepID as array (Promise value)
 *
 * Promised values can be set and used by destructuring:
 * const [ newWorkflowID, initialStepID ] = await createBaseTestWorkflow(page, wfTitle, stTitle);
 * console.log(newWorkflowID, initialStepID);
 */
export const createBaseTestWorkflow = async (
  page:Page,
  workflowName:string,
  intialStepName:string
):Promise<string[]> => {
  await page.goto(LEAF_URLS.WORKFLOW_EDITOR);
  await expect(page.getByRole('button', { name: 'New Workflow' })).toBeVisible();
  await page.getByRole('button', { name: 'New Workflow' }).click();
  await expect(page.getByText('Create new workflow')).toBeVisible();
  await page.getByRole('textbox', { name: 'Workflow Title:' }).fill(workflowName);
  let awaitSave = page.waitForResponse(res =>
    res.url().includes('/workflow/new') && res.status() === 200
  );
  await page.getByRole('button', { name: 'Save' }).click();
  const newWorkflowRes = await awaitSave;
  let newWorkflowID = await newWorkflowRes.text() ?? '';
  newWorkflowID = newWorkflowID.replaceAll('"', '');

  //Create new Step and move it
  await page.getByRole('button', { name: 'New Step' }).click();
  await expect(page.getByText('Create new Step')).toBeVisible();
  await page.getByRole('textbox', { name: 'Step Title:' }).fill(intialStepName);
  awaitSave = page.waitForResponse(res =>
    res.url().includes(`workflow/${newWorkflowID}/step`) && res.status() === 200
  );
  await page.getByRole('button', { name: 'Save' }).click();
  const newStepRes = await awaitSave;
  let newStepID = await newStepRes.text() ?? '';
  newStepID = newStepID.replaceAll('"', '');

  const stepElement = page.getByLabel(`workflow step: ${intialStepName}`, { exact: true });
  await expect(stepElement).toBeInViewport();
  await page.reload();
  await stepElement.hover();
  await page.mouse.down();
  await page.mouse.move(400, 300);
  await page.mouse.up();

  //set the requestor -> step submit route
  await page.getByRole('button', { name: 'workflow step: Requestor' }).click();
  await page.getByLabel('View Step Actions').click();
  await expect(page.getByLabel('Add Action:')).toBeVisible();
  await page.locator('#create_route:visible').selectOption(newStepID);
  await page.reload();

  return new Promise((resolve, reject) => {
    if(+newWorkflowID > 0 && +newStepID > 0) {
      resolve([ newWorkflowID, newStepID ]);
    } else {
      reject(`leaf_util createBaseTestWorkflow: workflow setup did not complete. wfID:${newWorkflowID} stepID:${newStepID}`);
    }
  });
}

/**
 * Deletes a Workflow Event and asserts that it is not present in the Event List after deletion
 * @param page Page instance from test
 * @param eventNameInput the event name **as it appears in the Create/Edit Event modal input field**
 * @param eventDescription
 */
export const deleteWorkflowEvent = async (
  page:Page,
  eventNameInput:string,
  eventDescription:string
) => {
  let awaitEvents = page.waitForResponse(res => res.url().includes('customEvents') && res.status() === 200);
  await page.getByRole('button', { name: 'Edit Events' }).click();
  await awaitEvents;

  await expect(page.getByRole('heading', { name: 'List of Events' })).toBeVisible();
  await page
    .locator(`#editor_CustomEvent_${eventNameInput}`)
    .getByRole(`button`, {name:`Delete`}).click();
  await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();

  const awaitDel = page.waitForResponse(res =>
    res.url().includes(eventNameInput) &&
    res.request().method() === 'DELETE' &&
    res.status() === 200
  );
  awaitEvents = page.waitForResponse(res => res.url().includes('customEvents') && res.status() === 200);
  await page.getByRole('button', { name: 'Yes' }).click();
  await awaitDel;
  await awaitEvents;

  const table = page.locator("#events");
  await expect(table).toBeVisible();
  await expect(
    table.getByText(eventNameInput.replace(/_+/g, " "), { exact: true }),
    'deleted event name not to be present in Event List'
  ).toHaveCount(0);
  await expect(
    table.getByText(eventDescription, { exact: true }),
    'deleted event desription not to be present in Event List'
  ).toHaveCount(0);
}


// Docker-optimized waiting function (from primer) for debugging
export const dockerWait = async (page: any, extraBuffer: number = 1000) => {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(extraBuffer);
}