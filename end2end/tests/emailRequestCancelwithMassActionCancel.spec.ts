import { test, expect, Page } from '@playwright/test';

test.describe.configure({ mode: 'default' });

test.describe('LEAF - 4872, Cancel Submitted Request, Cancel unSubmitted Request, MassAction Cancel - Manual Version', () => {

  // Helper function to find an available test request - not resolved and available for test case
  async function prepareTestRequest(page: any, testId: string) {
    await page.goto('https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBCAXjJBjoGMALbKCHAoAbAG4Qs5AOZ0I2AIIA5EgF9S6LInBowwueSq16jLW3KcwvbDVE00wmgCM9AAgBmDF5FwuuNOPogMpAKyiBqGtgYEHqQkpTUUHQM2GYc3HyIAAzSsqGqALrkAFYUaAB2CCg4YHQArghFOAxgSMBqIMJoMDpIAIxZg%2BRdPWAA8m5uAa3ZKkA%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAi2QoAri2a0G%2BMMzboOeHn0iwEKDDgWJ4RVFABCk5Giiz6jRdWWqeAXSA%3D');
    
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#reportStats')).toHaveText(/records/);
    try {
      await expect(page.locator('table[id^="LeafFormGrid"] tbody tr').first()).toBeVisible();
      const recordsTable = page.locator('table[id^="LeafFormGrid"] tbody');
      const recordLinks = await recordsTable.locator('tr > td:first-child a').all();

      if (recordLinks.length === 0) {
        throw new Error('No existing records available');
      }
      
      const recordId = await recordLinks[0].textContent();
      if (!recordId) {
        throw new Error('Could not extract record ID');
      }
      
      return recordId.trim();
      
    } catch (findError) {
      console.log(`Could not find existing records: ${findError}`);
      console.log(`Falling back to creating new request for test ${testId}`);
      return await createNewRequest(page, testId, `LEAF-4872-Fallback-${testId}`);
    }
  }

  // Helper function to create a new request
  async function createNewRequest(page: any, testId: string, title: string) {
    await page.goto('https://host.docker.internal/Test_Request_Portal/?a=newform');
    const serviceDropdown = page.locator('#service_chosen');
    await expect(serviceDropdown).toBeVisible();
    await serviceDropdown.click();
    await page.getByRole('option', { name: 'AS - Service' }).click();
    
    // Reliable form filling with verification
    const titleField = page.getByRole('textbox', { name: 'Title of Request' });
    await titleField.waitFor({ state: 'visible' });
    await titleField.click();
    await titleField.fill('');
    await titleField.fill(title);
    
    // Verify the value was set correctly
    const actualValue = await titleField.inputValue();
    expect(
      actualValue,
      `Title field to be set correctly. Expected: ${title}, Got: ${actualValue}`
    ).toBe(title);

    await page.locator('label').filter({ hasText: 'General Form' }).locator('span').click();
    await page.getByRole('button', { name: 'Click here to Proceed' }).click();
    
    await expect(page.locator('#headerTab')).toBeVisible();

    const headerText = await page.textContent('#headerTab');
    const requestId = headerText?.split('#')[1];
    if (!requestId) {
      throw new Error(`Could not extract request ID for test ${testId}`);
    }

    console.log(`Created new request ${requestId} for test ${testId} (not submitted)`);
    return requestId;
  }

  // Helper to clean up emails
  async function cleanupEmails(page: any, subjectText: string) {
    await page.goto('http://host.docker.internal:5080/');
    await page.waitForLoadState('load');

    const emailElements = await page.locator(`text="${subjectText}"`).all();
    for (let email of emailElements) {
      await email.click();
      await page.getByRole('button', { name: 'Delete' }).click();
      await expect(
        email,
        `email with subject '${subjectText}' to be deleted`
      ).not.toBeVisible();
    }
  }

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