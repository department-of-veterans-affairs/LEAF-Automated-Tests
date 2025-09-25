import { Page, expect } from '@playwright/test';


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
 * Create a new form in the Form Editor
 * @param page Page instance from test
 * @param formName 
 * @param formDescription 
 */
export const createTestForm = async (page:Page, formName:string, formDescription:string) => {
  await page.getByRole('button', { name: 'Create Form' }).click();
  await expect(page.getByRole('heading', { name: 'New Form' })).toBeVisible();
  await page.getByLabel('Form Name (up to 50').fill(formName);
  await page.getByLabel('Form Description (up to 255').fill(formDescription);
  await page.getByLabel('Form Name (up to 50').press('Tab');
  await awaitPromise(
    page, 'formEditor/new',
    async (p:Page) => p.getByRole('button', { name: 'Save' }).click()
  );
}


/**
 * Add a question to a form with basic name, format and location options
 * @param page Page instance from test
 * @param sectionBtnText the text on the 'new section/add question to section' button
 * @param nameFillValue the value for the question name
 * @param format the question format
 * @param parentID optional parent question ID
 */
export const addFormQuestion = async (
  page:Page,
  sectionBtnText:string,
  nameFillValue:string,
  format:string,
  parentID:string = ''
) => {
  const nameInputLabel = sectionBtnText === 'Add Section' ? 'Section Heading' : 'Field Name';
  if(+parentID > 0 && Number.isInteger(+parentID)) {
    await page.locator(`#index_listing_${parentID}`, { hasText: sectionBtnText }).click();
  } else {
    await page.getByLabel(sectionBtnText).click();
  }
  await expect(page.getByLabel(nameInputLabel)).toBeVisible();
  await page.getByLabel(nameInputLabel).fill(nameFillValue);
  await page.getByLabel('Input Format').selectOption(format);
  await awaitPromise(page, 'formEditor/newIndicator',
    async (p:Page) => p.getByRole('button', { name: 'Save' }).click()
  );
}


/**
 * load a specific workflow by URL param
 * @param page Page instance from test
 * @param workflowID string
 */
export const loadWorkflow = async (page:Page, workflowID:string = '1') => {
  await awaitPromise(
    page, `workflow/${workflowID}/route`, async (p:Page) => await p.goto(
    `https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=${workflowID}`
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
    `https://host.docker.internal/Test_Request_Portal/admin/?a=form_vue#/forms?formID=${formID}`
  ));
}

/**
 * 
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
  await page.goto('https://host.docker.internal/Test_Request_Portal/?a=newform');
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
  return new Promise(resolve => resolve(newRecordID));
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