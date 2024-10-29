import { test, expect } from '@playwright/test';

// When the underlying issue is fixed, we should expect this test to pass.
// Tests should be tagged with an associated ticket or PR reference
test.fail('column order is maintained after modifying the search filter', { tag: '@issue:LEAF-4482' }, async ({ page }, testInfo) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJBghmXEAGhDQDsM0BjfAeygEkARbAVmJFoAdo6psAPBxj4qAC2wBOAAyyOAc3wRsAQQByLAL5F0WRDggAbCJCwluvMPWwBeYaImJpJRZFUaQmgLokAVrXIEFB8QOHowJGBtEHkTJnxCFBAAFg4ARjSOdhDDNBg0CMQ02WcQXPywAHkAM2q4EyRpTSA%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAgBZmtBvjABZAK4kiAAhLQyy5GQAeHam3Qc8ARl79YCFBhwzjxyfUatoAc3Kr1mnXtbt8AJjNICyFrUTAAVgdpAgA5eQZ0BGYDIwBmbgBdIA%3D%3D&sort=N4Ig1gpgniBcIFYQBoQHsBOATCG4hwGcBjEAXyA%3D');

    await expect(page.getByLabel('Sort by Numeric')).toBeInViewport();
    await expect(page.locator('th').nth(4)).toContainText('Numeric');
    // Screenshot the original state
    let screenshot = await page.screenshot();
    await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });

    await page.getByRole('button', { name: 'Modify Search' }).click();
    await page.getByLabel('text', { exact: true }).click();
    await page.getByLabel('text', { exact: true }).fill('8000');
    await page.getByRole('button', { name: 'Next Step' }).click();
    await expect(page.getByText('Develop search filter')).not.toBeInViewport();

    await page.getByRole('button', { name: 'Generate Report' }).click();
    await expect(page.getByText('Select Data Columns')).not.toBeInViewport();
    // this is not necessary, but it makes the screenshot look cleaner
    await expect(page.getByRole('button', { name: 'Generate Report' })).not.toBeInViewport();

    await expect(page.getByLabel('Sort by Numeric')).toBeInViewport();
    // Screenshot the new state. The column order should be the same.
    screenshot = await page.screenshot();
    await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });

    await expect(page.locator('th').nth(4)).toContainText('Numeric');
});

test.only("Report Builder table displays selected data column", async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/");
    await expect(page.getByText('Report Builder Create custom')).toBeVisible({timeout: 5000});
    await page.getByText('Report Builder Create custom').click();
    await page.getByRole('button', { name: 'Next Step' }).click();
    const serviceColumn = page.locator('#indicatorList').getByText('Service', { exact: true });
    await expect(serviceColumn).toBeVisible({ timeout: 5000 });
    await serviceColumn.click();
    await page.locator('#indicatorList').getByText('Current Status').click();
    const typeOfRequest = page.getByText('Type of Request');
    await expect(typeOfRequest).toBeVisible({ timeout: 5000 });
    await typeOfRequest.click();
    await expect(page.getByLabel('Type of Request')).toBeChecked({ timeout: 5000 });
    await page.getByRole('button', { name: 'Generate Report' }).click();

    await expect(page.getByLabel('Sort by Service')).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel('Sort by Current Status')).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel('Sort by Type')).toBeVisible({ timeout: 5000 });
});

