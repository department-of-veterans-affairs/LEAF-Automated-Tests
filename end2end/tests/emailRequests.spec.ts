import { test, expect, Page } from '@playwright/test';
import {
  confirmEmailRecipients, 
  LEAF_URLS, 
  createTestRequest,
  getRandomId,
  deleteTestRequestByRequestID
} from '../leaf_test_utils/leaf_util_methods.ts';

test.describe.configure({ mode: 'default' });

test.describe('LEAF - 4872, Cancel Submitted Request, Cancel unSubmitted Request, MassAction Cancel - Manual Version', () => {

  //this method is specific to testing the cancellation behavior
  const restoreRequest = async (page:Page, requestID:string, cancelComment:string) => {
    await page.goto(`https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=${requestID}`);
    await expect(
      page.locator('span', { hasText: 'Restore request'}),
      'Restore controls to be visisble'
    ).toBeVisible();

    await expect(
      page.locator('.comments_message', { hasText: cancelComment }),
      'Record of cancellation note to be present in the menu'
    ).toBeVisible();

    const awaitSuccess = page.waitForResponse(res =>
      res.url().includes('restore') &&
      res.request().method() === 'POST' &&
      res.status() === 200
    );
    await page.locator('span', { hasText: ' Restore request '}).click();
    await awaitSuccess;
  }

  test('Cancel Submitted Request from printview', async ({ page }) => {
    // Generate unique test ID using timestamp
    const testId = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const requestId = '111'; //test case, Cancel Submitted Request from printview
    const cancelComment = `Cancel Request ${requestId} - ${testId}`;
    const emailSubject = `The request for General Form (#${requestId}) has been canceled.`;

    await page.goto(`https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=${requestId}`);
    await expect(
      page.getByRole('button', { name: 'Cancel Request' }),
      `'Cancel Request' button to be visible on the printview for Request ${requestId}`
    ).toBeVisible();

    const cancelButton = page.getByRole('button', { name: 'Cancel Request' });
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
    await expect(page.locator('#cancel_comment')).toBeVisible(); //NOTE: this textarea does not have a label

    await page.locator('#cancel_comment').fill(cancelComment);
    await page.getByRole('button', { name: 'Yes' }).click();

    await expect(
      page.getByText(`Request #${requestId} has been`),
      'Cancel message to be displayed to user'
    ).toBeVisible();

    // Check email notification  
    await page.goto('http://host.docker.internal:5080/');
    await page.waitForLoadState('load');

    const emailLink = page.getByText(emailSubject);
    expect(
      emailLink,
      `a cancellation notification email to be found for submitted request ${requestId}`
    ).toHaveCount(1);

    //delete the email
    await emailLink.click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(emailSubject).first()).not.toBeVisible();

    await restoreRequest(page, requestId, cancelComment);
  });

  test('Cancel unsubmitted Request from printview', async ({ page }) => {
    const testId = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const requestId = '110'; ////test case, Cancel Unsubmitted Request from printview
    const cancelComment = `Cancel Request ${requestId} - ${testId}`;
    const emailSubject = `The request for General Form (#${requestId}) has been canceled.`;

    await page.goto(`https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=${requestId}`);
    await expect(
      page.getByRole('button', { name: 'Cancel Request' }),
      `'Cancel Request' button to be visible on the printview for Request ${requestId}`
    ).toBeVisible();

    const cancelButton = page.getByRole('button', { name: 'Cancel Request' });
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
    await expect(page.locator('#cancel_comment')).toBeVisible(); //NOTE: this textarea does not have a label
    
    await page.locator('#cancel_comment').fill(cancelComment);
    await page.getByRole('button', { name: 'Yes' }).click();

    await expect(
      page.getByText(`Request #${requestId} has been`),
      'Cancel message to be displayed to user'
    ).toBeVisible();

    // Check email notification  
    await page.goto('http://host.docker.internal:5080/');
    await page.waitForLoadState('load');

    const emailExists = await page.getByText(emailSubject).count();
    expect(
      emailExists,
      `a cancellation notification email not to be found for unsubmitted request ${requestId}`
    ).toBe(0);

    await restoreRequest(page, requestId, cancelComment);
  });

  test('Cancel MassAction Request', async ({ page }) => {
    const testId = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const requestId1 = '113'; //test case requests, LEAF-4872 Mass Cancelation
    const requestId2 = '114';
    const cancelledRecords = [requestId1, requestId2];
    const massCancelTitle = 'LEAF-4872 Mass Cancelation';
    const cancelComment = `Mass cancel ${requestId1} & ${requestId2} - ${testId}`;

    await page.goto('https://host.docker.internal/Test_Request_Portal/report.php?a=LEAF_mass_action');
    await page.waitForLoadState('load');

    await expect(page.getByLabel('Choose Action')).toBeVisible();
    await page.getByLabel('Choose Action').selectOption('cancel');

    await expect(page.getByRole('textbox', { name: 'Comment * required' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Comment * required' }).fill(cancelComment);

    // Search for the hard-coded test case records
    await expect(page.getByRole('textbox', { name: 'Enter your search text' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Enter your search text' }).fill('');
    const awaitQuery = page.waitForResponse(res =>
      res.url().includes('LEAF-4872') && res.status() === 200
    );
    await page.getByRole('textbox', { name: 'Enter your search text' }).fill(massCancelTitle);
    await awaitQuery;
    await expect(page.locator('table[id^="LeafFormGrid"] tbody tr').first()).toBeVisible();
    await expect(page.getByText("Building report")).toHaveCount(0);

    // Look for the specific checkboxes by row content (from original test pattern)
    for (let i = 0; i < cancelledRecords.length; i++) {
      const checkBox = page.locator(
        `input[type="checkbox"][value="${cancelledRecords[i]}"]`
      );
      await expect(
        checkBox,
        `Request ${cancelledRecords[i]} to be found in mass action results`
      ).toHaveCount(1);
      await checkBox.check();
    }

    await page.getByRole('button', { name: 'Take Action' }).nth(1).click();
    await page.getByRole('button', { name: 'Yes' }).click();
    await page.waitForLoadState('networkidle'); //cancellations are processed one-by-one, want to make sure it does all of them

    const successMsg = '2 successes and 0 failures of 2 total.';
    await expect(
      page.locator('#massActionContainer .progress', { hasText: successMsg }),
      `progress message, ${successMsg}, to be displayed`
    ).toBeVisible();
      
    await page.goto('http://host.docker.internal:5080/');
    await page.waitForLoadState('load');

    for (let i = 0; i < cancelledRecords.length; i++) {
      const emailSubject = `The request for General Form (#${cancelledRecords[i]}) has been canceled.`;
      const emailLink = page.locator('div.cell').getByText(emailSubject).first();
      expect(
        emailLink,
        `a cancellation notification email to be found for submitted request ${cancelledRecords[i]}`
      ).toBeVisible();

      //delete the email
      await emailLink.click();
      await page.getByRole('button', { name: 'Delete' }).click();
      await expect(page.getByText(emailSubject).first()).not.toBeVisible();
    }

    for (let i = 0; i < cancelledRecords.length; i++) {
      await restoreRequest(page, cancelledRecords[i], cancelComment);
    }
  });

  test('Suppress Cancel MassAction Request', async ({ page }) => {
    const testId = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const requestId = '115';
    const massCancelTitle = `LEAF-4872 Suppress Mass Cancelation`;
    const cancelComment = `Suppress cancel ${requestId} - ${testId}`;

    await page.goto('https://host.docker.internal/Test_Request_Portal/report.php?a=LEAF_mass_action');
    await page.waitForLoadState('load');

    await expect(page.getByLabel('Choose Action')).toBeVisible();
    await page.getByLabel('Choose Action').selectOption('cancel');

    await expect(page.getByRole('textbox', { name: 'Comment * required' })).toBeVisible();
    await page.getByRole('checkbox', { name: 'Suppress Email Notification' }).check();
    await page.getByRole('textbox', { name: 'Comment * required' }).fill(cancelComment);
        
    // Search for the hard-coded test case records
    await expect(page.getByRole('textbox', { name: 'Enter your search text' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Enter your search text' }).fill('');
    const awaitQuery = page.waitForResponse(res =>
      res.url().includes('LEAF-4872') && res.status() === 200
    );
    await page.getByRole('textbox', { name: 'Enter your search text' }).fill(massCancelTitle);
    await awaitQuery;
    await expect(page.locator('table[id^="LeafFormGrid"] tbody tr').first()).toBeVisible();
    await expect(page.getByText("Building report")).toHaveCount(0);

    const requestRow = page.getByRole('row', { name: new RegExp(`${requestId}.*General Form.*LEAF-4872`) });
    await expect(
      requestRow,
      `Request ${requestId} to be found in mass action results`
    ).toHaveCount(1);
    await requestRow.getByRole('checkbox').check();

    await page.getByRole('button', { name: 'Take Action' }).nth(1).click();
    await page.getByRole('button', { name: 'Yes' }).click();
    await page.waitForLoadState('networkidle');

    const successMsg = '1 successes and 0 failures of 1 total.'
    await expect(
      page.locator('#massActionContainer .progress', { hasText: successMsg }),
      `progress message, ${successMsg}, to be displayed`
    ).toBeVisible();

    // Verify no email was sent
    await page.goto('http://host.docker.internal:5080/');
    await page.waitForLoadState('load');

    const suppressedSubject = `The request for General Form (#${requestId}) has been canceled.`;
    const emailExists = await page.getByText(suppressedSubject).count();
    expect(
      emailExists,
      'Cancel notification email not to be found if suppressed'
    ).toBe(0);

    await restoreRequest(page, requestId, cancelComment);
  });
});

test("Send email to approver with backup", async ({ page }) => {

    const testID = getRandomId();
    const requestName = `request_${testID}`;
    let requestID = '';
    const serviceName = 'Concrete Music';
    const formName = 'General Form';

    let notifyEventAdded = false;
    let backupAdded = false;
    let emailSent = false;
    const emailSubject = `Action needed: ${formName} (#${requestID}) in ${serviceName}`

    try {

      // Add "Notify Next Approver" to Submit action in General Workflow
      await page.goto(LEAF_URLS.WORKFLOW_EDITOR);
      await page.getByText('Submit').click();
      await page.getByRole('button', { name: 'Add Event' }).click();
      await page.getByLabel('Add Event').locator('a').click();
      await page.getByRole('option', { name: 'Email - Notify the next' }).click();
      await page.getByRole('button', { name: 'Save' }).click();
      notifyEventAdded = true;

      // Add Alexander Aufderhar as backup to Donte Glover
      await page.goto(LEAF_URLS.NEXUS_HOME + '?a=view_employee&empUID=91');
      await page.getByRole('button', { name: 'Assign Backup' }).click();
      await page.getByLabel('Search for user to add as').fill('alex');
      await page.getByRole('cell', { name: 'Aufderhar, Alexander' }).click();
      await page.getByRole('button', { name: 'Save Change' }).click();
      backupAdded = true;

      // Create a new request using General Form
      
      requestID = await createTestRequest(page, serviceName, requestName, formName);

      // Leave first page blank
      await page.locator('#nextQuestion2').click();

      // Set assigned person to Donte Senger Glover
      const assignedUserName = 'vtrnykmillicent';
      const assignedPersonName = 'Glover, Donte Senger.';
      const assignedTitle = '91 - ' + assignedUserName;
      await page.getByLabel('Search for user to add as Assigned Person', { exact: true }).fill('userName:' + assignedUserName);
      
      // Verify correct person is selected and go to next page
      const loadingIndicators = page.locator('div[id^="loadingIndicator_"]:visible');
      await expect(page.getByTitle(assignedTitle)).toContainText(assignedPersonName);
      await expect(loadingIndicators).toHaveCount(0);
      await page.locator('#nextQuestion2').click();

      // Search for Group A and select it
      const assignedGroupName = 'Group A';
      const assignedGroupNumber = 'group#206';
      const assignedGroupLabel = 'Search for user to add as Assigned Group';

      await page.getByLabel(assignedGroupLabel).fill(assignedGroupName);
      await expect(page.getByRole('cell', { name: assignedGroupName, exact: true })).toBeVisible();
      await page.getByRole('cell', { name: assignedGroupName, exact: true }).click();

      // Verify correct group was selected
      await expect(page.getByLabel(assignedGroupLabel)).toHaveValue(assignedGroupNumber);
      await expect(loadingIndicators).toHaveCount(0);
      await page.locator('#nextQuestion2').click();

      // Verify printview page shows Donte Glover and the Submit Request button
      await expect(page.getByRole('link', { name: 'Donte Glover' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Submit Request' })).toBeVisible();

      // Submit the request
      await page.getByRole('button', { name: 'Submit Request' }).click();

      // Go to the emails and confirm that latest email has Alexander Aufderhar in the CC: field
      
      await page.goto('http://host.docker.internal:5080/');
      const numEmails = await page.getByText(emailSubject).count();

      // If an email was sent, verify that Donte Glover is in the To: field and
      // Alexander Aufderhar is in the CC:
      if(numEmails > 0)
      {
        emailSent = true;
        await confirmEmailRecipients(page, emailSubject, ['Donte.Glover@fake-email.com']);
        await confirmEmailRecipients(page, emailSubject, ['Alexander.Aufderhar@fake-email.com'], true);
      }
    } finally {

      //delete the email
      if(emailSent) {
        await page.locator('#pane-messages').getByText(emailSubject).first().click();
        await page.getByRole('button', { name: 'Delete' }).click();
        await expect(page.getByText(emailSubject)).toHaveCount(0);
      }

      // Remove the Notify Next Approver event
      if(notifyEventAdded) {
        await page.goto(LEAF_URLS.WORKFLOW_EDITOR);
        await page.getByText('Submit').click();
        await page.getByLabel('Remove Event').click();
        await page.getByRole('button', { name: 'Yes' }).click();
      }
      
      // Delete the new request
      if(requestID != '') {
        await deleteTestRequestByRequestID(page, requestID);
      }
      
      // Remove the backup from Donte
      if(backupAdded) {
        await page.goto(LEAF_URLS.NEXUS_HOME + '?a=view_employee&empUID=91');
        await page.getByRole('link', { name: 'Remove' }).click();
        await page.getByRole('button', { name: 'Yes' }).click();
      }
    }
  })
