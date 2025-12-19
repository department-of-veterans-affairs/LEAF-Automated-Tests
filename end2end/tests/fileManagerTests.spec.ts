import { test, expect } from '@playwright/test';


const toleranceInSeconds = 300; //only want to confirm timestamps are local time - low precision to account for test time

test.describe ('File Manager Tests', () => {

  let testFileName:any = null;

test.beforeEach( async ({ page }) => {

  //Reset filename before each test
  testFileName = null;

  //Go to File Manager and verify no files exist
   await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_file_manager');

  const parentDiv = page.locator('#fileList >> div');
  const rows = parentDiv.locator('table tbody tr');
  const rowCount = await rows.count();

  console.log(`There are ${rowCount} rows in the File Manager table.`);

  if(rowCount > 0) {
    for (let i = 0; i < rowCount; i++) {
      const deleteRow = rows.nth(i).locator('td:nth-child(4) a'); // Always delete the first row
      await deleteRow.click();

      await expect(
        page.getByRole('button', { name: 'Yes' }),
        'Delete File'
      ).toBeVisible();

      await page.getByRole('button', { name: 'Yes' }).click();
    }
  }   

});

/**
 * end2end test for LEAF 5075
 */
test('Upload .mjs files to File Manager', async ({ page }, testInfo) => {

  expect(testInfo.title).toBe('Upload .mjs files to File Manager');

  let fileUploaded = false;
  testFileName = '../files/LEAF-5086.mjs';

  try {

    // Go to file manager and upload test .mjs file
   // await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_file_manager');
    await page.getByRole('button', { name: 'Upload File' }).click();
    await page.getByLabel('Select file to upload').setInputFiles('./artifacts/LEAF-5086.mjs');

    // Verify file has been uploaded
    await expect(page.locator("[id$='_0_file']")).toContainText('../files/LEAF-5086.mjs');
    fileUploaded = true;

    // Click on file link and verify it opened with the correct content
    const filePromise = page.waitForResponse(
          res => res.url().includes('files/LEAF-5086.mjs') && res.status() === 200
    );
      
    await page.getByRole('link', { name: '../files/LEAF-5086.mjs' }).click();
    await expect(page.getByText('This is a test file for LEAF 5075 / LEAF 5086')).toBeVisible();

    // Verify that the content type is 'text/javascript'
    const fileRes = await filePromise;
    const headerContentType = fileRes.headers()?.['content-type'] ?? '';
    expect(headerContentType).toBe('text/javascript');

  } finally {

    // if the file was uploaded successfully delete it
    if(fileUploaded) {
      await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_file_manager');
      await page.locator("[id$='_0_delete']").getByRole('link', { name: 'Delete' }).click();
      await page.getByRole('button', { name: 'Yes' }).click();
    }
  }
});

test ('Verify File Manager Timestamp',  async ({ page }, testInfo) => {

  expect(testInfo.title).toBe('Verify File Manager Timestamp');

    const fileLocationName = '../files/LEAF-5005.txt';
    const fileSize = '9 B';
    testFileName = fileLocationName;

   // await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_file_manager');

    await expect(page.getByRole('button', { name: 'Upload File' })).toBeVisible();
    await expect(page.getByRole('heading')).toContainText('File Manager');
    await page.getByRole('button', { name: 'Upload File' }).click();

    const awaitFiles = page.waitForResponse(res =>
      res.url().includes('system/files') && res.status() === 200
    );
    await page.getByLabel('Select file to upload').setInputFiles(`./artifacts/LEAF-5005.txt`);
    await expect(page.getByRole('heading')).toContainText('File Manager');
    await awaitFiles;

    const nowDateStamp = new Date();
    const currentDateStamp = nowDateStamp.toLocaleTimeString();

    const mainDiv = page.locator('#fileList >> div');
    const rows = mainDiv.locator('table tbody tr');

    //Verify Size Column is present
    await expect(
      page.getByRole('columnheader', { name: 'Sort by Size' }),
      'Size Column Header is present'
    ).toBeVisible();

    const rowCount = await rows.count();
  for (let i = 0; i < rowCount; i++) {
    const anchorText = await rows.locator('a').nth(i).innerText();
    if(anchorText?.includes(fileLocationName)) {
       
        const cellTime = await rows.nth(i).locator('td:nth-child(2)').innerText();

        const displayedTimeSplit = cellTime.split(" ", 2 );

        const displayTimeStamp = displayedTimeSplit[1];

        const updatedSytemTimeString = currentDateStamp.replace(/(AM|PM)/, "").trim();

        const [sysHours, sysMinutes, sysSeconds] = updatedSytemTimeString.split(':').map(Number);
        const systemTimeStamp = (sysHours * 3600 + sysMinutes * 60 + sysSeconds) * 1000; // Convert to milliseconds

        const [displayHours, displayMinutes, displaySeconds] = displayTimeStamp.split(':').map(Number);
        const displayedTimeStamp = (displayHours * 3600 + displayMinutes * 60 + displaySeconds) * 1000; // Convert to milliseconds

        const timeDiffernce = Math.abs(displayedTimeStamp-systemTimeStamp);
        expect(timeDiffernce).toBeLessThan(toleranceInSeconds *1000);
        expect(timeDiffernce).toBeGreaterThanOrEqual(0);

        //Verify the Size Column value
        const cellSize = await rows.nth(i).locator('td:nth-child(3)').innerText();
        expect(cellSize).toBe(fileSize);
       
        //Delete File
        const deleteRow = rows.nth(i).locator('td:nth-child(4) a');
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


test.afterEach(async ({ page },  testInfo) => {
console.log(`Finished ${testInfo.title} with status ${testInfo.status}`); 

if(testInfo.status !== testInfo.expectedStatus) {
 console.log(`${testInfo.title} has failed.`);
//Delete file if it exists
  const parentDiv = page.locator('#fileList >> div');
  const rows = parentDiv.locator('table tbody tr');
  const rowCount = await rows.count();

  console.log(`There are ${rowCount} rows in the File Manager table.`);


    for (let i = 0; i < rowCount; i++) {
      console.log(`Checking row ${i} for file ${testFileName}`); 
      console.log(`Row ${i} text: ${(await rows.locator('a').nth(i).innerText())}`);
      console.log(`Looking for file name: ${testFileName}`);

      if(await rows.nth(i).locator('td:nth-child(1) a').innerText().then(text => text.includes(testFileName))) {
          console.log(`Found file ${testFileName} in row ${i}, deleting it.`);
   
          const deleteRow = rows.nth(i).locator('td:nth-child(4) a');
          await deleteRow.click();

          await expect(
            page.getByRole('button', { name: 'Yes' }),
            'Delete File'
          ).toBeVisible();

          await page.getByRole('button', { name: 'Yes' }).click();
        }
     }


     
}

});

});//End of Describe  