test("User Redirect to SearchFilter Page on Modify Filter", async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBCAXjJBjoGMALbKCHAoAbAG4Qs5AOZ0I2AIIA5EgF9S6LIhAYIwiJEmVqUOg2xtynMLyQAGabIXKQKgLrkAVhTQA7BChwwOgBXBHJfNDA0UyhFGhg5dxwGMCRgNRBhNBhIpABGW0LyLJywAHkAMwq4fTsVIA%3D%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAi2QoAri2a0G%2BMMzboOeHn0iwEKDDgXRiEHeln1Gi6stU8AukA");
    await expect(page.getByRole('button', { name: 'Modify Search' })).toBeVisible();
    await page.getByRole('button', { name: 'Modify Search' }).click();
    const verifyModifySearch = page.getByText('Step 1: Develop search filter');
    await expect(verifyModifySearch).toHaveText('Step 1: Develop search filter', { timeout: 5000 });
    await page.getByRole('cell', { name: 'Resolved' }).locator('a').click();
    await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();
    await page.getByRole('option', { name: 'Data Field' }).click();
    await page.getByRole('cell', { name: 'CONTAINS' }).locator('a').click();
    await page.getByRole('group', { name: 'Advanced Search Options' }).click();
    await page.locator('a').filter({ hasText: 'Any standard data field' }).click();
    await page.getByRole('option', { name: 'LEAF Developer Console: Supervisor' }).click();
    await page.getByRole('button', { name: 'Next Step' }).click();
    await page.getByText('Approval History').click();
    await expect(page.getByLabel('Approval History')).toBeChecked();
    await page.getByRole('button', { name: 'Generate Report' }).click();
});

test("Pop up model opens and updates title on title column value click", async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBCAXjJBjoGMALbKCHAoAbAG4Qs5AOZ0I2AIIA5EgF9S6LIhAYIwiJEmVqUOg2xtynMLyQAGabIXKQKgLrkAVhTQA7BChwwOgBXBHJfNDA0UyhFGhg5dxwGMCRgNRBhNBhIpABGW0LyLJywAHkAMwq4fTsVIA%3D%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAi2QoAri2a0G%2BMMzboOeHn0iwEKDDgXRiEHeln1Gi6stU8AukA");
    const verifyTitle = page.getByRole('cell', { name: 'Available for test case' }).first();
    await verifyTitle.click();
    const title = page.getByLabel('Report Title');
    await title.click();

    await title.fill('Available for TEST CHANGE TITLE');
    await page.getByRole('button', { name: 'Save Change' }).click();
    const changedTitle = page.getByRole('cell', { name: 'Available for TEST CHANGE TITLE' }).first()
    await expect(changedTitle).toHaveText('Available for TEST CHANGE TITLE', { timeout: 5000 });
    await changedTitle.click();
    await title.click();
    await title.fill('Available for test case');
    await page.getByRole('button', { name: 'Save Change' }).click();
    await expect(verifyTitle).toHaveText('Available for test case', { timeout: 5000 });
});

test("Navigate to a record when clicking on UID link", async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBCAXjJBjoGMALbKCHAoAbAG4Qs5AOZ0I2AIIA5EgF9S6LIhAYIwiJEmVqUOg2xtynMLyQAGabIXKQKgLrkAVhTQA7BChwwOgBXBHJfNDA0UyhFGhg5dxwGMCRgNRBhNBhIpABGW0LyLJywAHkAMwq4fTsVIA%3D%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAi2QoAri2a0G%2BMMzboOeHn0iwEKDDgXRiEHeln1Gi6stU8AukA");
    await page.getByRole('link', { name: '956' }).click();
    await expect(page.locator('#headerTab')).toContainText('Request #956');
});

test("Modify Develop Search Filter to Generate Report with shows No Result  ", async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/");
    await page.getByText('Report Builder Create custom').click();
    await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();
    await page.getByRole('option', { name: 'Initiator' }).click();
    await page.getByRole('button', { name: 'Next Step' }).click();
    await page.getByText('General Workflow - Group').click();
    await page.getByRole('button', { name: 'Generate Report' }).click();
    await expect(page.getByRole('cell', { name: 'No Results' })).toBeVisible({ timeout: 5000 });
});

