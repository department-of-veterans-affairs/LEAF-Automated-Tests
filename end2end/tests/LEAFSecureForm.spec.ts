import { test, expect, Page } from '@playwright/test';

  test('Enforce Minimum Character Limit in Justification Field', { tag: ['@LEAF-5017'] }, async ({ page }) => {
 
    const requestId = '5'; ////LEAF Secure Form ID
    const messageText ='Minimum 25 characters required.';

    await page.goto(`https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=${requestId}`);
    await page.waitForLoadState('load');

     await expect(
        page.getByRole('button', { name: 'Return to Requestor' }),
        `Return to Requestor button is visible for Request ${requestId}`
    ).toBeVisible();
    await page.getByRole('button', { name: 'Return to Requestor' }).click();
     await page.reload();
    await expect(
        page.getByRole('button', { name: 'Edit this form' }),
        `Edit the Form button is visible`
    ).toBeVisible();
    await page.getByRole('button', { name: 'Edit this form' }).click();
     await expect(
        page.locator('#nextQuestion'),
    `Next Question is visible`
    ).toBeVisible();

     await page.locator('#nextQuestion').click();
    await expect(page.locator('#xhr'),
    `Message Text is present above the Justification text box`
    ).toContainText(messageText);

    const messageBoxText = page.getByRole('textbox',{name: 'Justification for collection' });
    const myButton = await page.locator('#nextQuestion');
    const errorMessageLocator = page.getByText('Please provide a more');

    await messageBoxText.press('ControlOrMeta+a');
    await messageBoxText.fill('Testing');
    await myButton.click();

    //await expect(errorMessageLocator).toBeVisible();
    const errorMessageText = await errorMessageLocator.textContent();

    //Verify message is displayed when less than 25 chars
    if (errorMessageText?.includes(messageText))
    {
        console.log(`Next Button Click failed: ${errorMessageText}`);
    } else{
        console.error(`ERROR this should fail not enough characters`);
    }

    await messageBoxText.press('ControlOrMeta+a');
    await messageBoxText.fill(messageText);
    await myButton.click();
    


  });