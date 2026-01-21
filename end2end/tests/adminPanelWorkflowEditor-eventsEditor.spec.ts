import { test, expect, Page, Browser } from '@playwright/test';
import {
  awaitPromise, loadWorkflow, deleteWorkflowEvent, deleteTestFormByFormID,
  createTestRequest, createTestForm, addFormQuestion, selectChosenDropdownOption,
  confirmEmailRecipients, LEAF_URLS, deleteTestRequestByRequestID, getRandomId
} from '../leaf_test_utils/leaf_util_methods.ts';


/**
* helper unique to file to facilitate testing of request fields in email template content
* */
const confirmFieldFormatting = async (page:Page, expectedEmailContent:Array<any>) => {
  //danger btn might be visible on some browsers and needs to be clicked to allow the html to display
  const dangerBtn = page.getByRole('button', { name: 'Disable (DANGER!)' });
  const dangerBtnCount = await dangerBtn.count();
  if(dangerBtnCount > 0) {
    await dangerBtn.click();
  }

  const msgframe = page.frameLocator('.htmlview');
  for(let i = 0; i < expectedEmailContent.length; i++) {
    const id = expectedEmailContent[i].id;
    const f = expectedEmailContent[i].format;
    const c = expectedEmailContent[i].content;
    const assertMessage = expectedEmailContent[i]?.assertMessage || '';
    const testField = msgframe.locator('#format_test_' + id);
    await expect(testField).toBeAttached();

    if (f === 'grid') {
      const headers = expectedEmailContent[i].headers;
      const rows = expectedEmailContent[i].rows;

      const table = testField.locator(`table`);
      await expect(
        table,
        'grid question to be presented in table format'
      ).toBeVisible();

      await expect(
        table.locator('th'),
        `grid question to have ${headers.length} headers`
      ).toHaveCount(headers.length);
      await expect(
        table.locator('tr:has(td)'),
        `grid question to have ${rows.length} body rows`
      ).toHaveCount(rows.length);

      for (let h = 0; h < headers.length; h++) {
        await expect(
          table.locator('th').nth(h),
          `grid header index ${h} to be '${headers[h]}'`
        ).toHaveText(headers[h]);
        for (let r = 0; r < rows.length; r++) {
          await expect(
            table.locator('tr:has(td)').nth(r).locator('td').nth(h),
            `grid row index ${r}, col ${h} to have text '${rows[r][h]}'`
          ).toHaveText(rows[r][h]);
        }
      }

    } else {
      const fieldHTML = await testField.innerHTML();
      expect(
        fieldHTML,
        assertMessage || `${f} format question to have html content '${c}'`
      ).toBe(c);
    }
  }
}

/**
 * helper unique to file to change the step of a request
 * @param page Page instance from test
 * @param requestID request id as string value 
 * @param newStep new step, in format 'form name: step name'
 */
const printAdminMenuChangeStep = async (page:Page, requestID:string, newStep:string) => {
  const recSubURL = `printview&recordID=${requestID}`;

  let awaitResponse = page.waitForResponse(res =>
    res.url().includes(recSubURL) && res.status() === 200
  );
  if(page.url().includes(recSubURL)) {
    await page.reload(); //needed after some workflow actions
  } else {
    await page.goto(LEAF_URLS.PRINTVIEW_REQUEST + requestID);
  }
  await awaitResponse;

  await expect(page.getByRole('button', { name: 'Change Current Step' })).toBeVisible();
  awaitResponse = page.waitForResponse(res =>
    res.url().includes('steps') && res.status() === 200
  );
  await page.getByRole('button', { name: 'Change Current Step' } ).click();
  await awaitResponse;

  const dialog = page.getByRole('dialog', { name: 'Change Step' });
  await expect(dialog.locator('div[id$="_loadIndicator"]')).toBeHidden();
  await selectChosenDropdownOption(page, '#newStep_chosen', newStep);

  awaitResponse = page.waitForResponse(res =>
    res.url().includes(recSubURL) && res.status() === 200
  );
  await dialog.getByRole('button', { name: 'Save Change' }).click();
  await awaitResponse;
  await page.waitForLoadState('networkidle');
}

