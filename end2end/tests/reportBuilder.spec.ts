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

test("Report Builder table displays selected data column", async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/");
    await page.getByText('Report Builder Create custom').click();
    await page.getByRole('button', { name: 'Next Step' }).click();
    await page.locator('#indicatorList').getByText('Service', { exact: true }).click();
    await page.locator('#indicatorList').getByText('Current Status').click();
    await page.getByText('Type of Request').click();
    await expect(page.getByLabel('Type of Request')).toBeChecked();
    await page.getByRole('button', { name: 'Generate Report' }).click();

    await expect(page.getByLabel('Sort by Title')).toBeVisible();
    await expect(page.getByLabel('Sort by Service')).toBeVisible();
    await expect(page.getByLabel('Sort by Current Status')).toBeVisible();
    await expect(page.getByLabel('Sort by Type')).toBeVisible();
});

test("User Redirect to SearchFilter Page on Modify Filter", async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBCAXjJBjoGMALbKCHAoAbAG4Qs5AOZ0I2AIIA5EgF9S6LIhAYIwiJEmVqUOg2xtynMLyQAGabIXKQKgLrkAVhTQA7BChwwOgBXBHJfNDA0UyhFGhg5dxwGMCRgNRBhNBhIpABGW0LyLJywAHkAMwq4fTsVIA%3D%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAi2QoAri2a0G%2BMMzboOeHn0iwEKDDgXRiEHeln1Gi6stU8AukA");
    await page.getByRole('button', { name: 'Modify Search' }).click();
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
    await page.getByRole('cell', { name: 'Available for test case' }).first().click();
    await page.getByLabel('Report Title').click();

    await page.getByLabel('Report Title').fill('Available for TEST CHANGE TITLE');
    await page.getByLabel('Report Title').press('Enter');
    await page.getByRole('button', { name: 'Save Change' }).click();
});

test("Connected forms open on UID link click", async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBCAXjJBjoGMALbKCHAoAbAG4Qs5AOZ0I2AIIA5EgF9S6LIhAYIwiJEmVqUOg2xtynMLyQAGabIXKQKgLrkAVhTQA7BChwwOgBXBHJfNDA0UyhFGhg5dxwGMCRgNRBhNBhIpABGW0LyLJywAHkAMwq4fTsVIA%3D%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAi2QoAri2a0G%2BMMzboOeHn0iwEKDDgXRiEHeln1Gi6stU8AukA");
    await page.getByRole('link', { name: '956' }).click();
    await expect(page.locator('#headerTab')).toContainText('Request #956');
});

test("Modify Search if updated Generate Report will shows No Result  ", async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/");
    await page.getByText('Report Builder Create custom').click();
    await page.getByRole('button', { name: 'Next Step' }).click();
    await page.locator('#indicatorList').getByText('Current Status').click();
    await page.getByRole('button', { name: 'Generate Report' }).click();

    await page.getByRole('button', { name: 'Modify Search' }).click();
    await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();
    await page.getByRole('option', { name: 'Initiator' }).click();
    await page.getByRole('button', { name: 'Next Step' }).click();
    await page.getByText('General Workflow - Group').click();
    await page.getByText('General Workflow - Requestor').click();
    await page.getByRole('button', { name: 'Generate Report' }).click();
    await expect(page.getByRole('cell', { name: 'No Results' })).toBeVisible();
});

test("Take Action allow user to perform necessary form Action", async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBCAXjJBjoGMALbKCHAoAbAG4Qs5AOZ0I2AIIA5EgF9S6LIhAYIwiJEmVqUOg2xtynMLyQAGabIXKQKgLrkAVhTQA7BChwwOgBXBHccBjAkYDUQYTQYNCjEAEZbdPJ4xLAAeQAzPLh9OxUgA&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAi2QoAri2a0G%2BMMzboOeHn0iwEKDDgWJ4RVFABCk5Giiz6jRdWWqeAXSA%3D");
    await page.getByRole('row', { name: '955 Take Action Available for' }).locator('div').click();
    await page.getByLabel('comment text area').click();
    await page.getByLabel('comment text area').fill('testing purpose');
    await page.getByRole('button', { name: 'Close' }).click();

    // un-comment if need to Approve Action 
    // await page.getByRole('button', { name: 'Approve' }).click();
});

