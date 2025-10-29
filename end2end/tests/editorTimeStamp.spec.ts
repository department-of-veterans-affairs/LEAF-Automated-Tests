import { test, expect, Page } from '@playwright/test';
import { uptime } from 'process';


  test('Verify Template Editor Timestamp', async ({ page }) => {


    await page.goto('https://host.docker.internal/Test_Request_Portal/');

    await page.getByRole('link', { name: 'Admin Panel' }).click();
    await page.getByRole('button', { name: ' Template Editor Edit HTML' }).click();

    await expect(page.getByText('Template Editor Template Tools')).toBeVisible();
    await page.getByRole('link', { name: 'login' }).click();
  
    await expect(page.getByText('There are no history files.')).toBeVisible();

    await page.locator('div:nth-child(9) > .CodeMirror-line').click();
    await page.getByRole('textbox', { name: 'Template Editor coding area.' }).fill('test');
    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    const nowTimeStamp = new Date();
    const currentSystemTimeStamp = nowTimeStamp.toLocaleTimeString();
    const dateMainDiv = page.locator('div.file_history_options_date >> div').first();
    const displayedTimeStamped = await dateMainDiv.innerText();
    
    let displayedTimeSplit = displayedTimeStamped.split("\n", 3 );
    const currentDisplayedTimeStamped = displayedTimeSplit[1];

    const updatedSytemTimeString = currentSystemTimeStamp.replace(/(AM|PM)/, "").trim();
    const updatedDisplayTimeString = currentDisplayedTimeStamped.replace(/(AM|PM)/, "").trim();

    const [sysHours, sysMinutes, sysSeconds] = updatedSytemTimeString.split(':').map(Number);
    const systemTimeStamp = (sysHours * 3600 + sysMinutes * 60 + sysSeconds) * 1000; // Convert to milliseconds

    const [displayHours, displayMinutes, displaySeconds] = updatedDisplayTimeString.split(':').map(Number);
    const displayedTimeStamp = (displayHours * 3600 + displayMinutes * 60 + displaySeconds) * 1000; // Convert to milliseconds
  
    expect(displayedTimeStamp).toBeCloseTo(systemTimeStamp);

    //Restore Template
     await page.getByRole('button', { name: 'Restore Original' }).click();
     await page.getByRole('button', { name: 'Yes' }).click();

  });

 test('Verify Email Template Editor Timestamp',  async ({ page }) => {

    
    await page.goto('https://host.docker.internal/Test_Request_Portal/');
    
    const fileName = 'LEAF_automated_reminder_body';
    await page.getByRole('link', { name: 'Admin Panel' }).click();
    await page.getByRole('button', { name: ' Email Template Editor Add' }).click();

    await page.getByRole('button', { name: 'Automated Email Reminder' }).click();
    await page.getByRole('textbox', { name: 'Email To:' }).click();
    await page.getByRole('textbox', { name: 'Email To:' }).fill('fake@email.com');
    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();
    await expect(page.locator('#bodyarea')).toContainText('There are no history files.');
   
   
    let savePromise = page.waitForResponse(res =>
    res.url().includes(`templateFileHistory/_${fileName}.tpl`) && res.status() === 200
    );
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await savePromise;

    const nowTimeStamp = new Date();
    const currentSystemTimeStamp = nowTimeStamp.toLocaleTimeString();
    const dateMainDiv = page.locator('div.file_history_options_date >> div').first();
    const displayedTimeStamped = await dateMainDiv.innerText();
    let displayedTimeSplit = displayedTimeStamped.split("\n", 3 );
    const currentDisplayedTimeStamped = displayedTimeSplit[1];
 
    const updatedSytemTimeString = currentSystemTimeStamp.replace(/(AM|PM)/, "").trim();
    const updatedDisplayTimeString = currentDisplayedTimeStamped.replace(/(AM|PM)/, "").trim();

    const [sysHours, sysMinutes, sysSeconds] = updatedSytemTimeString.split(':').map(Number);
    const systemTimeStamp = (sysHours * 3600 + sysMinutes * 60 + sysSeconds) * 1000; // Convert to milliseconds

    const [displayHours, displayMinutes, displaySeconds] = updatedDisplayTimeString.split(':').map(Number);
    const displayedTimeStamp = (displayHours * 3600 + displayMinutes * 60 + displaySeconds) * 1000; // Convert to milliseconds
  
    expect(displayedTimeStamp).toBeCloseTo(systemTimeStamp);

    //Restore Template
     await page.getByRole('button', { name: 'Restore Original' }).click();
     await page.getByRole('button', { name: 'Yes' }).click();

    });

 test ('Verify Programmer Editor Timestamp', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_templates_reports&file=example');
    
    const fileName = "custom_dev_LEAF2";
    await expect(page.getByRole('button', { name: 'New File' })).toBeVisible();
    await page.getByRole('button', { name: 'New File' }).click();
    await page.getByRole('textbox', { name: 'Filename:' }).fill(fileName);
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
     
    
    let savePromise = page.waitForResponse(res =>
      res.url().includes(fileName) && res.status() === 200
    );
 
    const element = page.getByRole('button', { name: 'Save' });
    await element.waitFor();
    await element.click();
    await savePromise;

    const txtBox = page.getByRole('textbox', { name: 'Template Editor coding area.' });
    txtBox.waitFor();
    txtBox.fill('Testing LEAF Programmer ');
    await expect(page.locator('#codeContainer')).toContainText('Testing LEAF Programmer ');

     //await page.getByRole('textbox', { name: 'Template Editor coding area.' }).fill('Testing LEAF Programmer ');
     //await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();
    const element2 = page.getByRole('button', { name: 'Save Changes' });
    await element2.waitFor();
    await element2.click();

    const nowTimeStamp = new Date();
    const currentSystemTimeStamp = nowTimeStamp.toLocaleTimeString();
    const dateMainDiv = page.locator('div.file_history_options_date >> div').first();
    const displayedTimeStamped = await dateMainDiv.innerText();
    const displayedTimeSplit = displayedTimeStamped.split("\n", 3 );
    const currentDisplayedTimeStamped = displayedTimeSplit[1];
    
    const updatedSytemTimeString = currentSystemTimeStamp.replace(/(AM|PM)/, "").trim();
    const updatedDisplayTimeString = currentDisplayedTimeStamped.replace(/(AM|PM)/, "").trim();

    const [sysHours, sysMinutes, sysSeconds] = updatedSytemTimeString.split(':').map(Number);
    const systemTimeStamp = (sysHours * 3600 + sysMinutes * 60 + sysSeconds) * 1000; // Convert to milliseconds

    const [displayHours, displayMinutes, displaySeconds] = updatedDisplayTimeString.split(':').map(Number);
    const displayedTimeStamp = (displayHours * 3600 + displayMinutes * 60 + displaySeconds) * 1000; // Convert to milliseconds
    
    const toleranceInSeconds = 1;  
    expect(displayedTimeStamp).toBeCloseTo(systemTimeStamp);

    await expect(page.getByRole('button', { name: 'Delete File' })).toBeVisible();
    await page.getByRole('button', { name: 'Delete File' }).click();
    await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
    await page.getByRole('button', { name: 'Yes' }).click();

 });

  test ('Verify File Manager Timestamp',  async ({ page }) => {

    const fileLocationName = '../files/LEAF-5005.txt';

    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_file_manager');

    await expect(page.getByRole('button', { name: 'Upload File' })).toBeVisible();
    await expect(page.getByRole('heading')).toContainText('File Manager');
    await page.getByRole('button', { name: 'Upload File' }).click();
    await page.getByRole('button', { name: 'Select file to upload' }).setInputFiles(`./artifacts/LEAF-5005.txt`);
    
    const nowDateStamp = new Date();
    const currentDateStamp = nowDateStamp.toLocaleTimeString();
    console.log("check1", currentDateStamp);
         
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_file_manager');

    const mainDiv = page.locator('#fileList >> div');
    const rows = mainDiv.locator('table tbody tr');
    const rowCount =await rows.count();
    

  for (let i=0; i<rowCount; i++)
  {
    const anchorText = await rows.locator('a').nth(i).innerText();
    
    if(anchorText?.includes(fileLocationName))
    {
        //Verify Date this test does not include Time
        const cellTime = await rows.nth(i).locator('td:nth-child(2)').innerText();

        const displayedTimeSplit = cellTime.split(" ", 2 );
        console.log("the Split", displayedTimeSplit);

        const displayTimeStamp = displayedTimeSplit[1];
        console.log("after", displayTimeStamp);
        
        const updatedSytemTimeString = currentDateStamp.replace(/(AM|PM)/, "").trim();

        const [sysHours, sysMinutes, sysSeconds] = updatedSytemTimeString.split(':').map(Number);
        const systemTimeStamp = (sysHours * 3600 + sysMinutes * 60 + sysSeconds) * 1000; // Convert to milliseconds

        const [displayHours, displayMinutes, displaySeconds] = displayTimeStamp.split(':').map(Number);
        const displayedTimeStamp = (displayHours * 3600 + displayMinutes * 60 + displaySeconds) * 1000; // Convert to milliseconds
        
        console.log("check1", systemTimeStamp);
        console.log("check2", displayedTimeStamp);
        expect(systemTimeStamp).toBeCloseTo(displayedTimeStamp);
        const deleteRow = rows.nth(i).locator('td:nth-child(3) a');
        await deleteRow.click();
        await expect(
          page.getByRole('button', { name: 'Yes' }),
          'Delete File'
        ).toBeVisible();
        await page.getByRole('button', { name: 'Yes' }).click();
      }
  }    
    await expect(page.getByRole('heading')).toContainText('File Manager');

  });
