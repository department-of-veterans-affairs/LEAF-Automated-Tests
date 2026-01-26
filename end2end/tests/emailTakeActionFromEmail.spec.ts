import { test, expect, Page } from '@playwright/test';
import {
  awaitPromise, loadWorkflow, deleteWorkflowEvent,
  confirmEmailRecipients, LEAF_URLS, deleteTestRequestByRequestID, getRandomId
} from '../leaf_test_utils/leaf_util_methods.ts';
    const requestId = 952;

test.describe.configure({ mode: 'default' });

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

test.describe('LEAF-5043 - Take Action From Email', () => {
  // Run everything in order; we rely on side effects from previous tests.
  test.describe.configure({ mode: 'serial' });


  test('1. Set up email template with {{$takeAction}}', async ({ page }) => {
    // editing the existing next approver template
    const tmplUrl ='https://host.docker.internal/Test_Request_Portal/admin/?a=mod_templates_email&file=LEAF_notify_next_body.tpl&name=Notify+Next+Approver&subjectFile=LEAF_notify_next_subject.tpl&emailToFile=LEAF_notify_next_emailTo.tpl&emailCcFile=LEAF_notify_next_emailCc.tpl';

    await page.goto(tmplUrl);
        
    // if we are on a run where this is edited, restore original, we will want to clean this up in the end
    if(await page.getByRole('button', { name: 'Restore Original' }).count()){

        await page.getByRole('button', { name: 'Restore Original' }).click();
        await page.getByRole('button', { name: 'Yes' }).click();

    }

    
    await page.locator('.trumbowyg-editor').fill('');
    // Insert the variable we need for later approval buttons
    await page.locator('.trumbowyg-editor').click();
    await page.locator('.trumbowyg-editor').fill('Please approve this request: {{$takeAction}}');

    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Verify the variable is present in the preview area
    await expect(page.locator('#codeContainer'))
      .toContainText('{{$takeAction}}');
  });

  test('2. Setup the approve between step 2  and Followup', async ({ page }) => {
    const viewUrl = `https://host.docker.internal/Test_Request_Portal/admin/?a=workflow&workflowID=1`;
      const notifyNextLabel = 'Email - Notify the next approver';

    await page.goto(viewUrl);
    await loadWorkflow(page, "1");
    let awaitResponse = page.waitForResponse(res =>
      res.url().includes('events') && res.status() === 200
    );
    await page.locator('#jsPlumb_1_51').click();
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

  test('3. Change current step of request #952 to Step 2', async ({ page }) => {
    const viewUrl = `https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=952`;
    await page.goto(viewUrl);
    const awaitResponse = page.waitForResponse(res =>
      res.url().includes('index.php?a=printview') && res.status() === 200
    );
    await printAdminMenuChangeStep(page, "952", 'General Workflow: Step 2');

    await awaitResponse;
    
  
        // now that it is on the right step lets hit approve so we can send that email
    //await page.getByRole('button', { name: 'Approve' }).click();
    await expect(page.locator('#button_step10_approve')).toBeVisible();

    await page.locator('#button_step10_approve').click();
    //
    
  });

  test('4. Click the email link', async ({ page }) => {
    // check on the email and click approve
    const emailSubject = `Action needed: General Form (#${requestId}) in`
    await page.goto('http://host.docker.internal:5080/');
    await page.waitForLoadState('load');


    await expect(page.getByText(emailSubject).first()).toBeVisible();
   

    await page.getByText(emailSubject).first().click();

  const iframeLocator = page.frameLocator('iframe[class="htmlview"]');

  // 3. Use the frame locator to find the element inside the iframe and click it
  // Replace 'button.submit-button' with the selector for the item you want to click
  const itemToClick = iframeLocator.locator('#dependency_action_-2_approve');
  await itemToClick.click();
    
    //await expect(page.locator('#dependency_action_-2_approve')).toBeVisible();

    //await page.locator('#dependency_action_-2_approve').click()

    //await page.getByRole('button', { name: 'Approve' }).click();

  });

});
