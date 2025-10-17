import { test, expect, Page } from '@playwright/test';

  test('Enforce Minimum Character Limit in Justification Field', { tag: ['@LEAF-5017'] }, async ({ page }) => {
    const requestId = '5'; ////LEAF Secure Form ID
    
    await page.goto(`https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=${requestId}`);
    await page.waitForLoadState('load');
    
    const messageText ='Minimum 25 characters required.';
    const textBoxErrorMsg = 'Please provide a more detailed justification. Minimum 25 characters required.';
    const returnRequestorButton = page.getByRole('button', { name: 'Return to Requestor' });
    const messageBoxText = page.getByRole('textbox',{name: 'Justification for collection' });
    const myButton = page.locator('#nextQuestion');

    //Verify Save
        await expect(
            page.getByRole('button', { name: 'Edit Justification for' }),
            `Edit Justification Field is Present`
            ).toBeVisible();
        page.getByRole('button', { name: 'Edit Justification for' }).click();
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

    // (await expect(page.getByRole('button', { name: 'Re-Submit Request' })).toBeVisible();)
    if(await returnRequestorButton.isVisible())
    {
        //Verify Justification field save when editing the Form
        await expect(
            page.getByRole('button', { name: 'Return to Requestor' }),
            `Return to Requestor button is visible for Request ${requestId}`
        ).toBeVisible();
        await page.getByRole('button', { name: 'Return to Requestor' }).click();
        await expect (page.getByText('Returned to Requestor')).toBeVisible();
        await page.reload();
       // await page.waitForLoadState('load');

        await expect(
            page.getByRole('button', { name: 'Edit this form' }),
            `Edit the Form button is visible`
        ).toBeVisible();
     
        await page.getByRole('button', { name: 'Edit this form' }).click();
        await page.waitForLoadState('load');

        const element = page.locator('#xhr').filter({ hasText: 'userName:VTRSHHZOFIA' });
        await element.waitFor();

        await page.locator('#save_indicator').click();
        await page.locator('#nextQuestion').click();
     
        const errorMessageLocator = page.getByText('Please provide a more');
        await messageBoxText.press('ControlOrMeta+a');
        await messageBoxText.fill('Testing');
        await myButton.click();

        await expect(page.getByText(messageText).first()).toBeVisible();
        const errorMessageText = await errorMessageLocator.textContent();

        await messageBoxText.press('ControlOrMeta+a');
        await messageBoxText.fill(messageText);
        await myButton.click();

        await expect(page.getByText('Please review your request'),
        'Justification verified, Validated that the Justification textbox has 25 char or more'
        ).toBeVisible();

    }

  });