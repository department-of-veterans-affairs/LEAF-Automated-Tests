import { test, expect, Page } from '@playwright/test';


  test('Verify Template Editor Timestamp', { tag: ['@LEAF-4959'] }, async ({ page }) => {


    await page.goto('https://host.docker.internal/Test_Request_Portal/');

    await page.getByRole('link', { name: 'Admin Panel' }).click();
    await page.getByRole('button', { name: ' Template Editor Edit HTML' }).click();
  
    await page.getByRole('button', { name: 'login' }).click();
    await expect(page.getByText('There are no history files.')).toBeVisible();

    await page.getByRole('textbox', { name: 'Template Editor coding area.' }).fill('Testing');
    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    const nowTimeStamp = new Date();
    const currentTimeStamp = nowTimeStamp.toLocaleTimeString();
    console.log(currentTimeStamp);

    const dateMainDiv = page.locator('div.file_history_options_date >> div').first();
    const timeStamped = await dateMainDiv.innerText();
    console.log(timeStamped);
    let timeSplit = timeStamped.split("\n", 3 );
    const currentTimeStamped = timeSplit[1];

    //Verify message is displayed when less than 25 chars
    if (currentTimeStamped.includes(currentTimeStamp))
    {
        console.log(`NPassed`);
    } else{
        console.error(`Incorrect Time`);
    }

    //Restore Template
     await page.getByRole('button', { name: 'Restore Original' }).click();
     await page.getByRole('button', { name: 'Yes' }).click();

  });

 test('Verify Email Template Editor Timestamp', { tag: ['@LEAF-4959'] }, async ({ page }) => {

    
    await page.goto('https://host.docker.internal/Test_Request_Portal/');

    await page.getByRole('link', { name: 'Admin Panel' }).click();
    await page.getByRole('button', { name: ' Email Template Editor Add' }).click();

    await page.getByRole('button', { name: 'Automated Email Reminder' }).click();
    await page.getByRole('textbox', { name: 'Email To:' }).click();
    await page.getByRole('textbox', { name: 'Email To:' }).fill('fake@email.com');
    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();
    await expect(page.locator('#bodyarea')).toContainText('There are no history files.');
    await page.getByRole('button', { name: 'Save Changes' }).click();  

    const nowTimeStamp = new Date();
    const currentTimeStamp = nowTimeStamp.toLocaleTimeString();
    console.log(currentTimeStamp);

    const dateMainDiv = page.locator('div.file_history_options_date >> div').first();
    const timeStamped = await dateMainDiv.innerText();
    console.log(timeStamped);
    let timeSplit = timeStamped.split("\n", 3 );
    const currentTimeStamped = timeSplit[1];

    //Verify message is displayed when less than 25 chars
    if (currentTimeStamped.includes(currentTimeStamp))
    {
        console.log(`NPassed`);
    } else{
        console.error(`Incorrect Time`);
    }

    //Restore Template
     await page.getByRole('button', { name: 'Restore Original' }).click();
     await page.getByRole('button', { name: 'Yes' }).click();

    });

 test('Verify Programmer Editor Timestamp', { tag: ['@LEAF-4959'] }, async ({ page }) => {
      await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_templates_reports&file=example');
 
     await expect(page.getByRole('button', { name: 'New File' })).toBeVisible();
     await page.getByRole('button', { name: 'New File' }).click();
     await page.getByRole('textbox', { name: 'Filename:' }).fill('custom_dev_LEAF2');
     await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
     await page.getByRole('button', { name: 'Save' }).click();
  
     
     await page.getByRole('textbox', { name: 'Template Editor coding area.' }).fill('Testing LEAF Programmer ');
     await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();
     await page.getByRole('button', { name: 'Save Changes' }).click();

    const nowTimeStamp = new Date();
    const currentTimeStamp = nowTimeStamp.toLocaleTimeString();
    console.log(currentTimeStamp);

    const dateMainDiv = page.locator('div.file_history_options_date >> div').first();
    const timeStamped = await dateMainDiv.innerText();
    console.log(timeStamped);
    let timeSplit = timeStamped.split("\n", 3 );
    const currentTimeStamped = timeSplit[1];

    //Verify message is displayed when less than 25 chars
    if (currentTimeStamped.includes(currentTimeStamp))
    {
        console.log(`NPassed`);
    } else{
        console.error(`Incorrect Time`);
    }
  await expect(page.getByRole('button', { name: 'Delete File' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete File' }).click();
  await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
  await page.getByRole('button', { name: 'Yes' }).click();

 });

  test.only('Verify File Manager Timestamp', { tag: ['@LEAF-4959'] }, async ({ page }) => {

    const fileLocationName = '../files/LEAF-5005.txt';

    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_file_manager');

    await expect(page.getByRole('button', { name: 'Upload File' })).toBeVisible();
    await expect(page.getByRole('heading')).toContainText('File Manager');

    await page.getByRole('button', { name: 'Upload File' }).click();
    await page.getByRole('button', { name: 'Select file to upload' }).setInputFiles(`./artifacts/LEAF-5005.txt`);
    
    const nowTimeStamp = new Date();
    const currentTimeStamp = nowTimeStamp.toLocaleTimeString();
    console.log(currentTimeStamp);
    
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_file_manager');

    const mainDiv = page.locator('#fileList >> div');
    const rows = mainDiv.locator('table tbody tr');
    const rowCount =await rows.count();
    console.log(`Number of rows in the table: ${rowCount}`);

  for (let i=0; i<rowCount; i++)
  {
    const anchorText = await rows.locator('a').nth(i).innerText();
    console.log('Anchor Text (innerText):', anchorText);

    if(anchorText?.includes(fileLocationName))
    {
        //Verify Time
        const cellSelector = mainDiv.locator('table tbody tr td');
        console.log('Row ID2:');
         const cellTime = await rows.nth(i).locator('td:nth-child(2)').innerText();
            
         console.log('Row ID:', cellTime);

         let timeSplit = cellTime.split("\n", 3 );
        const currentTimeStamped = timeSplit[1];
        console.log('Row ID:', currentTimeStamped);

         //Verify message is displayed when less than 25 chars
         if (currentTimeStamped.includes(currentTimeStamp))
         {
                console.log(`NPassed`);
            } else{
               console.error(`Incorrect Time`);
          }

    }
  }
    
    await expect(page.getByRole('heading')).toContainText('File Manager');


  });
