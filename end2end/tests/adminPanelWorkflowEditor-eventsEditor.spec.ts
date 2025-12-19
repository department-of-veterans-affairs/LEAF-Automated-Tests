import { test, expect, Page } from '@playwright/test';
import {
  awaitPromise, loadWorkflow, deleteWorkflowEvent, confirmEmailRecipients, LEAF_URLS, deleteTestRequestByRequestID
} from '../leaf_test_utils/leaf_util_methods.ts';

test.describe.configure({ mode: 'serial' });

/**
 * Use the printview admin menu to change the step of a request
 * @param page Page instance from test
 * @param requestID request id as string value 
 * @param newStep new step, in format 'form name: step name'
 */
const printAdminMenuChangeStep = async (page:Page, requestID:string, newStep:string) => {
  const awaitPage = page.waitForResponse(res => res.url().includes('lastActionSummary') && res.status() === 200);
  await page.goto(LEAF_URLS.PRINTVIEW_REQUEST + requestID);
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


test.describe('Events can be created from side menu, names and descriptions are unique, editing and deletion', () => {
  const randNum = Date.now(); //timestamp. unique but shorter than random - event name is limited to 25 chars
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
  const customEventNotifyGroupID = '111';
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
    await page.getByLabel('Notify Group:').selectOption(customEventNotifyGroupID);
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
    await expect(page.getByLabel('Notify Group:')).toHaveValue(customEventNotifyGroupID);
  });

  test('Workflow Event can be deleted', async ({ page }) => {
    await loadWorkflow(page);
    await deleteWorkflowEvent(page, expectedEditedInputValue, uniqueDescrEdit);
  });
});

