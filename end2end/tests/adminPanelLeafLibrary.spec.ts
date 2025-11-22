import { test, expect } from '@playwright/test';
import { LEAF_URLS, deleteTestFormByFormID } from '../leaf_test_utils/leaf_util_methods.ts';

const testFormTdId = 'td[id$="_1_form"]';
const testFormRequestTitle = 'LEAF Library Format Tests';
const testFormAuthor = 'Tester Tester';

test('LEAF Library: page navigation', async ({ page }) => {
    await page.goto(LEAF_URLS.PORTAL_HOME + 'admin/?a=formLibrary');

    const breadcrumbNav = page.getByRole('heading', { name: 'LEAF Library'});
    await expect(breadcrumbNav).toBeVisible();

    const breadcrumbs = breadcrumbNav.locator('> *');
    const directCount = await breadcrumbs.count();
    expect(directCount).toBe(2);
    const el1 = breadcrumbs.nth(0);
    const el2 = breadcrumbs.nth(1);
    await expect(el1).toHaveText('Admin');
    await expect(el2).toHaveClass('fas fa-caret-right leaf-crumb-caret');

    const links = [
        { link: 'Admin', newPageHeading: 'Get Help' },
        { link: 'My Forms', newPageHeading: 'Form Browser' },
        { link: 'Contribute my Form', newPageHeading: 'Step 1 - General Information' },
    ];
    for (let i = 0; i < links.length; i++) {
        const link = page.getByRole('link', { name: links[i].link });
        await expect(link).toBeVisible();
        await link.click();
        await expect(page.getByRole('heading', { name: links[i].newPageHeading})).toBeVisible();

        await page.goto(LEAF_URLS.PORTAL_HOME + 'admin/?a=formLibrary');
    }
});

test('LEAF Form Library: report table functionality', async ({ page }) => {
    const expectedTableHeaders = [
        'Form',
        'Description',
        'Author(s)',
        'Workflow Example',
        'Preview',
    ];
    const testFormColumnValues = [
        testFormRequestTitle,
        'LEAF Library Field Format Testing',
        testFormAuthor,
        'Screenshot of workflow',
        'Preview',
    ];
    const awaitForms = page.waitForResponse(res =>
        res.url().includes('form/query?q') && res.status() === 200
    );
    await page.goto(LEAF_URLS.PORTAL_HOME + 'admin/?a=formLibrary');
    await awaitForms;

    const tableHeaderRow = page.locator('table[id^="LeafFormGrid"] thead tr').first();
    const tableTestFormRow = page.locator('table[id^="LeafFormGrid"] tbody tr')
        .filter({has: page.locator(testFormTdId)});

    await expect(tableHeaderRow).toBeVisible();
    for(let i = 0; i < expectedTableHeaders.length; i++) {
        const th = tableHeaderRow.locator('th').nth(i);
        const expectedText = expectedTableHeaders[i];
        await expect(
            th, `Table header at index ${i} to be ${expectedText}`
        ).toContainText(expectedText);
        if (i <= 2) {
            const ariaLabel = await th.getAttribute('aria-label');
            expect(ariaLabel, `Sortable header ${i} to have aria-label ${ariaLabel}`).toBe(`Sort by ${expectedText}`);
            await th.click();
            expect(th.locator('.sort_icon_span'), 'Sorting icon to be visible').toBeVisible();
        }
    }

    await expect(tableTestFormRow ).toBeVisible();
    for(let i = 0; i < testFormColumnValues.length; i++) {
        const td = tableTestFormRow.locator('td').nth(i);
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
                    page.getByText(`${testFormRequestTitle} (example workflow)`),
                    'workflow preview to be displayed when the workflow screenshot is clicked'
                ).toBeVisible();
                const modalImg = page.locator('#simplexhr img');
                const modalImgLoadedProperly = await modalImg.evaluate(
                    (img:HTMLImageElement) => img.complete && img.naturalHeight !== 0
                );
                expect(modalImgLoadedProperly, 'modal image to load properly').toBe(true);
                await page.getByRole('button', { name: 'Close', exact: true}).click();
                await expect(page.getByText(`${testFormRequestTitle} (example workflow)`)).not.toBeVisible();
                break;
            case 4: //preview button is visible. form preview has its own test
                await expect(
                    td.getByRole('button', { name: expectedText}),
                    'Preview button to be visible'
                ).toBeVisible();
                break;
            default:
                await expect(td).toHaveText(expectedText);
            break;
        }
    }
});

test('LEAF Form Library: form query filter and search functionality', async ({ page }) => {
    let awaitForms = page.waitForResponse(res =>
        res.url().includes('form/query?q') && res.status() === 200
    );
    await page.goto(LEAF_URLS.PORTAL_HOME + 'admin/?a=formLibrary');
    await awaitForms;

    const tableFirstRow = page.locator('table[id^="LeafFormGrid"] tbody tr').first();
    const tableTestFormRow = page.locator('table[id^="LeafFormGrid"] tbody tr')
        .filter({has: page.locator(testFormTdId)});
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
            await expect(tableTestFormRow, `Filter ${formFilters[i]} to return the test form`).toContainText(testFormRequestTitle);
        } else {
            await expect(tableTestFormRow, `Filter ${formFilters[i]} not to return the test form`).not.toBeVisible();
        }
    }

    await page.getByRole('button', { name: formFilters[0] }).click();

    //positive search test
    const testFormSearchReturned = [ 'baSic', 'teSTer', 'fOrmat' ];
    for(let i = 0; i < testFormSearchReturned.length; i++) {
        awaitForms = page.waitForResponse(res =>
            res.url().includes('form/query?q') && res.status() === 200
        );
        await page.getByLabel('Enter your search text').fill(testFormSearchReturned[i]);
        await awaitForms;

        await expect(
            tableTestFormRow,
            'test form to be returned by case insensitive search of keyword, author or partial title'
        ).toContainText(testFormRequestTitle);
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
            tableTestFormRow,
            'negative test of search to have no results'
        ).not.toBeVisible();
    }
});