test('Verify Event Name only allow alphanumerical', async ({ page}) => {
  let incorrectNameInput: string [] = [`%2BSELECT%2A%20FROM%20admin%20--`, `'; DROP TABLE users;`, `$../..etc/passwd`, `<script>alert('XSS')</script>`];
  let expectedConvertedInput: string [] = [`_2BSELECT_2A_20FROM_20adm`, `___DROP_TABLE_users_`, `______etc_passwd`, `_script_alert__XSS____scr`];

  for(let i = 0; i < incorrectNameInput.length; i++) {
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
    await page.getByLabel('Event Name:').pressSequentially(incorrectNameInput[i]);
    expect(
      await page.getByLabel('Event Name:').inputValue(),
      'Only allows alphanumeric letters and underscores for safety'
    ).toBe(expectedConvertedInput[i]);
  }
  await page.getByRole('button', { name: 'Cancel' }).click();
});

test('Navigation from Workflow Editor Links to Email Template Editor', async({page}) => {
  await loadWorkflow(page);
  await awaitPromise(page, "customEvents", async (p:Page) => {
    await p.getByRole('button', { name: 'Edit Events' }).click();
  });
  await expect(page.getByRole('button', { name: 'Create a new Event' })).toBeVisible();

  const mainModalLink = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Email Template Editor' }).click();
  await mainModalLink;

  const selectorStr = `td[id^="editor_CustomEvent_"]`;
  await page.locator(selectorStr).getByRole('button', { name: 'Edit' }).first().click();

  const editModalLink = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Email Template Editor' }).click();
  await editModalLink;
});


