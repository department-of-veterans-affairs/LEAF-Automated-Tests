import { test, expect, Page } from '@playwright/test';

  test('Enforce Minimum Character Limit in Justification Field', { tag: ['@LEAF-5017'] }, async ({ page }) => {
    const requestId = '5'; ////LEAF Secure Form ID
    
    await page.goto(`https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=${requestId}`);
    await page.waitForLoadState('load');
    
    const messageText ='Minimum 25 characters required.';
    const textBoxErrorMsg = 'Please provide a more detailed justification. Minimum 25 characters required.';
    const resubmitButton = page.getByRole('button', { name: 'Re-Submit Request' });
    const messageBoxText = page.getByRole('textbox',{name: 'Justification for collection' });

    //Check to see if the API has runned if not only check for Save

    // (await expect(page.getByRole('button', { name: 'Re-Submit Request' })).toBeVisible();)
    if( await resubmitButton.isVisible())
    {
        console.log(`API has not run only testing the Save Function`);
        //Verify Save 
        await page.getByRole('button', { name: 'Edit Justification for' }).click();
        await messageBoxText.press('ControlOrMeta+a');
        await messageBoxText.fill('Testing');
    
        await expect(
            page.locator('[id="-2_required"]')
        ).toContainText(textBoxErrorMsg);
        await expect(
            page.getByRole('button', { name: 'Save Change' }),
            `Save Change should be disabled when Justification is under 25 chars`
        ).toBeDisabled();
        await messageBoxText.press('ControlOrMeta+a');
        await messageBoxText.fill(messageText);
        await page.getByRole('button', { name: 'Save Change' }).click();
    } else //Else Statement
    {
        await expect(
            page.getByRole('button', { name: 'Return to Requestor' }),
            `Return to Requestor button is visible for Request ${requestId}`
        ).toBeVisible();

        //Verify Save 
        await page.getByRole('button', { name: 'Edit Justification for' }).click();
        await messageBoxText.press('ControlOrMeta+a');
        await messageBoxText.fill('Testing');
    
        await expect(
            page.locator('[id="-2_required"]')
        ).toContainText(textBoxErrorMsg);
        await expect(
            page.getByRole('button', { name: 'Save Change' }),
            `Save Change should be disabled when Justification is under 25 chars`
        ).toBeDisabled();
        await messageBoxText.press('ControlOrMeta+a');
        await messageBoxText.fill(messageText);
        await page.getByRole('button', { name: 'Save Change' }).click();

        //Verify Justification field save when editing the Form
        await page.getByRole('button', { name: 'Return to Requestor' }).click();
        await page.reload();
        await page.waitForLoadState('load');
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
    
        const myButton = await page.locator('#nextQuestion');
        const errorMessageLocator = page.getByText('Please provide a more');
        await messageBoxText.press('ControlOrMeta+a');
        await messageBoxText.fill('Testing');
        await myButton.click();

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

        await expect(page.getByText('Please review your request'),
        'Justification verified, Validated that the Justification textbox has 25 char or more'
        ).toBeVisible();

    }

  });