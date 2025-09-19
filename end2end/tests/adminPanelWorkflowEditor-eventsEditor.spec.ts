import { test, expect, Page, Locator } from '@playwright/test';

test.describe.configure({ mode: 'default' });

/**
 * @param page Page instance from test
 * @param includesString part of url from network call to wait for
 * @param callback action to take prior to awaiting promise
 * @param requestMethod http verb. GET, POST, DELETE
 */
const awaitPromise = async (
  page: Page,
  includesString:string = '',
  callback:Function,
  requestMethod:string = 'GET',
) => {
  const promiseToAwait = page.waitForResponse(res =>
    res.url().includes(includesString) &&
    res.request().method() === requestMethod &&
    res.status() === 200
  );
  await callback(page);
  await promiseToAwait;
}

/**
 * @param page Page instance from test
 * @param emailSubjectText the text in the email's subject field, used to find the email
 * @param expectedEmailRecipients array of email addresses that should be found as recipients
 */
const confirmEmailRecipients = async (
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
 * load a specific workflow by URL param
 * @param page Page instance from test
 * @param workflowID string - workflowID
 */
const loadWorkflow = async (page:Page, workflowID:string = '1') => {
  const promiseToAwait = page.waitForResponse(res =>
    res.url().includes(`workflow/${workflowID}/route`) &&
    res.status() === 200
  );
  await page.goto(`https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=${workflowID}`)
  await promiseToAwait;
}

/**
 * Deletes a Workflow Event and asserts that it is not present in the Event List after deletion
 * @param page Page instance from test
 * @param eventNameInput the event name **as it appears in the Create/Edit Event modal input field**
 * @param eventDescription
 */
const deleteWorkflowEvent = async (
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

/**
 * Use the printview admin menu to change the step of a request
 * @param page Page instance from test
 * @param requestID request id as string value 
 * @param newStep new step, in format 'form name: step name'
 */
const printAdminMenuChangeStep = async (page:Page, requestID:string, newStep:string) => {
  const awaitPage = page.waitForResponse(res => res.url().includes('lastActionSummary') && res.status() === 200);
  await page.goto(`https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=${requestID}`);
  await awaitPage;

  const awaitSteps = page.waitForResponse(res => res.url().includes('steps') && res.status() === 200);
  await page.getByRole('button', { name: 'Change Current Step' } ).click();
  await awaitSteps;

  const dialog = page.getByRole('dialog', { name: 'Change Step' });
  await expect(dialog.locator('div[id$="_loadIndicator"]')).toBeHidden();
  await dialog.locator('#changeStep a.chosen-single').click();
  await dialog.getByRole('option', { name: newStep }).click();

  await dialog.getByRole('button', { name: 'Save Change' }).click();
}

// Global Variables
const requestId = '123'; //test case request
const requestURL = `https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=${requestId}`;
const randNum = Date.now(); //timestamp. unique but shorter than random - name is limited to 25 chars
const eventGroupID = '206';

const uniqueEventName = `Event ${randNum}`;
const uniqueDescr = `Description ${randNum}`;
const uniqueEventName2 = `Event2 ${randNum}`;
const uniqueDescr2 = `Description2 ${randNum}`;
const uniqueEventNameEdit = `Evt Edit ${randNum}`;
const uniqueDescrEdit = `Descr Edit ${randNum}`;

test('Create and add a new Event from a workflow action', async ({ page}) => {
  await loadWorkflow(page);
  await expect(page.getByText('Return to Requestor')).toBeVisible();
  await awaitPromise(page, "events", async (p:Page) => {
    await p.getByText('Return to Requestor').click();
  });

  await expect(page.getByRole('button', { name: 'Add Event' })).toBeVisible();
  await awaitPromise(page, "events", async (p:Page) => {
    await p.getByRole('button', { name: 'Add Event' }).click();
  });

  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  await awaitPromise(page, "groups", async (p:Page) => {
    await p.getByRole('button', { name: 'Create Event' }).click();
  });

  await page.getByLabel('Event Name:').pressSequentially(uniqueEventName);
  expect(
    await page.getByLabel('Event Name:').inputValue(),
    'chars other than A-Z, 0-9 to be replaced with underscores'
  ).toBe(uniqueEventName.replace(/[^a-z0-9]/gi, '_'));

  await page.getByLabel('Short Description:').fill(uniqueDescr);
  await page.getByLabel('Notify Requestor Email:', { exact: true }).check();
  await page.getByLabel('Notify Next Approver Email:', { exact: true }).check();
  await page.getByLabel('Notify Group:', { exact: true }).selectOption(eventGroupID);

  await awaitPromise(page, "events", async (p:Page) => {
    await p.getByRole('button', { name: 'Save' }).click();
  });

  await expect(
    page.getByText(`Email - ${uniqueDescr}`),
    'event created through the workflow action to be present and in the viewport'
  ).toBeInViewport();
});

test('Create a new Event from page Side Menu', async ({ page }) => {
  await loadWorkflow(page);
  await expect(page.getByRole('button', { name: 'Edit Events' })).toBeVisible();
  await awaitPromise(page, "customEvents", async (p:Page) => {
    await p.getByRole('button', { name: 'Edit Events' }).click();
  });

  await expect(page.getByRole('button', { name: 'Create a new Event' })).toBeVisible();
  await awaitPromise(page, "groups", async (p:Page) => {
    await p.getByRole('button', { name: 'Create a new Event' }).click();
  });

  await page.getByLabel('Event Name:').pressSequentially(uniqueEventName2);
  const expectedInputValue = uniqueEventName2.replace(/[^a-z0-9]/gi, '_');
  expect(
    await page.getByLabel('Event Name:').inputValue(), 'chars other than A-Z, 0-9 to be replaced with underscores'
  ).toBe(expectedInputValue);

  await page.getByLabel('Short Description:').fill(uniqueDescr2);
  await page.getByLabel('Notify Requestor Email:', { exact: true }).check();
  await page.getByLabel('Notify Next Approver Email:', { exact: true }).check();
  await page.getByLabel('Notify Group:', { exact: true }).selectOption(eventGroupID);
  await awaitPromise(page, "customEvents", async (p:Page) => {
    await p.getByRole('button', { name: 'Save' }).click();
  });

  await expect(page.getByRole('heading', { name: 'List of Events' })).toBeVisible();
  const table = page.locator("#events");
  await expect(table).toBeVisible();

  const eventDisplayName = expectedInputValue.replace(/_+/g, " ");
  await expect(
    table.getByText(eventDisplayName, { exact: true }),
    'new event name, with underscores replaced with spaces, to be present once in Event List'
  ).toHaveCount(1);
  await expect(
    table.getByText(uniqueDescr2, { exact: true }),
    'new event desription to be present once in Event List'
  ).toHaveCount(1);
});

//add and then remove uniqueEventName/uniqueDescr from workflow
test.describe('Existing events can be added and removed from workflows', () => {
  const eventTitle = `Email - ${uniqueDescr}`;

  test(`An existing event can be added to a Workflow Action`, async ({ page }) => {
    await loadWorkflow(page);
    await awaitPromise(page, "events", async (p:Page) => {
      await p.locator('#jsPlumb_1_51').click();
    });
    await awaitPromise(page, "workflow/events", async (p:Page) => {
      await p.getByRole('button', { name: 'Add Event' }).click();
    });

    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();

    await page.getByLabel('Add Event').locator('a').click();
    await page.getByRole('option', { name: eventTitle }).click();
    await awaitPromise(page, "events", async (p:Page) => {
      await p.getByRole('button', { name: 'Save' }).click();
    });

    await expect(
      page.getByText(eventTitle),
      'selected event to have been added and to be in the viewport'
    ).toBeInViewport();
  });

  test('An event can be removed from a Workflow Action', async ({ page }) => {
    await loadWorkflow(page);
    await awaitPromise(page, "events", async (p:Page) => {
      await p.locator('#jsPlumb_1_51').click();
    });

    const eventsLi = page.locator('#stepInfo_2 li').filter({ hasText: eventTitle });
    await expect(eventsLi, 'to be present once in the list of triggered events').toHaveCount(1);

    await eventsLi.getByRole('button', { name: 'Remove Event' }).click();
    await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
    await awaitPromise(page, `events`, async (p:Page) => {
      await p.getByRole('button', { name: 'Yes' }).click();
    }, 'DELETE');

    await loadWorkflow(page);
    await awaitPromise(page, "events", async (p:Page) => {
      await p.locator('#jsPlumb_1_51').click();
    });

    await expect(
      page.locator('#stepInfo_3 li').filter({ hasText: eventTitle }),
      'not to be in the list of triggered events'
    ).toHaveCount(0);
  });
});


test('A duplicate Event Name is not allowed', async ({ page }) => {
  await loadWorkflow(page);
  await awaitPromise(page, "customEvents", async (p:Page) => {
    await p.getByRole('button', { name: 'Edit Events' }).click();
  });
  await expect(page.getByRole('button', { name: 'Create a new Event' })).toBeVisible();
 
  await awaitPromise(page, "groups", async (p:Page) => {
    await p.getByRole('button', { name: 'Create a new Event' }).click();
  });

  await page.getByLabel('Event Name:').pressSequentially(uniqueEventName);
  await page.getByLabel('Short Description: Notify').fill('test ' + uniqueDescr);

  const expectedAlertMsg = `Event name already exists.`
  page.on('dialog', async (dialog) => {
    expect(dialog.type(), 'dialog type to be alert').toBe('alert');
    expect(
      dialog.message(), `alert content to be: ${expectedAlertMsg}`
    ).toBe(expectedAlertMsg);
    await dialog.accept();
  });

  const alertPromise = page.waitForEvent('dialog');
  await page.getByRole('button', { name: 'Save' }).click();
  await alertPromise;
});

test('A Duplicate Event Description is not allowed', async ({ page }) => {
  await loadWorkflow(page);
  await awaitPromise(page, "customEvents", async (p:Page) => {
    await p.getByRole('button', { name: 'Edit Events' }).click();
  });
  await expect(page.getByRole('button', { name: 'Create a new Event' })).toBeVisible();

  await awaitPromise(page, "groups", async (p:Page) => {
    await p.getByRole('button', { name: 'Create a new Event' }).click();
  });

  await page.getByLabel('Event Name:').pressSequentially('test ' + uniqueEventName);
  await page.getByLabel('Short Description:').fill(uniqueDescr);

  const expectedAlertMsg = `This description has already been used, please use another one.`;
  page.on('dialog', async (dialog) => {
    expect(dialog.type(), 'dialog type to be alert').toBe('alert');
    expect(
      dialog.message(), `alert content to be: ${expectedAlertMsg}`
    ).toBe(expectedAlertMsg);
    await dialog.accept();
  });

  const alertPromise = page.waitForEvent('dialog');
  await page.getByRole('button', { name: 'Save' }).click();
  await alertPromise;
});


//edit and then deletes uniqueEventName2
test.describe('Events can be edited and deleted', () => {
  const initialExpectedValue = uniqueEventName2.replace(/[^a-z0-9]/gi, '_');

  const expectedEditedInputValue = uniqueEventNameEdit.replace(/[^a-z0-9]/gi, '_');
  const expectedEventDisplayName = expectedEditedInputValue.replace(/_+/g, " ");

  test('Workflow Event can be edited', async ({ page }) => {
    await loadWorkflow(page);
    await awaitPromise(page, "customEvents", async (p:Page) => {
      await p.getByRole('button', { name: 'Edit Events' }).click();
    });

    await expect(page.getByRole('heading', { name: 'List of Events' })).toBeVisible();

    await awaitPromise(page, `_CustomEvent_${initialExpectedValue}`, async (p:Page) => {
      await p
        .locator(`#editor_CustomEvent_${initialExpectedValue}`)
        .getByRole(`button`, { name:`Edit` }).click();
    });

    await page.getByLabel('Event Name:').fill('');
    await page.getByLabel('Event Name:').pressSequentially(uniqueEventNameEdit);
    expect(
      await page.getByLabel('Event Name:').inputValue(),
      'chars other than A-Z, 0-9 to be replaced with underscores'
    ).toBe(expectedEditedInputValue);

    await page.getByLabel('Short Description:').fill(uniqueDescrEdit);
    await page.getByLabel('Notify Requestor Email:').check();
    await page.getByLabel('Notify Next Approver Email:').check();
    await page.getByLabel('Notify Group:').selectOption(eventGroupID);

    await awaitPromise(page, "workflow/customEvents", async (p:Page) => {
      await p.getByRole('button', { name: 'Save' }).click();
    });

    await expect(page.getByRole('heading', { name: 'List of Events' })).toBeVisible();
    const table = page.locator("#events");
    await expect(table).toBeVisible();
    await expect(
      table.getByText(expectedEventDisplayName, { exact: true }),
      'edited event name, with underscores replaced with spaces, to be present once in Event List'
    ).toHaveCount(1);
    await expect(
      table.getByText(uniqueDescrEdit, { exact: true }),
      'edited event desription to be present once in Event List'
    ).toHaveCount(1);
  });

  test('Workflow Event can be deleted', async ({ page }) => {
    await loadWorkflow(page);
    await deleteWorkflowEvent(page, expectedEditedInputValue, uniqueDescrEdit);
  });
});

//uses uniqueEventName/uniqueDescr, still on return to requestor, to test email editor and group emails
test.describe('Custom Email Event, custom template and emailing verification', () => {
  const groupDisplayName = '2911 TEST Group';
  const subjectText = `${groupDisplayName} email ${uniqueEventName}`;
  const directEmailTo = 'test4892.to@fake.com';
  const directEmailCC = 'test4892.cc@fake.com';
  const emailTo = '{{$field.50}}\n' + directEmailTo;
  const emailCC = '{{$field.53}}\n' + directEmailCC;
  const bodyContent = 
    '<p>request fields</p>\n' +
    '<div id="format_grid">{{$field.48}} checking</div>';

  const expectedToFieldEmailRecipients = [
    'Roman.Abbott@fake-email.com', //direct groupId 202 members
    'Morton.Anderson@fake-email.com',
    'Loyd.Cartwright10@fake-email.com',
    'Booker.Feeney@fake-email.com',
    directEmailTo
  ];
  const expectedCcFieldEmailRecipients = [
    'Allen.Corwin@fake-email.com', //direct groupId 97 members
    'Cory.Hartmann@fake-email.com',
    'Roger.Kirlin@fake-email.com',
    'Cecille.Maggio@fake-email.com',
    directEmailCC
  ];
  const expectedEventEmailRecipients = [
    'Donte.Glover@fake-email.com', //notify group 206 is on the event itself
    'tester.tester@fake-email.com' //notify requetor is on the event itself
  ];

  test('Customize Email Template content and trigger event', async({page}) => {
    await loadWorkflow(page);
    await awaitPromise(page, "customEvents", async (p:Page) => {
      await p.getByRole('button', { name: 'Edit Events' }).click();
    });
    await expect(page.getByRole('button', { name: 'Create a new Event' })).toBeVisible();

    const idValue = "#editor_CustomEvent_" + uniqueEventName.replace(/[^a-z0-9]/gi, '_');
    await page.locator(idValue).getByRole('button', { name: 'Edit' }).click();

    const editorPromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Email Template Editor' }).click();
    const editorPage = await editorPromise;

    const filePromise = editorPage.waitForResponse(res =>
      res.url().includes(`workflow/customEvents`) && res.status() === 200
    );
    //NOTE: might need update role from 'button' to 'link'
    await expect(
      editorPage.getByRole('button', { name: uniqueDescr, exact: true }),
      'event description to be present in custom events list'
    ).toBeVisible();
    await editorPage.getByRole('button', { name: uniqueDescr, exact: true }).click();
    await filePromise;

    await expect(
      editorPage.getByRole('heading', { name: uniqueDescr }),
      'Event in Email Template Editor to be successfully accessed from the Edit Events modal'
    ).toBeVisible();
    await expect(editorPage.getByRole('textbox', { name: 'Email To:' })).toBeVisible();
    await editorPage.getByRole('textbox', { name: 'Email To:' }).fill(emailTo);
    await editorPage.getByRole('textbox', { name: 'Email CC:' }).fill(emailCC);

    let subjectArea = editorPage
      .locator('#divSubject')
      .getByLabel('Template Editor coding area.');
    await subjectArea.press('ControlOrMeta+A');
    await subjectArea.press('Backspace');
    await subjectArea.fill(subjectText);

    await editorPage.getByRole('button', { name: 'Use Code Editor' }).click();
    
    let bodyArea = editorPage
      .locator('#code_mirror_template_editor');
    await bodyArea.press('ControlOrMeta+A');
    await bodyArea.press('Backspace');
    await bodyArea.fill(bodyContent); 
       
    await editorPage.getByRole('button', { name: 'Save Changes' }).click();

    //Trigger event with Return to Requestor workflow action
    await page.goto(requestURL);
    await page.waitForLoadState('load');
    await expect(page.getByRole('button', { name: 'Return to Requestor' })).toBeVisible();
    await page.getByRole('button', { name: 'Return to Requestor' }).click();
  });

  test('Verify email sent, email recipients (To/Cc/notify), and email field content)', async({page}) => {
    await page.goto('http://host.docker.internal:5080/');
    await page.waitForLoadState('load');
    await confirmEmailRecipients(page, subjectText, expectedToFieldEmailRecipients);
    await confirmEmailRecipients(page, subjectText, expectedCcFieldEmailRecipients);
    await confirmEmailRecipients(page, subjectText, expectedEventEmailRecipients);

    await page.getByText(subjectText).first().click();
       
    const gridLocator = page.locator('iframe').contentFrame();
    await expect(
       gridLocator.getByRole('table'),
    'The Grid is present'
     ).toBeVisible();
    
     const rowCount = await gridLocator.locator('tr').count();
    console.log(`Number of rows in the table: ${rowCount}`);

    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(subjectText).first()).not.toBeVisible();

    await page.getByText(`RETURNED: Test Email Events (#${requestId}) to`).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(`RETURNED: Test Email Events (#${requestId}) to`).first()).not.toBeVisible();

    //resubmit request and move it back to 'Requestor Followup' step
    await page.goto(requestURL);
    await expect(page.getByRole('button', { name: 'Re-Submit Request' })).toBeVisible();
    await awaitPromise(page, 'lastActionSummary', async (p:Page) => {
      await p.getByRole('button', { name: 'Re-Submit Request' }).click();
    });
    await printAdminMenuChangeStep(page, requestId, 'General Workflow: Requestor Followup');
  });
});

/* POST RUN CLEANUP */
test('Clean up Workflow Test Data', async({page}) => {
  await loadWorkflow(page);
  await deleteWorkflowEvent(page, uniqueEventName.replace(/[^a-z0-9]/gi, '_'), uniqueDescr);
});