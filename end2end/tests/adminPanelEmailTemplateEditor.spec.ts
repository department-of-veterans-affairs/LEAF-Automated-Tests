import { test, expect, Locator } from '@playwright/test';

//Setup Global Variables

//This test is to setup the event, this allows for testing of the email
test('Setup Events for Email Template', async ({ page }, testInfo) => {

    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/');
    await page.getByRole('button', { name: ' Workflow Editor Edit' }).click();
    await page.locator('a').filter({ hasText: 'General Workflow (ID: #1)' }).click();
    await page.getByRole('option', { name: 'General Workflow (ID: #1)' }).click();
    await page.locator('#jsPlumb_1_54').click();
   
    //Wait for Add Event Modal then click
    await expect(page.getByRole('button', { name: 'Add Event' })).toBeVisible();
    await page.getByRole('button', { name: 'Add Event' }).click();

   //Wait for Create Event to be present
    await expect(page.getByRole('button', { name: 'Create Event' })).toBeVisible();
    await page.getByRole('button', { name: 'Create Event' }).click();
   
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
    //Enter the required information to create the Event
    await page.getByLabel('Event Name:').fill('Unique_Name2');
    await page.getByLabel('Event Name:').press('Tab');
    await page.getByLabel('Short Description: Notify').fill('Unique2_Desc_Email');
    await page.getByLabel('Notify Requestor Email:', { exact: true }).check();
    await page.getByLabel('Notify Next Approver Email:', { exact: true }).check();
    await page.getByLabel('Notify Group:', { exact: true }).selectOption('206');
    
    //Screenshot the Event Creation information then save
    const screenshot = await page.screenshot()
    await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });

    await page.getByRole('button', { name: 'Save' }).click();  


 });
 //end of setup Test