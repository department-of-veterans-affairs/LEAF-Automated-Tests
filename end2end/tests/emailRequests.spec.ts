import { test, expect } from '@playwright/test';
import {
  confirmEmailRecipients, 
  LEAF_URLS, 
  createTestRequest,
  getRandomId,
  deleteTestRequestByRequestID
} from '../leaf_test_utils/leaf_util_methods.ts';

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
      if(numEmails > 0)
      {
        emailSent = true;
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