test("Test Share Report button", async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBCAXjJBjoGMALbKCHAoAbAG4Qs5AOZ0I2AIIA5EgF9S6LIhAYIwiJEmVqUOg2xtynMLyQAGabIXKQKgLrkAVhTQA7BChwwOgBXBHccBjAkYDUQYTQYNCjEAEZbdPJ4xLAAeQAzPLh9OxUgA&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAi2QoAri2a0G%2BMMzboOeHn0iwEKDDgWJ4RVFABCk5Giiz6jRdWWqeAXSA%3D");
    await page.getByRole('button', { name: 'Share Report' }).click();
    await page.getByText('https://host.docker.internal/').click();
    await page.getByText('This link can be shared to provide a live view into this report.https://host.').click();
    await page.getByRole('button', { name: 'Close' }).click();
    //await page.getByRole('button', { name: 'Email Report', exact: true }).click();
});

test("Test Edit Labels/JSON button working", async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBCAXjJBjoGMALbKCHAoAbAG4Qs5AOZ0I2AIIA5EgF9S6LIhAYIwiJEmVqUOg2xtynMLyQAGabIXKQKgLrkAVhTQA7BChwwOgBXBHccBjAkYDUQYTQYNCjEAEZbdPJ4xLAAeQAzPLh9OxUgA&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAi2QoAri2a0G%2BMMzboOeHn0iwEKDDgWJ4RVFABCk5Giiz6jRdWWqeAXSA%3D");
    await page.getByRole('button', { name: 'JSON' }).click();
    await page.getByRole('button', { name: 'Shorten Link' }).click();
    await page.getByRole('button', { name: 'Expand Link' }).click();
    await page.getByRole('button', { name: 'Close' }).click();

    //await page.getByRole('button', { name: 'email report Edit Labels' }).click();
    //await page.locator('#xhr').click();
    //await page.getByRole('button', { name: 'Save Change' }).click(); // test test
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
    await expect(page.getByRole('button', { name: 'Create Row' })).toBeVisible();
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
    await expect(page.getByLabel('Sort by Radio')).toBeVisible();
});

test("fill textbox for multi line text", async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBeMkGOgYwAtsoI4KAGwBuELOQDmdCNgCCAORIBfUuiyIQHaRIYBPYqyq16jDS3Lsw3bADMGMAPoBWCDQAMAdlZTIcxSBU1bAwIQQhIcUpqKDoGZlZLa0Q3SWk%2FZQBdcgArCjQAOwQUEAK0MDRYqHkaGBksnAYwJGAVEAlwojoaJGQQABZWL3IAZhB6wTQYMqQARjd58gmpsAB5Gxs4cKQ3JSA%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAtGIQUGZrQb4wzNug54efSLARSR8xPCKooAIQCuyNFBn1GC6kpVr%2BmoRhzyALFbkEAsiZJEAAQk0GSByGQAHhx27Fy8ToLabgQA7F42AEqIcKiKcaoJGknCKWAAzBnyAMrQAObkwaHhUTGsBTwAukA");
    await page.getByRole("cell", { name: "testing" }).click();
    await page.getByLabel("Multi line text", { exact: true }).click();
    await page.getByLabel('Multi line text', { exact: true }).fill("test this is a test");
    await page.getByRole("button", { name: "Save Change" }).click();
    await expect(page.getByRole('cell', { name: "test this is a test" })).toBeVisible();

    await page.getByRole("cell", { name: "test this is a test" }).click();
    await expect(page.locator('#LeafFormGrid517_960_4')).toContainText("test this is a test");
    await page.getByLabel("Multi line text", { exact: true }).click();
    await page.getByLabel('Multi line text', { exact: true }).fill('testing');
    await page.getByRole('button', { name: 'Save Change' }).click();
});