test("Take Action allow user to perform necessary form Action", async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBCAXjJBjoGMALbKCHAoAbAG4Qs5AOZ0I2AIIA5EgF9S6LIhAYIwiJEmVqUOg2xtynMLyQAGabIXKQKgLrkAVhTQA7BChwwOgBXBHccBjAkYDUQYTQYNCjEAEZbdPJ4xLAAeQAzPLh9OxUgA&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAi2QoAri2a0G%2BMMzboOeHn0iwEKDDgWJ4RVFABCk5Giiz6jRdWWqeAXSA%3D");
    // Need to pass different row to Take Action
    const actionRow = page.getByRole('row', { name: '951 Take Action Available for' });
    if(await actionRow.isVisible()){
        await actionRow.locator('div').click();
        const validateForm = page.getByText('Group designated step (Office');
        await expect(validateForm).toBeVisible({timeout: 5000});
        await page.getByLabel('comment text area').click();
        await page.getByLabel('comment text area').fill('testing purpose');
        await page.getByRole('button', { name: 'Approve' }).click();
    }else {
        console.log("Row 951 does not exist, skipping Action");
    }
});

test("Test Share Report button", async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBCAXjJBjoGMALbKCHAoAbAG4Qs5AOZ0I2AIIA5EgF9S6LIhAYIwiJEmVqUOg2xtynMLyQAGabIXKQKgLrkAVhTQA7BChwwOgBXBHccBjAkYDUQYTQYNCjEAEZbdPJ4xLAAeQAzPLh9OxUgA&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAi2QoAri2a0G%2BMMzboOeHn0iwEKDDgWJ4RVFABCk5Giiz6jRdWWqeAXSA%3D");
    await page.getByRole('button', { name: 'Share Report' }).click();
    await page.getByText('https://host.docker.internal/').click();
    const emailReport = page.getByRole('button', { name: 'Email Report' });
    await expect(emailReport).toBeVisible({timeout: 5000});
    await emailReport.click();
});

test("Test JSON button working", async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBCAXjJBjoGMALbKCHAoAbAG4Qs5AOZ0I2AIIA5EgF9S6LIhAYIwiJEmVqUOg2xtynMLyQAGabIXKQKgLrkAVhTQA7BChwwOgBXBHccBjAkYDUQYTQYNCjEAEZbdPJ4xLAAeQAzPLh9OxUgA&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAi2QoAri2a0G%2BMMzboOeHn0iwEKDDgWJ4RVFABCk5Giiz6jRdWWqeAXSA%3D");
    await page.getByRole('button', { name: 'JSON' }).click();
    await expect(page.getByText('This provides a live data')).toBeVisible({timeout: 5000});
    await page.getByRole('button', { name: 'Shorten Link' }).click();
    await page.getByRole('button', { name: 'Expand Link' }).click();
    await page.getByRole('button', { name: 'Close' }).click();
});

test('validate create row button', async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/")
    await page.getByText('Report Builder Create custom').click();
    await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();
    await page.getByRole('option', { name: 'Type' }).click();
    await page.getByRole('cell', { name: 'Complex Form' }).locator('a').click();
    await page.getByRole('option', { name: 'General Form' }).click();
    await page.getByRole('button', { name: 'Next Step' }).click();
    await page.getByText('Type of Request').click();
    await page.getByText('Action Button').click();
    await page.locator('#indicatorList').getByText('General Form').click();
    await page.getByText('Assigned Person 2').click();
    await page.getByRole('button', { name: 'Generate Report' }).click();
    const createButton = page.getByRole('button', { name: 'Create Row' });
    await expect(createButton).toBeVisible({ timeout: 5000 });
    await createButton.click();
    await expect(createButton).toBeFocused();
});