/*
Uses a Custom Event added to return to requestor to test To/Cc, subject, body request field formatting.
This Return to Requestor action also triggers the Send Back event to confirm requestor notification.
Adds Builtin Notify Next to a Submit action to test notify next recipients (and to populate a prior recipient address).
Uses a customized template for the Cancel Notification to test custom To/Cc and request field formatting.
-
Formatted fields can be processed through either FormWorkflow (custom email and scripts)
or through Email (generic events like Cancel). Custom Event and Cancel are used to test both paths */
test.describe('Test Email Template customization and request field formatting', () => {
  const requestId = '123'; //test case request
  const requestURL = LEAF_URLS.PRINTVIEW_REQUEST + requestId;
  const testCaseRequestTitle = 'Test Email Events';
  const randNum = Date.now(); //timestamp. unique but shorter than random - event name is limited to 25 chars
  const tempTestRequestTitle = testCaseRequestTitle + randNum;
  const customEventNotifyGroupID = '111';
  const uniqueEventName = `Event ${randNum}`;
  const uniqueDescr = `Description ${randNum}`;
  let customEventAddedToWorkflow = false;
  test('Create and add a new Custom Event from a workflow action', async ({ page}) => {
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
    await page.getByLabel('Notify Group:', { exact: true }).selectOption(customEventNotifyGroupID);

    await awaitPromise(page, "events", async (p:Page) => {
      await p.getByRole('button', { name: 'Save' }).click();
    });

    await expect(
      page.getByText(`Email - ${uniqueDescr}`),
      'event created through the workflow action to be present and in the viewport'
    ).toBeInViewport();
    customEventAddedToWorkflow = true;
  });

  const notifyNextLabel = 'Email - Notify the next approver';

  const customEventEmailSubject = `Custom Event ${uniqueEventName}`;
  const sendBackEventEmailSubject = `RETURNED: ${tempTestRequestTitle} (#${requestId})`;
  const notifyNextEventEmailSubject = `Action needed: ${tempTestRequestTitle} (#${requestId})`;
  const cancelEventEmailSubject = `The request for ${tempTestRequestTitle} (#${requestId}) has been canceled.`;


  const directEmailTo = 'test4892.to@fake.com';
  const directEmailCC = 'test4892.cc@fake.com';
  const customEventEmailTo = '{{$field.49}}\n{{$field.50}}\n' + directEmailTo; //ind49(emp), ind50(grp)
  const customEventEmailCC = '{{$field.54}}\n{{$field.53}}\n' + directEmailCC; //ind54(emp), ind53(grp)
  //flip to/cc to distinguish cancel notice recipients from prior recipients - email server will show to/cc fields
  const cancelEventEmailTo = customEventEmailCC;
  const cancelEventEmailCC = customEventEmailTo;

  //Data used to test field formatting is from a standard database test case record with constant IDs */
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
    { id: 48, format: 'grid', content: null }, //grid will be handled separately
    { id: 49, format: 'orgchart_employee', content: 'Boyd Schaden' },
    { id: 50, format: 'orgchart_group', content: '2911 TEST Group' },
    { id: 51, format: 'orgchart_position', content: 'All things wonderful (--)' },
  ];
  expectedEmailContent.forEach(entry => {
    bodyContent += `<div id="format_test_${entry.id}">{{$field.${entry.id}}}</div><br>`
  });

  const expectedToFieldEmailRecipients = [
    'Boyd.Schaden@fake-email.com', //org emp field 49
    'Roman.Abbott@fake-email.com', //org grp field 50 - direct groupId 202 members
    'Morton.Anderson@fake-email.com',
    'Loyd.Cartwright10@fake-email.com',
    'Booker.Feeney@fake-email.com',
    directEmailTo
  ];
  const expectedCcFieldEmailRecipients = [
    'Cherilyn.Jacobs@fake-email.com', //org emp field 54
    'Allen.Corwin@fake-email.com',    //org grp field 53 - direct groupId 97 members
    'Cory.Hartmann@fake-email.com',
    'Roger.Kirlin@fake-email.com',
    'Cecille.Maggio@fake-email.com',
    directEmailCC
  ];

  const expectedCustomEventEmailRecipients = [
    'Cierra.Feil@fake-email.com',  //notify group custom event config (group 111)
    'tester.tester@fake-email.com' //notify requestor custom event config
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
  const cancelEventExpectedCcRecipients = expectedToFieldEmailRecipients;

  const confirmFieldFormatting = async (page:Page) => {
    const msgframe = page.frameLocator('.htmlview');
    for(let i = 0; i < expectedEmailContent.length; i++) {
      const id = expectedEmailContent[i].id;
      const f = expectedEmailContent[i].format;
      const c = expectedEmailContent[i].content;
      const testField = msgframe.locator('#format_test_' + id);
      await expect(testField).toBeVisible();

      if (f === 'grid') {
        const headers = [ 'single line cell',	'multi-line cell',	'date cell',	'dropdown cell' ];
        const rows = [
          [ 'test single line',	'test multi line',	'09/17/2025',	'1' ],
          [ 'test single line 2',	'test multi line 2',	'12/05/2025',	'2' ],
        ];

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
          `${f} format question to have html content '${c}'`
        ).toBe(c);
      }
    }
  }

  test('Custom Email Event: Navigation from Workflow Editor modal and Template Customization ', async({page}) => {
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

    //Add custom content to To, Cc, Subject and Body of the custom event
    await expect(editorPage.getByRole('textbox', { name: 'Email To:' })).toBeVisible();
    await editorPage.getByRole('textbox', { name: 'Email To:' }).fill(customEventEmailTo);
    await editorPage.getByRole('textbox', { name: 'Email CC:' }).fill(customEventEmailCC);

    let subjectArea = editorPage
      .locator('#divSubject')
      .getByLabel('Template Editor coding area.');
    await subjectArea.press('ControlOrMeta+A');
    await subjectArea.press('Backspace');
    await subjectArea.fill(customEventEmailSubject);

    await editorPage.getByRole('button', { name: 'Use Code Editor' }).click();

    let bodyArea = editorPage
      .locator('#code_mirror_template_editor');
    await bodyArea.press('ControlOrMeta+A');
    await bodyArea.press('Backspace');
    await bodyArea.fill(bodyContent); 

    await editorPage.getByRole('button', { name: 'Save Changes' }).click();
    await expect(editorPage.getByRole('button', { name: 'Restore Original'})).toBeVisible();
  });

  test('Custom Email Event: confirm email recipients (To/Cc/notify) and email field content', async({page}) => {
    //Trigger the custom event with Return to Requestor workflow action
    await page.goto(requestURL);
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

    await page.goto('http://host.docker.internal:5080/');
    await page.waitForLoadState('load');
    //custom event email config
    await confirmEmailRecipients(page, customEventEmailSubject, expectedToFieldEmailRecipients);
    await confirmEmailRecipients(page, customEventEmailSubject, expectedCcFieldEmailRecipients, true);
    await confirmEmailRecipients(page, customEventEmailSubject, expectedCustomEventEmailRecipients);
    //send back email config
    await confirmEmailRecipients(page, sendBackEventEmailSubject, expectedSendBackEmailRecipients);

    await page.getByText(customEventEmailSubject).first().click();

    //this might be visible on some browsers, in which case it needs to be clicked to allow the html to display
    const dangerBtn = page.getByRole('button', { name: 'Disable (DANGER!)' });
    const dangerBtnCount = await dangerBtn.count();
    if(dangerBtnCount > 0) {
      await dangerBtn.click();
    }
    //test body content for form-workflow mediated Custom Event
    await confirmFieldFormatting(page);

    //delete the emails
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(customEventEmailSubject)).toHaveCount(0);

    await page.getByText(sendBackEventEmailSubject).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(sendBackEventEmailSubject)).toHaveCount(0);
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
    await page.goto(requestURL);
    await expect(page.getByRole('button', { name: 'Re-Submit Request' })).toBeVisible();
    await awaitPromise(page, 'lastActionSummary', async (p:Page) => {
      await p.getByRole('button', { name: 'Re-Submit Request' }).click();
    });
    await printAdminMenuChangeStep(page, requestId, 'General Workflow: Requestor Followup');

    await page.goto('http://host.docker.internal:5080/');
    await page.waitForLoadState('load');
    //built in notify next config
    await confirmEmailRecipients(page, notifyNextEventEmailSubject, expectedNotifyNextEmailRecipients);
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

  test.fail('Customized Cancel Notification: confirm email recipients (custom To/Cc) and email field content', { tag: ['@LEAF-5172'] }, async({page}) => {
    let requestIsCancelled = false;
    let emailFound = false;

    try {
      let awaitResponse = page.waitForResponse(res =>
        res.url().includes('emailTemplates/custom') && res.status() === 200
      );
      await page.goto(LEAF_URLS.PORTAL_HOME + 'admin/?a=mod_templates_email');
      await awaitResponse;

      awaitResponse = page.waitForResponse(res =>
        res.url().includes('emailTemplates/_LEAF_cancel_notification_body') && res.status() === 200
      );
      await page.getByRole('button', { name: 'Cancel Notification', exact: true }).click();
      await awaitResponse;

      await expect(page.getByRole('textbox', { name: 'Email To:' })).toBeVisible();
      await page.getByRole('textbox', { name: 'Email To:' }).fill(cancelEventEmailTo);
      await page.getByRole('textbox', { name: 'Email CC:' }).fill(cancelEventEmailCC);
      await page.getByRole('button', { name: 'Use Code Editor' }).click();

      const bodyArea = page
        .locator('#code_mirror_template_editor');
      await bodyArea.press('ControlOrMeta+A');
      await bodyArea.press('Backspace');
      await bodyArea.fill(bodyContent); 

      awaitResponse = page.waitForResponse(res =>
        res.url().includes('emailTemplates/_LEAF_cancel_notification_body') && res.status() === 200
      );
      await page.getByRole('button', { name: 'Save Changes' }).click();
      await awaitResponse;

      //trigger the Cancel Notice
      await deleteTestRequestByRequestID(page, requestId);
      requestIsCancelled = true;

      //Confirm recipients set in To/Cc and field formatting
      await page.goto('http://host.docker.internal:5080/');
      await page.waitForLoadState('load');
      await confirmEmailRecipients(page, cancelEventEmailSubject, expectedCancelEmailRecipients);
      await confirmEmailRecipients(page, cancelEventEmailSubject, cancelEventExpectedCcRecipients, true);


      await expect(page.getByText(cancelEventEmailSubject).first()).toBeVisible();
      await page.getByText(cancelEventEmailSubject).first().click();
      emailFound = true;
      const dangerBtn = page.getByRole('button', { name: 'Disable (DANGER!)' });
      const dangerBtnCount = await dangerBtn.count();
      if(dangerBtnCount > 0) {
        await dangerBtn.click();
      }
      //test body content for Email class mediated Custom Event
      await confirmFieldFormatting(page);

    } finally {
      /* POST RUN CLEANUP */
      //if the Cancel Notification template was customizated, restore it
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

      if(emailFound === true) {
        await page.goto('http://host.docker.internal:5080/');
        await page.waitForLoadState('load');
        await page.getByText(cancelEventEmailSubject).first().click();
        await page.getByRole('button', { name: 'Delete' }).click();
        await expect(page.getByText(cancelEventEmailSubject)).toHaveCount(0);
      }

      //restore the Test Case request and move it back
      if(requestIsCancelled === true) {
        await printAdminMenuChangeStep(page, requestId, 'General Workflow - Requestor Followup');
        await expect(page.locator('span.buttonNorm', { hasText: 'Restore Request' })).toBeVisible();
        awaitResponse = page.waitForResponse(res =>
          res.url().includes('ajaxIndex.php?a=restore') && res.status() === 200
        );
        await page.locator('span.buttonNorm', { hasText: 'Restore Request' }).click();
        await awaitResponse;
      }

      //delete the custom event
      if(customEventAddedToWorkflow === true) {
        await page.goto(LEAF_URLS.WORKFLOW_EDITOR_WF + "1");
        await deleteWorkflowEvent(page, uniqueEventName.replace(/[^a-z0-9]/gi, '_'), uniqueDescr);
      }

      page.goto(requestURL);
      await page.getByRole('button', { name: 'Edit Title'}).click();
      await expect(page.locator('#title')).toBeVisible();
      await page.locator('#title').fill(testCaseRequestTitle);
      await page.getByRole('button', { name: 'Save Change' }).click();
      await expect(page.locator('#requestTitle')).not.toHaveText(tempTestRequestTitle);
    }
  });
});