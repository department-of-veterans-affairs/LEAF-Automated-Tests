import { test, expect, Page, Locator } from '@playwright/test';

test.describe.configure({ mode: 'default' });

/**
 * @param page Page instance from test
 * @param includesString part of url from network call to wait for
 * @param callback action to take prior to awaiting promise
 * @param requestMethod http verb. GET, POST, DELETE
 */
async function awaitPromise(
  page: Page,
  includesString:string = '',
  callback:Function,
  requestMethod:string = 'GET',
) {
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
 * @param emailSubjectText the text in the email's subject field
 * @param expectedEmailRecipients array of email addresses that should be found
 */
async function confirmEmailRecipients(page:Page, emailSubjectText:string, expectedEmailRecipients:Array<string>) {
    //Confirm that email with given subject exists and that each expected email address is present once.
    //Other addresses can be present because of backup relations - this is not being tested here.
    await expect(page.getByText(emailSubjectText)).toHaveCount(1);
    const row = page.locator(`tr:has-text("${emailSubjectText}")`);
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
 * Use the printview admin menu to change the step of a request
 * @param page Page instance from test
 * @param requestID request id as string value 
 * @param newStep new step, in format 'form name: step name'
 */
const printAdminMenuChangeStep = async (page:Page, requestID:string, newStep:string) => {
  await page.goto(`https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=${requestID}`);
  await page.waitForLoadState('load');
  await awaitPromise(page, 'steps', async (p:Page) => {
    await p.getByRole('button', { name: 'Change Current Step' } ).click();
  });
  const dialog = page.getByRole('dialog', { name: 'Change Step' });
  await expect(dialog.locator('div[id$="_loadIndicator"]')).toBeHidden();
  await dialog.locator('#changeStep a.chosen-single').click();
  await dialog.getByRole('option', { name: newStep }).click();

  await dialog.getByRole('button', { name: 'Save Change' }).click();
  await page.waitForLoadState('load');
}

// Global Variables
const requestId = '123'; //test case request
const requestURL = `https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=${requestId}`;
const randNum = Date.now(); //timestamp. unique but shorter than random - name is limited to 25 chars

const uniqueEventName = `Event ${randNum}`;
const uniqueDescr = `Description ${randNum}`;
const uniqueEventName2 = `Event2 ${randNum}`;
const uniqueDescr2 = `Description2 ${randNum}`;
const uniqueEventNameEdit = `Evt Edit ${randNum}`;
const uniqueDescrEdit = `Descr Edit ${randNum}`;

test.only('Create and add a New Event from a workflow action', async ({ page}) => {
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
    await page.getByLabel('Event Name:').inputValue(), 'regex /[^a-z0-9]/gi to be applied to event name'
  ).toBe(uniqueEventName.replace(/[^a-z0-9]/gi, '_'));

  await page.getByLabel('Short Description:').fill(uniqueDescr);
  await page.getByLabel('Notify Requestor Email:', { exact: true }).check();
  await page.getByLabel('Notify Next Approver Email:', { exact: true }).check();
  await page.getByLabel('Notify Group:', { exact: true }).selectOption('206');

  await awaitPromise(page, "events", async (p:Page) => {
    await p.getByRole('button', { name: 'Save' }).click();
  });

  await expect(
    page.getByText(`Email - ${uniqueDescr}`),
    'event created through the workflow action to have been added to the action and to be in the viewport'
  ).toBeInViewport();
});

test.only('Create a New Event from Side Menu', async ({ page }) => {
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
    await page.getByLabel('Event Name:').inputValue(), 'regex /[^a-z0-9]/gi to be applied to event name'
  ).toBe(expectedInputValue);

  await page.getByLabel('Short Description:').fill(uniqueDescr2);
  await page.getByLabel('Notify Requestor Email:', { exact: true }).check();
  await page.getByLabel('Notify Next Approver Email:', { exact: true }).check();
  await page.getByLabel('Notify Group:', { exact: true }).selectOption('206');
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

  test.only(`event can be added to a Workflow Action`, async ({ page }) => {
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

  test.only('event can be removed from a Workflow Action', async ({ page }) => {
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


test.only('Verify Duplicate Event Name is not Allowed', async ({ page }) => {
  await loadWorkflow(page);
  await awaitPromise(page, "customEvents", async (p:Page) => {
    await p.getByRole('button', { name: 'Edit Events' }).click();
  });
  await expect(page.getByRole('button', { name: 'Create a new Event' })).toBeVisible();
 
  await awaitPromise(page, "groups", async (p:Page) => {
    await p.getByRole('button', { name: 'Create a new Event' }).click();
  });
  //fill and attempt to save a duplicate name
  await page.getByLabel('Event Name:').pressSequentially(uniqueEventName);
  await page.getByLabel('Short Description: Notify').fill('test ' + uniqueDescr);

  const expectedAlertMsg = `Event name already exists.`
  page.on('dialog', async (dialog) => {
    expect(dialog.type(), 'dialog type to be alert').toBe('alert');
    expect(
      dialog.message(), `alert dialog content to be: ${expectedAlertMsg}`
    ).toBe(expectedAlertMsg);
    await dialog.accept();
  });

  const alertPromise = page.waitForEvent('dialog');
  await page.getByRole('button', { name: 'Save' }).click();
  await alertPromise;
});

test.only('Verify Duplicate Event Description is not Allowed', async ({ page }) => {
  await loadWorkflow(page);
  await awaitPromise(page, "customEvents", async (p:Page) => {
    await p.getByRole('button', { name: 'Edit Events' }).click();
  });
  await expect(page.getByRole('button', { name: 'Create a new Event' })).toBeVisible();

  await awaitPromise(page, "groups", async (p:Page) => {
    await p.getByRole('button', { name: 'Create a new Event' }).click();
  });
  //fill and attempt to save a duplicate description
  await page.getByLabel('Event Name:').pressSequentially('test ' + uniqueEventName);
  await page.getByLabel('Short Description:').fill(uniqueDescr);

  const expectedAlertMsg = `This description has already been used, please use another one.`;
  page.on('dialog', async (dialog) => {
    expect(dialog.type(), 'dialog type to be alert').toBe('alert');
    expect(
      dialog.message(), `alert dialog content to be: ${expectedAlertMsg}`
    ).toBe(expectedAlertMsg);
    await dialog.accept();
  });

  const alertPromise = page.waitForEvent('dialog');
  await page.getByRole('button', { name: 'Save' }).click();
  await alertPromise;
});


//edits and then deletes uniqueEventName2
test.describe('Events can be edited and deleted', () => {
  const initialExpectedValue = uniqueEventName2.replace(/[^a-z0-9]/gi, '_');

  const expectedInputValue = uniqueEventNameEdit.replace(/[^a-z0-9]/gi, '_');
  const expectedEventDisplayName = expectedInputValue.replace(/_+/g, " ");

  test.only('Workflow Event can be edited', async ({ page }) => {
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
      await page.getByLabel('Event Name:').inputValue(), 'regex /[^a-z0-9]/gi to be applied to event name'
    ).toBe(expectedInputValue);
    await page.getByLabel('Short Description:').fill(uniqueDescrEdit);
    await page.getByLabel('Notify Requestor Email:').check();
    await page.getByLabel('Notify Next Approver Email:').check();
    await page.getByLabel('Notify Group:').selectOption('206');

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

  test.only('Workflow Event can be deleted', async ({ page }) => {
    await loadWorkflow(page);
    await awaitPromise(page, "customEvents", async (p:Page) => {
      await p.getByRole('button', { name: 'Edit Events' }).click();
    });

    await expect(page.getByRole('heading', { name: 'List of Events' })).toBeVisible();

    await page
      .locator(`#editor_CustomEvent_${expectedInputValue}`)
      .getByRole(`button`, {name:`Delete`}).click();

    await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
    await awaitPromise(page, "workflow/customEvents", async (p:Page) => {
      await p.getByRole('button', { name: 'Yes' }).click();
    });

    await expect(page.getByRole('heading', { name: 'List of Events' })).toBeVisible();
    const table = page.locator("#events");
    await expect(table).toBeVisible();
    await expect(
      table.getByText(expectedEventDisplayName, { exact: true }),
      'edited event name, with underscores replaced with spaces, not to be present in Event List'
    ).toHaveCount(0);
    await expect(
      table.getByText(uniqueDescrEdit, { exact: true }),
      'edited event desription not to be present in Event List'
    ).toHaveCount(0);
  });
});


//uses uniqueEventName/uniqueDescr still on return to requestor to test email editor and group emails
test.describe('Email events can be used to send or CC based on orgchart_group request data (LEAF 4892)', () => {
  const groupId = 'group#202';
  const groupDisplayName = '2911 TEST Group';
  const subjectText = `${groupDisplayName} email ${uniqueEventName}`;
  const directEmailToCc = 'test4892@fake.com';

  const expectedEmailRecipients = [ //direct groups members only, and hardcoded test email
    'Roman.Abbott@fake-email.com',
    'Morton.Anderson@fake-email.com',
    'Loyd.Cartwright10@fake-email.com',
    'Booker.Feeney@fake-email.com',
    directEmailToCc
  ]

  test.only('Add group from template variable to Email Template To', async({page}) => {
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
    //NOTE: might need update to 'link'
    await editorPage.getByRole('button', { name: uniqueDescr, exact: true }).click();
    await filePromise;

    await expect(
      editorPage.getByRole('heading', { name: uniqueDescr }),
      'Event in Email Template Editor to be successfully accessed from the Edit Events modal'
    ).toBeVisible();
    await expect(editorPage.getByRole('textbox', { name: 'Email To:' })).toBeVisible();
    await editorPage.getByRole('textbox', { name: 'Email To:' }).fill('{{$field.9}}\n' + directEmailToCc);

    let subjectArea = editorPage
      .locator('#divSubject')
      .getByLabel('Template Editor coding area.')

    await subjectArea.press('ControlOrMeta+A');
    await subjectArea.press('Backspace');
    await subjectArea.fill(subjectText);

    await editorPage.getByRole('button', { name: 'Save Changes' }).click();
    await editorPage.waitForLoadState('load');
  });

  test.only('Trigger event with email recipient based on request orgchart_group data', async({page}) => {
    await page.goto(requestURL);
    await page.waitForLoadState('load');

    //Add Group value to Page 3 indicator 9
    await page.locator("#PHindicator_9_1 button").click();

    const dialog = page.getByRole('dialog', { name: 'Editing #' });
    await expect(dialog.locator('div[id$="_loadIndicator"]')).toBeHidden();

    await dialog.getByRole('searchbox', { name: 'Search for user to add as' }).fill(groupId);
    await dialog.getByRole('cell', { name: groupDisplayName }).click();

    await expect(page.getByRole('searchbox', { name: 'Search for user to add as' })).toHaveValue(groupId);

    await awaitPromise(page, 'getprintindicator', async (d:Locator) => {
      await d.getByRole('button', { name: 'Save Change' }).click();
    });

    //Trigger event with Return to Requestor workflow action
    await expect(page.getByRole('button', { name: 'Return to Requestor' })).toBeVisible();
    await page.getByRole('button', { name: 'Return to Requestor' }).click();
  });


  test.only('Verify Email Sent (To)', async({page}) =>{
    await page.goto('http://host.docker.internal:5080/');
    await page.waitForLoadState('load');
    await confirmEmailRecipients(page, subjectText, expectedEmailRecipients)

    //Cleanup the inbox
    await page.getByText(subjectText).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByText(`RETURNED: General Form (#${requestId}) to`).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();

    //goto request, resubmit and move it back to 'Requestor Followup' to test Cc field
    await page.goto(requestURL);
    await page.waitForLoadState('load');
    await awaitPromise(page, 'currentStep', async (p:Page) => {
      await p.getByRole('button', { name: 'Re-Submit Request' }).click();
    });

    await printAdminMenuChangeStep(page, requestId, 'General Workflow: Requestor Followup');
  });

  /*
  test.only('Verify Email Sent (CC)', async({page}) =>{
    await page.goto('http://host.docker.internal:5080/');
    await page.waitForLoadState('load');
    await confirmEmailRecipients(page, subjectText, expectedEmailRecipients)
    
    //Cleanup the inbox
    await page.getByText(subjectText).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByText(`RETURNED: General Form (#${requestId}) to`).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
  });
  */
});


test('Clean up Test Data', async({page}) => {
  //move request back to where it started
  await page.goto(requestURL);
  await page.waitForLoadState('load');
  await awaitPromise(page, 'currentStep', async (p:Page) => {
    await p.getByRole('button', { name: 'Re-Submit Request' }).click();
  });
  await printAdminMenuChangeStep(page, requestId, 'General Workflow: Requestor Followup');

  //remove first event from Return to Requestor
  await loadWorkflow(page);
  await expect(page.getByText('Return to Requestor')).toBeVisible();
  await awaitPromise(page, "events", async (p:Page) => {
    await p.getByText('Return to Requestor').click();
  });

  const eventsLi = page.locator('#stepInfo_2 li').filter({ hasText: `Email - ${uniqueDescr}` });
  await expect(eventsLi, 'to be present once in the list of triggered events').toHaveCount(1);

  await eventsLi.getByRole('button', { name: 'Remove Event' }).click();
  await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
  await awaitPromise(page, `events`, async (p:Page) => {
    await p.getByRole('button', { name: 'Yes' }).click();
  }, 'DELETE');

  //delete first event in workflow editor
  await loadWorkflow(page);
  await awaitPromise(page, "customEvents", async (p:Page) => {
    await p.getByRole('button', { name: 'Edit Events' }).click();
  });

  await expect(page.getByRole('heading', { name: 'List of Events' })).toBeVisible();
  const expectedInputValue = uniqueEventName.replace(/[^a-z0-9]/gi, '_');
  await page
    .locator(`#editor_CustomEvent_${expectedInputValue}`)
    .getByRole(`button`, {name:`Delete`}).click();

  await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
  await awaitPromise(page, "workflow/customEvents", async (p:Page) => {
    await p.getByRole('button', { name: 'Yes' }).click();
  });

  //delete templates in email template editor


});