test('modify search with And logical filter', async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJAYwIaQDmA9lAJ4CSAIiADQjEAO0Bp2AvHSDATgBbYAZqRgB9AKwQ8ABgDsXQgQjYAggDkaAX1rosiEBggAbCJCz0mLMG32d6PMPyTT6iyKo0hNAXXoArYjQAOwQUXxA4UjAkYG0QQlMqAjwkZBAAFi4AZhBwozQYNGjEAEZpcvp8wrAAeUFBOFNnTSA&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAonhFUUAEIBXZGijNaDfGGZt0HPDz6RYCFBhxqALMvqMwAWVkkiAAhLQyD5GQAeHapu27%2BBkLGomAAzBaqBADK0ADm5E4ubp7erOxc3AC6QA%3D%3D");
    await page.getByRole('button', { name: 'Modify Search' }).click();
    await page.getByLabel('add logical and filter').click();
    await page.getByRole('cell', { name: 'Resolved' }).locator('a').click();
    await page.getByRole('option', { name: 'Submitted', exact: true }).click();
    await page.getByRole('button', { name: 'Next Step' }).click();
    await page.locator('#indicatorList').getByText('General Form').click();
    await page.getByTitle('indicatorID: 7\nRadio').locator('span').click();
    await page.getByRole('button', { name: 'Generate Report' }).click();
    const updatedFilter = page.getByLabel('Sort by Radio');
    await expect(updatedFilter).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', {name: "Edit Labels"}).click();
    await page.getByRole('button', { name: 'Save Change' }).click();
});

test("fill textbox for multi line text", async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBeMkGOgYwAtsoI4KAGwBuELOQDmdCNgCCAORIBfUuiyIQHaRIYBPYqyq16jDS3Lsw3bADMGMAPoBWCDQAMAdlZTIcxSBU1bAwIQQhIcUpqKDoGZlZLa0Q3SWk%2FZQBdcgArCjQAOwQUEAK0MDRYqHkaGBksnAYwJGAVEAlwojoaJGQQABZWL3IAZhB6wTQYMqQARjd58gmpsAB5Gxs4cKQ3JSA%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAtGIQUGZrQb4wzNug54efSLARSR8xPCKooAIQCuyNFBn1GC6kpVr%2BmoRhzyALFbkEAsiZJEAAQk0GSByGQAHhx27Fy8ToLabgQA7F42AEqIcKiKcaoJGknCKWAAzBnyAMrQAObkwaHhUTGsBTwAukA");
    const firstText = page.getByRole("cell", { name: "test", exact: true });
    await firstText.click();
    const multiText = page.getByLabel("Multi line text", { exact: true });

    await multiText.click();
    await multiText.fill("test this is a test");
    await page.getByRole("button", { name: "Save Change" }).click();
    const changedText = page.getByRole('cell', { name: "test this is a test" });
    await expect(changedText).toBeVisible({ timeout: 5000 });

    await changedText.click();
    await multiText.click();
    await multiText.fill('test');
    await page.getByRole('button', { name: 'Save Change' }).click();
    await expect(firstText).toBeVisible({ timeout: 5000 });
});

test("Select multiple filter using AND/OR,", async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3");
    await page.getByRole('cell', { name: 'IS NOT' }).locator('a').click();
    await page.getByRole('option', { name: 'IS', exact: true }).click();
    await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();
    await page.getByRole('option', { name: 'Type', exact: true }).click();
    await page.getByRole('cell', { name: 'Complex Form' }).locator('a').click();
    await page.getByRole('option', { name: 'General Form' }).click();
    await page.getByLabel('add logical and filter').click();
    await page.getByRole('button', { name: 'Next Step' }).click();
    await page.getByRole('button', { name: 'Generate Report' }).click();
    const updateFilter = page.getByLabel("Sort by Title");
    await expect(updateFilter).toBeVisible({ timeout: 5000 });

    //Modify Search Filter using OR
    await page.getByRole('button', { name: 'Modify Search' }).click();
    await page.getByRole('row', { name: 'remove filter row AND Current' }).getByLabel('remove filter row').click();
    await page.getByLabel('add logical or filter').click();
    await page.getByRole('button', { name: 'Next Step' }).click();
    await page.getByRole('button', { name: 'Generate Report' }).click();
    await expect(updateFilter).toBeVisible({ timeout: 5000 });

});