test('LEAF Form Library: form preview and import', async ({ page }) => {
    const awaitForms = page.waitForResponse(res =>
        res.url().includes('form/query?q') && res.status() === 200
    );
    await page.goto(LEAF_URLS.PORTAL_HOME + 'admin/?a=formLibrary');
    await awaitForms;

    const previewModal = page.locator('#simplexhr');
    const tableTestFormRow = page.locator('table[id^="LeafFormGrid"] tbody tr')
        .filter({has: page.locator(testFormTdId)});

    await expect(tableTestFormRow).toBeVisible();
    await tableTestFormRow.getByRole('button', { name: 'Preview' }).click();
    await expect(previewModal, 'Form Preview modal to be visible').toBeVisible();
    await expect(previewModal.getByText(testFormRequestTitle), 'Test form name to be visible').toBeVisible();
    await expect(previewModal.getByText(`By ${testFormAuthor}`), 'Test form author to be visible').toBeVisible();

    /*
      The LEAF Library preview is only a basic preview and does not fully reflect the request.
      Until/unless that is updated this only tests the expected preview order and basic input display.
      Test form is from the packet at LEAF_library_test_uploads/1_1_1
    */
    const testFormName = 'LEAF Library Input Formats';
    const testFormDescription = 'For testing display and import of forms in the LEAF Library';
    const testFields = [
        [
            { label: 'Basic input types', format: '', id: '33' },
            { label: 'single line text', format: 'text', id:'340'},
            { label: 'multi-line text', format: 'textarea', id:'35' },
            { label: 'numeric', format: 'number', id:'36' },
            { label: 'currency', format: 'currency', id:'37' },
            { label: 'file attachment', format: 'fileupload', id:'38' },
            { label: 'image attachment', format: 'image', id: '39' },
        ],
        [
            { label: 'Plugin and style-modified input types', format: '', id:'40' },
            { label: 'date (jQuery date picker)', format: 'date', id:'41' },
            { label: 'dropdown (jQuery Chosen)', format: 'dropdown', id:'42' },
            { label: 'multi-select dropdown (JavaScript Choices-JS)', format: 'multiselect', id:'43' },
            { label: 'checkbox (LEAF-check with custom label)', format: 'checkbox', id:'44' },
            { label: 'checkboxes (LEAF-check)', format: 'checkboxes', id:'45' },
            { label: 'radio (LEAF-check)', format: 'radio', id:'46' },
        ],
        [
            { label: 'LEAF-specific input types (LEAF types involving more than simple styling)', format: '', id:'47' },
            { label: 'grid (LEAF-table)', format: 'grid', id:'48' },
            { label: 'orgchart employee (LEAF-orgchart, employee)', format: 'orgchart_employee', id:'49' },
            { label: 'orgchart group (LEAF-orgchart, group)', format: 'orgchart_group', id:'50' },
            { label: 'orgchart position (LEAF-orgchart, position)', format: 'orgchart_position', id:'51' },
            { label: 'custom widget (LEAF-raw data)', format: 'raw_data', id:'52' },
        ],
    ];
    for (let sectionIdx = 0; sectionIdx < testFields.length; sectionIdx++) {
        const card = page.locator('.card').nth(sectionIdx);
        const heading = card.locator('xpath=./preceding-sibling::*[1]');

        await expect(card).toBeVisible();
        await expect(heading).toHaveText(`Section ${sectionIdx + 1}`);
        const sectionFields = testFields[sectionIdx];
        for(let idx = 0; idx < sectionFields.length; idx++) {
            const label = sectionFields[idx].label;
            const format = sectionFields[idx].format;
            await expect(
                card.locator('[id^="leaf_library_preview_"]').nth(idx),
                'field to be in expected location'
            ).toHaveText(label);
            if(format !== '') {
                await expect(card.getByLabel(label).first()).toBeVisible();
            } else {
                await expect(card.getByLabel(label).first()).not.toBeVisible();
            }
        }
    }

    //import the form with the 'Get a Copy' button and confirm the expected order
    await expect(previewModal.getByRole('button', { name: 'Get a copy!' }), 'Copy button to be visible').toBeVisible();
    await previewModal.getByRole('button', { name: 'Get a copy!' }).click();

    await expect(page.getByLabel('Form name')).toHaveValue(testFormName);
    await expect(page.getByLabel('Form description')).toHaveValue(testFormDescription);
    const formIDLoc = page.locator('#edit-properties-panel .form-id');
    await expect(formIDLoc).toBeVisible();
    const formID = (await formIDLoc.textContent() ?? '').trim();

    const form = page.locator(`#base_drop_area_${formID}`);
    for (let sectionIdx = 0; sectionIdx < testFields.length; sectionIdx++) {
        const section = form.locator('> li').nth(sectionIdx);
        const sectionFields = testFields[sectionIdx];
        for(let idx = 0; idx < sectionFields.length; idx++) {
            await expect(
                section.locator('.indicator-name-preview .name').nth(idx),
                'imported field to be in expected location'
            ).toHaveText(sectionFields[idx].label);
        }
    }

    //cleanup
    await deleteTestFormByFormID(page, formID);
});