test("Select multiple filter using AND/OR,", async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/");
    await page.getByText('Report Builder Create custom').click();
    await page.getByRole('cell', { name: 'IS NOT' }).locator('a').click();
    await page.getByRole('option', { name: 'IS', exact: true }).click();
    await page.getByRole('cell', { name: 'Current Status' }).locator('a').click();
    await page.getByRole('option', { name: 'Current Status' }).click();
    await page.getByLabel('add logical and filter').click();
    await page.getByRole('cell', { name: 'Current Status', exact: true }).locator('a').click();
    await page.locator('#LeafFormSearch3_widgetTerm_1-chosen-search-result-6').click();
    await page.getByRole('cell', { name: 'Complex Form' }).locator('a').click();
    await page.getByRole('option', { name: 'General Form' }).click();
    await page.getByRole('button', { name: 'Next Step' }).click();
    await page.getByRole('button', { name: 'Generate Report' }).click();
});

test("Edit Report Title", async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBeMkGOgYwAtsoI4KAGwBuELOQDmdCNgCCAORIBfUuiyIQHaRIYBPYqyq16jDS3Lsw3bADMGMAPoBWCDQAMAdlZTIcxSBU1bAwIQQhIcUpqKDoGZlZLa0Q3SWk%2FZQBdcgArCjQAOwQUEAK0MDRYqHkaGBksnAYwJGAVEAlwojoaJGQQABZWL3IAZhB6wTQYMqQARjd58gmpsAB5Gxs4cKQ3JSA%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAtGIQUGZrQb4wzNug54efSLARSR8xPCKooAIQCuyNFBn1GC6kpVr%2BmoRhzyALFbkEAsiZJEAAQk0GSByGQAHhx27Fy8ToLabgQA7F42AEqIcKiKcaoJGknCKWAAzBnyAMrQAObkwaHhUTGsBTwAukA");
    await page.getByRole('cell', { name: 'TestForm_NonadminCannotCancelOwnSubmittedRecord_new' }).click();
    await page.getByLabel('Report Title').dblclick();
    await page.getByLabel('Report Title').dblclick();
    await page.getByLabel('Report Title').click();
    await page.getByLabel('Report Title').fill('TestForm_NonadminCannotCancelOwnSubmittedRecord_new_Title');
    await page.getByRole('button', { name: 'Save Change' }).click();
});

test("Assigned Group form check", async ({ page }) => {
    page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJAVztASQBEQAaEAewAdoBDMCqbAXjJBnoGMALbNgc3oRsAQQByJAL6l0WRCE5D%2BjAJ7E21OgybzW5DmB7YAZoxgB9AKwRaABgDsAodgDyAJRDTZ2DBAA2EJBY5JpQ9IwsbAZGiLbkgpCiEp4AuuQAVhRoAHYIKCD4UABuaJzC5DloYGjhUGK0MMJpBYxgSMDSIPyBRPS0SMggAJxsACxsjuQAzCDNfmgwVUgAjLZr5POLYC7GxvhtsZJAA%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAizLoAbggrVaDfGGZt0HPDz6RYCFBhyLoxCLvTN5jJdRVqN%2FbUL2iwieEVRQAQgFdkaKGfoLZXYuXjtBE30CAE4AhQIAQRYWCABzKDIYAAIAcXRULwAHYNVQzQEdYSiwABY4iwBZLxIiLJJoMizkMgAPDisQ9TCtCKqnAHZ6xQAlRDhUEpthiocRRQBmKYIAZWhU8jaOrt7%2B1kGeAF0gA%3D");
    await page.locator('#LeafFormGrid264_961_9').click();
    await page.getByTitle('194').click();
    await page.getByTitle('194').click();
    await page.getByRole('button', { name: 'Close' }).click();
});