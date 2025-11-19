import { test, expect } from '@playwright/test';
import { LEAF_URLS } from '../leaf_test_utils/leaf_util_methods.ts';



const testFormName = 'LEAF Library Format Tests';

const formFilters = [
    'All Business Lines',
    'Administrative',
    'Human Resources',
    'Information Technology',
    'Logistics',
    'Fiscal',
];
const expectedTestFilterResults = [0,0,0,1,0,0];


test('LEAF Form Library page table functionality', async ({ page }) => {
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
    const tableTestRow = page.locator('table[id^="LeafFormGrid"] tbody tr').first();
    await expect(tableHeaderRow).toBeVisible();
    for(let i = 0; i < expectedTableHeaders.length; i++) {
        const expectedText = expectedTableHeaders[i];
        await expect(
            tableHeaderRow.locator('th').nth(i),
            `Table header at index ${i} to be ${expectedText}`
        ).toContainText(expectedText)
    }

    await expect(tableTestRow).toBeVisible();
    for(let i = 0; i < testFormColumnValues.length; i++) {
        const td = tableTestRow.locator('td').nth(i);
        const expectedText = testFormColumnValues[i];
        switch(i) {
            case 3: //workflow screenshot loads, has some appropriate alt text, larger preview displays
                const imgLocator = td.locator('img');
                const imageLoadedProperly = await imgLocator.evaluate((img:HTMLImageElement) => img.complete && img.naturalHeight !== 0);
                expect(imageLoadedProperly, 'workflow image to load properly').toBe(true);
                const altText = await imgLocator.getAttribute('alt');
                expect(altText, 'workflow image to have alt text').toBe(expectedText);
                await imgLocator.click();
                await expect(
                    page.getByText(`${testFormName} (example workflow)`),
                    'workflow preview to be displayed when the workflow screenshot is clicked'
                ).toBeVisible();
                await page.getByRole('button', { name: 'Close', exact: true}).click();
                await expect(page.getByText(`${testFormName} (example workflow)`)).not.toBeVisible();
                break;
            case 4: //preview button exists, form is shown correctly 
                await expect(td.getByRole('button', { name: expectedText})).toBeVisible();
                break;
            default:
                await expect(td).toHaveText(expectedText);
            break;
        }
    }


});