test("Edit Report Title", async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBeMkGOgYwAtsoI4KAGwBuELOQDmdCNgCCAORIBfUuiyIQHaRIYBPYqyq16jDS3Lsw3bADMGMAPoBWCDQAMAdlZTIcxSBU1bAwIQQhIcUpqKDoGZlZLa0Q3SWk%2FZQBdcgArCjQAOwQUEAK0MDRYqHkaGBksnAYwJGAVEAlwojoaJGQQABZWL3IAZhB6wTQYMqQARjd58gmpsAB5Gxs4cKQ3JSA%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAtGIQUGZrQb4wzNug54efSLARSR8xPCKooAIQCuyNFBn1GC6kpVr%2BmoRhzyALFbkEAsiZJEAAQk0GSByGQAHhx27Fy8ToLabgQA7F42AEqIcKiKcaoJGknCKWAAzBnyAMrQAObkwaHhUTGsBTwAukA");
    await page.getByRole('cell', { name: 'TestForm_NonadminCannotCancelOwnSubmittedRecord_new' }).click();
    const reportTitle = page.getByLabel('Report Title');
    await reportTitle.click();
    await reportTitle.fill('TestForm_NonadminCannotCancelOwnSubmittedRecord_new_Title');
    await page.getByRole('button', { name: 'Save Change' }).click();
    const updatedTitle = page.getByRole('cell', { name: 'TestForm_NonadminCannotCancelOwnSubmittedRecord_new_Title' })
    await expect(updatedTitle).toHaveText("TestForm_NonadminCannotCancelOwnSubmittedRecord_new_Title");

    await updatedTitle.click();
    await reportTitle.click();
    await reportTitle.fill('TestForm_NonadminCannotCancelOwnSubmittedRecord_new');
    await page.getByRole('button', { name: 'Save Change' }).click();
    const revertedTitle = page.getByRole('cell', { name: 'TestForm_NonadminCannotCancelOwnSubmittedRecord_new' });
    await expect(revertedTitle).toHaveText("TestForm_NonadminCannotCancelOwnSubmittedRecord_new");

});

test("Check Single Line Text", async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJAVztASQBEQAaEAewAdoBDMCqbAXjJBnoGMALbNgc3oRsAQQByJAL6l0WRCE5D%2BjAJ7E21OgybzW5DmB7YAZoxgB9AKwRaABgDsAodgDyAJRDTZ2DBAA2EJBY5JpQ9IwsbAZGiLbkgpCiEp4AuuQAVhRoAHYIKCD4UABuaJzC5DloYGjhUGK0MMJpBYxgSMDSIPyBRPS0SMggAJxsACxsjuQAzCDNfmgwVUgAjLZr5POLYC7GxvhtsZJAA%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAizLoAbggrVaDfGGZt0HPDz6RYCFBhyLoxCLvTN5jJdRVqN%2FbUL2iwieEVRQAQgFdkaKGfoLZXYuXjtBE30CAE4AhQIAQRYWCABzKDIYAAIAcXRULwAHYNVQzQEdYSiwABY4iwBZLxIiLJJoMizkMgAPDisQ9TCtCKqnAHZ6xQAlRDhUEpthiocRRQBmKYIAZWhU8jaOrt7%2B1kGeAF0gA%3D");
    const firstText = page.getByRole("cell", { name: "test1" });
    await firstText.click();
    await page.getByLabel('Single line text', { exact: true }).click();
    await page.getByLabel('Single line text', { exact: true }).fill("test single line");
    await page.getByRole("button", { name: "Save Change" }).click();
    const singleLineText = page.getByRole("cell", { name: "test single line" });
    await expect(singleLineText).toHaveText("test single line");

    await singleLineText.click();
    await page.getByLabel('Single line text', { exact: true }).click();
    await page.getByLabel('Single line text', { exact: true }).fill("test1");
    await page.getByRole("button", { name: "Save Change" }).click();
    await expect(firstText).toHaveText("test1");
});