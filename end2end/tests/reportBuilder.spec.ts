import { test, expect } from '@playwright/test';

// When the underlying issue is fixed, we should expect this test to pass.
// Tests should be tagged with an associated ticket or PR reference
test.skip('column order is maintained after modifying the search filter', { tag: '@issue:LEAF-4482' }, async ({ page }, testInfo) => {
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
    await page.goto("https://host.docker.internal/Test_Request_Portal/", { timeout: 60000 });
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
    await page.getByRole('cell', { name: 'Available for TEST CHANGE' }).click();
    await page.getByLabel('Report Title').click();

    await page.getByLabel('Report Title').fill('Available for TEST CHANGE TITLE');
    await page.getByLabel('Report Title').press('Enter');
    await page.getByRole('button', { name: 'Save Change' }).click();
});

test("Connected forms open on UID link click", async ({ page }) => {
    await page.goto("https://host.docker.internal/Test_Request_Portal/?a=reports&v=3&query=N4IgLgpgTgtgziAXAbVASwCZJHSAHASQBEQAaEAez2gEMwKpsBCAXjJBjoGMALbKCHAoAbAG4Qs5AOZ0I2AIIA5EgF9S6LIhAYIwiJEmVqUOg2xtynMLyQAGabIXKQKgLrkAVhTQA7BChwwOgBXBHJfNDA0UyhFGhg5dxwGMCRgNRBhNBhIpABGW0LyLJywAHkAMwq4fTsVIA%3D%3D%3D&indicators=NobwRAlgdgJhDGBDALgewE4EkAiYBcYyEyANgKZgA0YUiAthQVWAM4bL4AMAvpeNHCRosuAi2QoAri2a0G%2BMMzboOeHn0iwEKDDgXRiEHeln1Gi6stU8AukA");
    await page.getByRole('link', { name: '956' }).click();
    await page.getByText('Available for TEST CHANGE').click();
    await page.getByRole('link', { name: 'Main Page' }).click();
    await page.getByText('Report Builder Create custom').click();
    await page.getByRole('button', { name: 'Next Step' }).click();
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