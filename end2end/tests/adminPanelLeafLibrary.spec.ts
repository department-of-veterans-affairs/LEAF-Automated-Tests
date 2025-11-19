import { test, expect } from '@playwright/test';
import { LEAF_URLS } from '../leaf_test_utils/leaf_util_methods.ts';



const testFormName = 'LEAF Library Format Tests';




test('LEAF Form Library: table functionality', async ({ page }) => {
    const expectedTableHeaders = [
        'Form',
        'Description',
        'Author(s)',
        'Workflow Example',
        'Preview',
    ];
    const testFormColumnValues = [
        testFormName,
        'LEAF Library Field Format Testing',
        'Tester Tester',
        'Screenshot of workflow',
        'Preview',
    ];
    const awaitForms = page.waitForResponse(res =>
        res.url().includes('form/query?q') && res.status() === 200
    );
    await page.goto(LEAF_URLS.PORTAL_HOME + 'admin/?a=formLibrary');
    await awaitForms;

    const tableHeaderRow = page.locator('table[id^="LeafFormGrid"] thead tr').first();
    const tableFirstRow = page.locator('table[id^="LeafFormGrid"] tbody tr').first();

    await expect(tableHeaderRow).toBeVisible();
    for(let i = 0; i < expectedTableHeaders.length; i++) {
        const expectedText = expectedTableHeaders[i];
        await expect(
            tableHeaderRow.locator('th').nth(i),
            `Table header at index ${i} to be ${expectedText}`
        ).toContainText(expectedText)
    }

    await expect(tableFirstRow).toBeVisible();
    for(let i = 0; i < testFormColumnValues.length; i++) {
        const td = tableFirstRow.locator('td').nth(i);
        const expectedText = testFormColumnValues[i];
        switch(i) {
            case 3: //workflow screenshot loads, has some appropriate alt text
                const imgLocator = td.locator('img');
                const imageLoadedProperly = await imgLocator.evaluate(
                    (img:HTMLImageElement) => img.complete && img.naturalHeight !== 0
                );
                expect(imageLoadedProperly, 'workflow image to load properly').toBe(true);
                const altText = await imgLocator.getAttribute('alt');
                expect(altText, 'workflow image to have alt text').toBe(expectedText);
                //checking that the larger preview shows is simple enough to do here
                await imgLocator.click();
                await expect(
                    page.getByText(`${testFormName} (example workflow)`),
                    'workflow preview to be displayed when the workflow screenshot is clicked'
                ).toBeVisible();
                const modalImg = page.locator('#simplexhr img');
                const modalImgLoadedProperly = await modalImg.evaluate(
                    (img:HTMLImageElement) => img.complete && img.naturalHeight !== 0
                );
                expect(modalImgLoadedProperly, 'modal image to load properly').toBe(true);
                await page.getByRole('button', { name: 'Close', exact: true}).click();
                await expect(page.getByText(`${testFormName} (example workflow)`)).not.toBeVisible();
                break;
            case 4: //preview button is visible. form preview has its own test
                await expect(td.getByRole('button', { name: expectedText})).toBeVisible();
                break;
            default:
                await expect(td).toHaveText(expectedText);
            break;
        }
    }
});

test('LEAF Form Library: form query filter functionality', async ({ page }) => {
    let awaitForms = page.waitForResponse(res =>
        res.url().includes('form/query?q') && res.status() === 200
    );
    await page.goto(LEAF_URLS.PORTAL_HOME + 'admin/?a=formLibrary');
    await awaitForms;

    const tableFirstRow = page.locator('table[id^="LeafFormGrid"] tbody tr').first();
        const formFilters = [
        'All Business Lines',
        'Administrative',
        'Human Resources',
        'Information Technology',
        'Logistics',
        'Fiscal',
    ];
    const testFormReturned = [1, 0, 0, 1, 0, 0]; //test form should display for All Lines and IT
    for(let i = 0; i < formFilters.length; i++) {
        //note: currently a filter re-queries - might be able to just use available data instead
        awaitForms = page.waitForResponse(res =>
            res.url().includes('form/query?q') && res.status() === 200
        );
        const btn = page.locator('#menu').getByRole('button').nth(i);
        await expect(btn).toHaveText(formFilters[i]);
        await btn.click();
        await awaitForms;

        await expect(tableFirstRow).toBeVisible();
        if(testFormReturned[i] === 1) {
            await expect(tableFirstRow).toContainText(testFormName);
        } else {
            await expect(tableFirstRow).toHaveText('No Results');
        }
    }

    await page.getByRole('button', { name: formFilters[0] }).click();

    //positive search test
    const testFormSearchReturned = [ 'basic', 'teSTer', 'format' ];
    for(let i = 0; i < testFormSearchReturned.length; i++) {
        awaitForms = page.waitForResponse(res =>
            res.url().includes('form/query?q') && res.status() === 200
        );
        await page.getByLabel('Enter your search text').fill(testFormSearchReturned[i]);
        await awaitForms;

        await expect(
            tableFirstRow,
            'test form to be returned by search of keyword, author or partial title'
        ).toContainText(testFormName);
    }
    //negative search test
    const testFormSearchNotReturned = [ 'advanced', 'space request' ];
    for(let i = 0; i < testFormSearchNotReturned.length; i++) {
        awaitForms = page.waitForResponse(res =>
            res.url().includes('form/query?q') && res.status() === 200
        );
        await page.getByLabel('Enter your search text').fill(testFormSearchNotReturned[i]);
        await awaitForms;

        await expect(
            tableFirstRow,
            'negative test of search to have no results'
        ).toHaveText('No Results');
    }
});