test.describe('Event creation, name and description validation, editing and deletion', () => {
  test.describe.configure({ mode: 'serial' });
  const randNum = Date.now(); //timestamp. shorter than random - event name is limited to 25 chars
  const uniqueEventName2 = `Event2 ${randNum}`;
  const uniqueDescr2 = `Description2 ${randNum}`;

  test('Create a new Event from the page Side Menu', async ({ page }) => {
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

  test('A duplicate Event Name is not allowed', async ({ page }) => {
    await loadWorkflow(page);
    await awaitPromise(page, "customEvents", async (p:Page) => {
      await p.getByRole('button', { name: 'Edit Events' }).click();
    });
    await expect(page.getByRole('button', { name: 'Create a new Event' })).toBeVisible();

    await awaitPromise(page, "groups", async (p:Page) => {
      await p.getByRole('button', { name: 'Create a new Event' }).click();
    });

    await page.getByLabel('Event Name:').pressSequentially(uniqueEventName2);
    await page.getByLabel('Short Description: Notify').fill('test ' + uniqueDescr2);

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

    await page.getByLabel('Event Name:').pressSequentially('test ' + uniqueEventName2);
    await page.getByLabel('Short Description:').fill(uniqueDescr2);

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

  const uniqueEventNameEdit = `Evt Edit ${randNum}`;
  const uniqueDescrEdit = `Descr Edit ${randNum}`;
  const customEventNotifyGroup = { id: '111', name: 'Linen Sports' };
  const initialExpectedValue = uniqueEventName2.replace(/[^a-z0-9]/gi, '_');
  const expectedEditedInputValue = uniqueEventNameEdit.replace(/[^a-z0-9]/gi, '_');
  const expectedEventDisplayName = expectedEditedInputValue.replace(/_+/g, " ");
  test('Workflow Event can be edited', async ({ page }) => {
    await loadWorkflow(page);
    let awaitResponse = page.waitForResponse(res =>
      res.url().includes(`customEvents`) && res.status() === 200
    );
    await page.getByRole('button', { name: 'Edit Events' }).click();
    await awaitResponse;

    await expect(page.getByRole('heading', { name: 'List of Events' })).toBeVisible();

    awaitResponse = page.waitForResponse(res =>
      res.url().includes(`_CustomEvent_${initialExpectedValue}`) && res.status() === 200
    );
    await page
      .locator(`#editor_CustomEvent_${initialExpectedValue}`)
      .getByRole(`button`, { name:`Edit` }).click();
    await awaitResponse;

    await page.getByLabel('Event Name:').fill('');
    await page.getByLabel('Event Name:').pressSequentially(uniqueEventNameEdit);
    expect(
      await page.getByLabel('Event Name:').inputValue(),
      'chars other than A-Z, 0-9 to be replaced with underscores'
    ).toBe(expectedEditedInputValue);

    await page.getByLabel('Short Description:').fill(uniqueDescrEdit);
    await page.getByLabel('Notify Requestor Email:').check();
    await page.getByLabel('Notify Next Approver Email:').check();
    await page.getByLabel('Notify Group:').selectOption(customEventNotifyGroup.id);
    awaitResponse = page.waitForResponse(res =>
      res.url().includes(`workflow/customEvents`) && res.status() === 200
    );
    await page.getByRole('button', { name: 'Save' }).click();
    await awaitResponse;

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

    awaitResponse = page.waitForResponse(res =>
      res.url().includes(`_CustomEvent_${expectedEditedInputValue}`) && res.status() === 200
    );
    await page
      .locator(`#editor_CustomEvent_${expectedEditedInputValue}`)
      .getByRole(`button`, { name:`Edit` }).click();
    await awaitResponse;

    await expect(page.locator('.ui-dialog-title:visible')).toHaveText(`Edit Event ${expectedEventDisplayName}`);
    await expect(page.getByLabel('Short Description:')).toHaveValue(uniqueDescrEdit);
    await expect(page.getByLabel('Notify Requestor Email:')).toBeChecked();
    await expect(page.getByLabel('Notify Next Approver Email:')).toBeChecked();
    await expect(page.getByLabel('Notify Group:')).toHaveValue(customEventNotifyGroup.id);
    const selectedOptionText = await page.getByLabel('Notify Group:').locator('option:checked').innerText();
    expect(selectedOptionText).toBe(customEventNotifyGroup.name);
  });

  test('Workflow Event can be deleted from the Events modal table', async ({ page }) => {
    await loadWorkflow(page);
    await deleteWorkflowEvent(page, expectedEditedInputValue, uniqueDescrEdit);
  });
});


test.describe('Email Template customization, recipients, request field formatting', () => {
  test.describe.configure({ mode: 'serial' });

  const randNum = Date.now(); //event name limited to 25 chars
  const requestId = '123'; //standard test case request
  const testCaseRequestTitle = 'Test Email Events';
  const tempTestRequestTitle = testCaseRequestTitle + randNum;

  //set up a browser context that can be used to create a page in cleanup afterAll
  let cleanupBrowser: Browser;
  test.beforeAll(async ({ browser }) => {
    cleanupBrowser = browser;
  });

  //artifact tracking and afterAll for cleanup
  let customEventAddedToWorkflow = false;
  let requestIsCancelled = false;
  let needToKnowFormID:string = '';
  let needToKnowRequestID:string = '';

  test.afterAll(async () => {
    const context = await cleanupBrowser.newContext();
    const page = await context.newPage();

    //restore the Cancel Notification Email template to default
    let awaitResponse = page.waitForResponse(res =>
      res.url().includes('emailTemplates/custom') && res.status() === 200
    );
    await page.goto(LEAF_URLS.PORTAL_HOME + 'admin/?a=mod_templates_email');
    const customTemplatesRes = await awaitResponse;
    const customTemplates:Array<string> = await customTemplatesRes.json() ?? [];
    const hasCustomCancel = customTemplates.some(t => t.includes('LEAF_cancel_notification'));
    if(hasCustomCancel === true) {
      awaitResponse = page.waitForResponse(res =>
        res.url().includes('emailTemplates/_LEAF_cancel_notification_body') && res.status() === 200
      );
      await page.getByRole('button', { name: 'Cancel Notification', exact: true }).click();
      await awaitResponse;

      await page.getByRole('button', { name: 'Restore Original' }).click();
      await page.getByRole('button', { name: 'Yes' }).click();
      await expect(page.getByRole('button', { name: 'Restore Original' })).not.toBeVisible();
    }

    //delete the custom event from the workflow
    if(customEventAddedToWorkflow === true) {
      await page.goto(LEAF_URLS.WORKFLOW_EDITOR_WF + "1");
      await deleteWorkflowEvent(page, uniqueEventName.replace(/[^a-z0-9]/gi, '_'), uniqueDescr);
    }
    //restore the test case request and move it back
    if (requestIsCancelled === true) {
      await printAdminMenuChangeStep(page, requestId, 'General Workflow - Requestor Followup');
      await expect(page.locator('span.buttonNorm', { hasText: 'Restore Request' })).toBeVisible();
      awaitResponse = page.waitForResponse(res =>
        res.url().includes('ajaxIndex.php?a=restore') && res.status() === 200
      );
      await page.locator('span.buttonNorm', { hasText: 'Restore Request' }).click();
      await awaitResponse;
    }

    //restore the original title
    page.goto(LEAF_URLS.PRINTVIEW_REQUEST + requestId);
    await page.getByRole('button', { name: 'Edit Title'}).click();
    await expect(page.locator('#title')).toBeVisible();
    await page.locator('#title').fill(testCaseRequestTitle);
    await page.getByRole('button', { name: 'Save Change' }).click();
    await expect(page.locator('#requestTitle')).not.toHaveText(tempTestRequestTitle);

    if(needToKnowFormID !== '') {
      await deleteTestFormByFormID(page, needToKnowFormID);
    }
    if(needToKnowRequestID !== '') {
      await deleteTestRequestByRequestID(page, needToKnowRequestID);
    }

    await context.close();
  });


  const notifyNextLabel = 'Email - Notify the next approver';
  const customEventNotifyGroupID = { id: '111', name: 'Linen Sports' };

  const uniqueEventName = `Event ${randNum}`;
  const uniqueDescr = `Description ${randNum}`;

  const needToKnowTestID = getRandomId();
  const ntk_data2 = 'sensitive data entry';
  const ntk_data3 = 'non-sensitive data entry';
  let ntkQ2_id = '';
  let ntkQ3_id = '';

  //email template subjects
  const customEventEmailSubject = `Custom Event ${uniqueEventName}`;
  const emailSubjectNTK = `NTK ${needToKnowTestID}`;
  const sendBackEventEmailSubject = `RETURNED: ${tempTestRequestTitle} (#${requestId})`;
  const notifyNextEventEmailSubject = `Action needed: ${tempTestRequestTitle} (#${requestId})`;
  const cancelEventEmailSubject = `The request for ${tempTestRequestTitle} (#${requestId}) has been canceled.`;

  //email template recipient ToCc content
  const directEmailTo = 'test4892.to@fake.com';
  const directEmailCC = 'test4892.cc@fake.com';
  const customEventEmailTo = '{{$field.49}}\n{{$field.50}}\n' + directEmailTo; //ind49(orgchart_emp), ind50(orgchart_grp)
  const customEventEmailCC = '{{$field.54}}\n{{$field.53}}\n' + directEmailCC; //ind54(orgchart_emp), ind53(orgchart_grp)


  const expectedToFieldEmailRecipients = [
    'Boyd.Schaden@fake-email.com', //org emp data field 49
    'Roman.Abbott@fake-email.com', //org grp data field 50 - direct groupId 202 members
    'Morton.Anderson@fake-email.com',
    'Loyd.Cartwright10@fake-email.com',
    'Booker.Feeney@fake-email.com',
    directEmailTo
  ];
  const expectedCcFieldEmailRecipients = [
    'Cherilyn.Jacobs@fake-email.com', //org emp data field 54
    'Allen.Corwin@fake-email.com',    //org grp data field 53 - direct groupId 97 members
    'Cory.Hartmann@fake-email.com',
    'Roger.Kirlin@fake-email.com',
    'Cecille.Maggio@fake-email.com',
    directEmailCC
  ];

  const expectedCustomEventEmailRecipients = [
    'Cierra.Feil@fake-email.com',  //custom event config - notify group (group 111)
    'tester.tester@fake-email.com' //custom event config - notify requestor
  ];

  const expectedSendBackEmailRecipients = [
    'tester.tester@fake-email.com',
  ];

  const expectedNotifyNextEmailRecipients = [
    'Donte.Glover@fake-email.com',
  ];
  const expectedCancelEmailRecipients = [ //all prior notified
    ...expectedToFieldEmailRecipients,
    ...expectedCcFieldEmailRecipients,
    ...expectedCustomEventEmailRecipients,
    'Donte.Glover@fake-email.com',
  ];

  //Data for field formatting content addition and display assertions.
  //Data is from a standard database test case record with constant IDs and content
  let bodyContent = '<p>request fields</p><br>';
  const expectedEmailContent = [
    { id: 34, format: 'text', content: '53778' },
    { id: 35, format: 'textarea', content: 'test textarea' },
    { id: 36, format: 'number', content: '93817' },
    { id: 37, format: 'currency', content: '42.00' },
    { id: 38, format: 'fileupload', content: `<a href="${LEAF_URLS.PORTAL_HOME}file.php?form=${requestId}&amp;id=38&amp;series=1&amp;file=0">test.txt</a>` },
    { id: 39, format: 'image', content: `<a href="${LEAF_URLS.PORTAL_HOME}file.php?form=${requestId}&amp;id=39&amp;series=1&amp;file=0">test.png</a>` },
    { id: 41, format: 'date', content: '12/05/2025' },
    { id: 42, format: 'dropdown', content: '3 &amp; 4' },
    { id: 43, format: 'multiselect', content: '<ul><li>c &amp; d</li></ul>' },
    { id: 44, format: 'checkbox', content: 'custom label' },
    { id: 45, format: 'checkboxes', content: '<ul><li>6</li><li>7 &amp; 8</li></ul>' },
    { id: 46, format: 'radio', content: 'G &amp; H' },
    {
      id: 48,
      format: 'grid',
      content: null, //grid content assertions will be handled using headers and rows info below
      headers: [ 'single line cell',	'multi-line cell',	'date cell',	'dropdown cell' ],
      rows:  [
        [ 'test single line', 'test multi line', '09/17/2025', '1' ],
        [ 'test single line 2', 'test multi line 2', '12/05/2025', '2' ],
      ],
    },
    { id: 49, format: 'orgchart_employee', content: 'Boyd Schaden' },
    { id: 50, format: 'orgchart_group', content: '2911 TEST Group' },
    { id: 51, format: 'orgchart_position', content: 'All things wonderful' },
    { id: 99999, format: '', content: '', assertMessage: 'non-existent field to be present but have no content' },
  ];
  expectedEmailContent.forEach(entry => {
    bodyContent += `<div id="format_test_${entry.id}">{{$field.${entry.id}}}</div><br>`
  });

  test('Create and add a new Custom Event from a workflow action bubble', async ({ page}) => {
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
    await page.getByLabel('Notify Group:', { exact: true }).selectOption(customEventNotifyGroupID.id);

    await awaitPromise(page, "events", async (p:Page) => {
      await p.getByRole('button', { name: 'Save' }).click();
    });

    await expect(
      page.getByText(`Email - ${uniqueDescr}`),
      'event created through the workflow action to be present and in the viewport'
    ).toBeInViewport();
    customEventAddedToWorkflow = true;
  });

  test('Custom Email Event: Email Template Editor event config display', async({page}) => {
    const filePromise = page.waitForResponse(res =>
      res.url().includes(`workflow/customEvents`) && res.status() === 200
    );
    await page.goto(LEAF_URLS.PORTAL_HOME + 'admin/?a=mod_templates_email');
    await expect(
      page.getByRole('button', { name: uniqueDescr, exact: true }),
      'event description to be present in custom events list'
    ).toBeVisible();
    await page.getByRole('button', { name: uniqueDescr, exact: true }).click();
    await filePromise;

    await expect(
      page.getByRole('heading', { name: uniqueDescr }),
      `Custom event heading to be ${uniqueDescr}`
    ).toBeVisible();

    const configInfo = page.locator('#emailNotificationInfo');
    await expect(
      configInfo.getByText('Notifies Requestor'),
      'Notifies Requestor bubble to be shown'
    ).toBeVisible();
    await expect(
      configInfo.getByText('Notifies Next Approver'),
      'Notifies Next Approver bubble not to be shown'
    ).not.toBeVisible();
    await expect(
      configInfo.getByText(`Notifies Group '${customEventNotifyGroupID.name}'`),
      `Notifies Group '${customEventNotifyGroupID.name}' bubble to be shown`
    ).toBeVisible();
  });

  test('Custom Email Event: email template customization', async({page}) => {
    const filePromise = page.waitForResponse(res =>
      res.url().includes(`workflow/customEvents`) && res.status() === 200
    );
    await page.goto(LEAF_URLS.PORTAL_HOME + 'admin/?a=mod_templates_email');
    await expect(page.getByRole('button', { name: uniqueDescr, exact: true })).toBeVisible();
    await page.getByRole('button', { name: uniqueDescr, exact: true }).click();
    await filePromise;

    await expect(page.getByRole('textbox', { name: 'Email To:' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Email To:' }).fill(customEventEmailTo);
    await page.getByRole('textbox', { name: 'Email CC:' }).fill(customEventEmailCC);

    let subjectArea = page
      .locator('#divSubject')
      .getByLabel('Template Editor coding area.');
    await subjectArea.press('ControlOrMeta+A');
    await subjectArea.press('Backspace');
    await subjectArea.fill(customEventEmailSubject);

    await page.getByRole('button', { name: 'Use Code Editor' }).click();

    let bodyArea = page.locator('#code_mirror_template_editor');
    await bodyArea.press('ControlOrMeta+A');
    await bodyArea.press('Backspace');
    await bodyArea.fill(bodyContent);

    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByRole('button', { name: 'Restore Original'})).toBeVisible();
  });

  test('Custom Email Event: confirm email recipients (To/Cc/notify)', async({page}) => {
    await page.goto(LEAF_URLS.PRINTVIEW_REQUEST + requestId);
    await page.waitForLoadState('load');

    await page.getByRole('button', { name: 'Edit Title'}).click();
    await expect(page.locator('#title')).toBeVisible();
    await page.locator('#title').fill(tempTestRequestTitle);
    await page.getByRole('button', { name: 'Save Change' }).click();
    await expect(page.locator('#requestTitle')).toHaveText(tempTestRequestTitle);

    await expect(page.getByRole('button', { name: 'Return to Requestor' })).toBeVisible();
    const awaitResponse = page.waitForResponse(res =>
      res.url().includes(`Workflow/${requestId}/apply`) && res.status() === 200
    );
    await page.getByRole('button', { name: 'Return to Requestor' }).click();
    await awaitResponse;

    await page.goto(LEAF_URLS.EMAIL_SERVER);
    await page.waitForLoadState('load');
    await confirmEmailRecipients(page, customEventEmailSubject, expectedToFieldEmailRecipients);
    await confirmEmailRecipients(page, customEventEmailSubject, expectedCcFieldEmailRecipients, true);
    await confirmEmailRecipients(page, customEventEmailSubject, expectedCustomEventEmailRecipients);
  });

  test('Custom Email Event: email field content formatting for all formats', async({page}) => {
    await page.goto(LEAF_URLS.EMAIL_SERVER);
    await page.waitForLoadState('load');
    await page.locator('#pane-messages').getByText(customEventEmailSubject).first().click();
    await confirmFieldFormatting(page, expectedEmailContent);
    //delete the emails
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(customEventEmailSubject)).toHaveCount(0);
  });

  test('Send Back Event: event sends email to requestor', async({page}) => {
    await page.goto(LEAF_URLS.EMAIL_SERVER);
    await page.waitForLoadState('load');
    await confirmEmailRecipients(page, sendBackEventEmailSubject, expectedSendBackEmailRecipients);

    await page.getByText(sendBackEventEmailSubject).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(sendBackEventEmailSubject)).toHaveCount(0);
  });

  test(`Custom Email Event (PHI): a field set to sensitive/PHI is masked`, async({page}) => {
    //prep isolated form, template, and request (changing PHI setting of a built-in form would cause issues) 
    needToKnowFormID = await createTestForm(page, needToKnowTestID, '');
    await page.getByLabel('Status:').selectOption('1');
    await page.getByLabel('Workflow:').selectOption('1');

    await addFormQuestion(page, 'Add Section', 'Header');
    ntkQ2_id = await addFormQuestion(page, 'Add Question to Section', 'sensitive data', 'text', '', true);
    ntkQ3_id = await addFormQuestion(page, 'Add Question to Section', 'non sensitive data (NTK form)', 'text');

    const mockDataEntry = {
      [ntkQ2_id]: ntk_data2,
      [ntkQ3_id]: ntk_data3,
    };
    const needToKnowExpectedContent = [
      { id: ntkQ2_id, format: 'text', content: '**********',
        assertMessage: 'sensitive data question to be masked in email' },
      { id: ntkQ3_id, format: 'text', content: ntk_data3 },
    ];

    //update custom event email template
    let awaitResponse = page.waitForResponse(res =>
      res.url().includes('emailTemplates/custom') && res.status() === 200
    );
    await page.goto(LEAF_URLS.PORTAL_HOME + 'admin/?a=mod_templates_email');
    await awaitResponse;

    awaitResponse = page.waitForResponse(res =>
      res.url().includes(`workflow/customEvents`) && res.status() === 200
    );
    await page.getByRole('button', { name: uniqueDescr, exact: true }).click();
    await awaitResponse;
    await expect(page.getByRole('heading', { name: uniqueDescr })).toBeVisible();

    //clear out ToCc and update the subject
    await page.getByRole('textbox', { name: 'Email To:' }).fill('');
    await page.getByRole('textbox', { name: 'Email CC:' }).fill('');

    let subjectArea = page
      .locator('#divSubject')
      .getByLabel('Template Editor coding area.');
    await subjectArea.press('ControlOrMeta+A');
    await subjectArea.press('Backspace');
    await subjectArea.fill(emailSubjectNTK);

    await page.getByRole('button', { name: 'Use Code Editor' }).click();

    //add the new field IDs to body
    let newBodyContent = '';
    needToKnowExpectedContent.forEach(entry => {
      newBodyContent += `<div id="format_test_${entry.id}">{{$field.${entry.id}}}</div><br>`
    });
    let bodyArea = page.locator('#code_mirror_template_editor');
    await bodyArea.press('ControlOrMeta+A');
    await bodyArea.press('Backspace');
    await bodyArea.fill(newBodyContent);
    awaitResponse = page.waitForResponse(res =>
      res.url().includes(`emailTemplateFileHistory`) && res.status() === 200
    );
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await awaitResponse;

    //create and submit a test request.  Move it and then trigger the event.
    needToKnowRequestID = await createTestRequest(page, 'AS - Service', `req${needToKnowTestID}`, needToKnowTestID);
    const sendBackSubject = `RETURNED: ${needToKnowTestID} (#${needToKnowRequestID})`;

    await expect(page.locator(`.response.blockIndicator_${ntkQ2_id} input`)).toBeVisible();
    await page.locator(`.response.blockIndicator_${ntkQ2_id} input`).fill(mockDataEntry[ntkQ2_id]);
    await page.locator(`.response.blockIndicator_${ntkQ3_id} input`).fill(mockDataEntry[ntkQ3_id]);
    await page.locator('#nextQuestion2').click();

    await expect(page.getByRole('button', { name: 'Submit Request' })).toBeVisible();
    awaitResponse = page.waitForResponse(res =>
      res.url().includes(`form/${needToKnowRequestID}/submit`) && res.status() === 200
    );
    await page.getByRole('button', { name: 'Submit Request' }).click();
    await awaitResponse;
    await printAdminMenuChangeStep(page, needToKnowRequestID, 'General Workflow: Requestor Followup');
    await expect(page.getByRole('button', { name: 'Return to Requestor' })).toBeVisible();
    awaitResponse = page.waitForResponse(res =>
      res.url().includes(`formWorkflow/${needToKnowRequestID}/apply`) && res.status() === 200
    );
    await page.getByRole('button', { name: 'Return to Requestor' }).click();
    await awaitResponse;

    await page.goto(LEAF_URLS.EMAIL_SERVER);
    await page.waitForLoadState('load');

    await page.locator('#pane-messages').getByText(emailSubjectNTK).first().click();

    await confirmFieldFormatting(page, needToKnowExpectedContent);

    //clear out emails
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(emailSubjectNTK)).toHaveCount(0);

    await page.getByText(sendBackSubject).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(sendBackSubject)).toHaveCount(0);
  });

  test(`An existing event can be added to a Workflow Action (Notify Next on Submit)`, async ({ page }) => {
    await loadWorkflow(page, "1");
    let awaitResponse = page.waitForResponse(res =>
      res.url().includes('events') && res.status() === 200
    );
    await page.locator('#jsPlumb_1_50').click();
    await awaitResponse;

    awaitResponse = page.waitForResponse(res =>
      res.url().includes('workflow/events') && res.status() === 200
    );
    await page.getByRole('button', { name: 'Add Event' }).click();
    await awaitResponse;

    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await page.getByLabel('Add Event').locator('a').click();
    await page.getByRole('option', { name: notifyNextLabel }).click();

    awaitResponse = page.waitForResponse(res =>
      res.url().includes('events') && res.status() === 200
    );
    await page.getByRole('button', { name: 'Save' }).click();
    await awaitResponse;

    await expect(
      page.getByText(notifyNextLabel),
      'Notify Next event to have been added and to be in the viewport'
    ).toBeInViewport();
  });

  test('Built-In Notify Next Approver: event sends to expected recipients', async({page}) => {
    await page.goto(LEAF_URLS.PRINTVIEW_REQUEST + requestId);
    await expect(page.getByRole('button', { name: 'Re-Submit Request' })).toBeVisible();
    let awaitResponse = page.waitForResponse(res =>
      res.url().includes(`form/${requestId}/submit`) && res.status() === 200
    );
    await page.getByRole('button', { name: 'Re-Submit Request' }).click();
    await awaitResponse;

    await printAdminMenuChangeStep(page, requestId, 'General Workflow: Requestor Followup');

    await page.goto(LEAF_URLS.EMAIL_SERVER);
    await page.waitForLoadState('load');

    //built in notify next config
    await confirmEmailRecipients(page, notifyNextEventEmailSubject, expectedNotifyNextEmailRecipients);

    //delete the email
    await page.locator('#pane-messages').getByText(notifyNextEventEmailSubject).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(notifyNextEventEmailSubject)).toHaveCount(0);
  });

  test('An event can be removed from a Workflow Action', async ({ page }) => {
    await loadWorkflow(page, "1");
    let awaitResponse = page.waitForResponse(res =>
      res.url().includes('events') && res.status() === 200
    );
    await page.locator('#jsPlumb_1_50').click();
    await awaitResponse;

    const eventsLi = page.locator('#stepInfo_-1 li').filter({ hasText: notifyNextLabel });
    await expect(eventsLi, 'to be present once in the list of triggered events').toHaveCount(1);

    await eventsLi.getByRole('button', { name: 'Remove Event' }).click();
    await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
    await awaitPromise(page, `events`, async (p:Page) => {
      await p.getByRole('button', { name: 'Yes' }).click();
    }, 'DELETE');

    await loadWorkflow(page);
    await awaitPromise(page, "events", async (p:Page) => {
      await p.locator('#jsPlumb_1_50').click();
    });

    await expect(
      page.locator('#stepInfo_-1 li').filter({ hasText: notifyNextLabel }),
      'not to be in the list of triggered events'
    ).toHaveCount(0);
  });

  test('Cancel Notification: event sends to all prior recipients', async({page}) => {
    await deleteTestRequestByRequestID(page, requestId);
    requestIsCancelled = true;

    await page.goto(LEAF_URLS.EMAIL_SERVER);
    await page.waitForLoadState('load');
    await confirmEmailRecipients(page, cancelEventEmailSubject, expectedCancelEmailRecipients);

    await page.locator('#pane-messages').getByText(cancelEventEmailSubject).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(cancelEventEmailSubject)).toHaveCount(0);
  });
});