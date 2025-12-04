import { test, expect, Page } from '@playwright/test';

/* The form and request used for this test are defined in the dev boilerplate. Record and indicator IDs are known and constant.
Modals execute the same code as the form (edit) view, so this tests both edit and print view. */

test('Conditional Question Display State', async ({ page }) => {
    await page.goto('https://host.docker.internal/Test_Request_Portal/index.php?a=printview&recordID=100');

    const sectionOneEdit =  page.locator("#PHindicator_16_1 button");
    const p17_dropdown = "17";
    const c18_radio = "18";
    const c19_currency = "19";
    const c20_text = "20"

    const sectionTwoEdit =  page.locator("#PHindicator_21_1 button");
    const p22_numeric = "22";
    const c23_org_emp = "23";
    const c24_date = "24";
    const c25_textarea = "25";
    const cp26_checkboxes = "26"; //this nested field is also a controller 
    const c27_multiselect = "27";
    const c28_checkbox = "28";

    const sectionThreeEdit =  page.locator("#PHindicator_29_1 button");
    const p30_dropdown = "30";
    const p31_text = "31";
    const p32_text = "32";


    const checkDisplayState = async (
        page: any,
        locator: string,
        visible: boolean = false
    ) => {
        if(visible === true) {
            await expect(page.locator(locator), locator + ' to be visible').toBeVisible();
        } else {
            await expect(page.locator(locator), locator + ' to be hidden').toBeHidden();
        }
    }

    const requiredErrorSelector: string = '.input-required-error';
    const saveChange = async (
        dialog: any,
        page: Page,
        unfilledVisible: Array<string>
    ) => {
        await dialog.getByRole('button', { name: 'Save Change' }).click();
        if (unfilledVisible.length === 0) {
            await page.waitForResponse(res => res.url().includes('getprintindicator') && res.status() === 200);

        } else {
            await expect(
                dialog.locator(requiredErrorSelector),
                `Error class ${requiredErrorSelector} to be applied to ${unfilledVisible.length} visible required questions`
            ).toHaveCount(unfilledVisible.length);
        }
    }

    const getDialog = async (sectionLocator: any) => {
        await sectionLocator.click();
        let dialog = page.getByRole('dialog', { name: 'Editing #' });
        await expect(dialog.locator('div[id$="_loadIndicator"]')).toBeHidden();
        return dialog;
    }

    let hiddenIDs: Array<string> = [];
    let visibleIDs: Array<string> = [];

    /* ######## SECTION 1 ########
       controller: dropdown, 1,2,3
       controlled question should be visible if 2 or 3
       both triggers are on the same condition
    */
    let dialog = await getDialog(sectionOneEdit);

    await dialog.locator(`.response.blockIndicator_${p17_dropdown} a.chosen-single`).click();
    await dialog.getByRole('option', { name: '1' }).click();

    hiddenIDs = [ c18_radio, c19_currency, c20_text ];
    hiddenIDs.forEach(id => {
        checkDisplayState(page, `.sublabel.blockIndicator_${id}`, false);
        checkDisplayState(page, `.response.blockIndicator_${id}`, false);
    });
    await saveChange(dialog, page, []);

    //print view
    hiddenIDs.forEach(id => checkDisplayState(page, `#subIndicator_${id}_1`, false));

    //first show trigger (2)
    dialog = await getDialog(sectionOneEdit);

    await dialog.locator(`.response.blockIndicator_${p17_dropdown} a.chosen-single`).click();
    await dialog.getByRole('option', { name: '2' }).click();

    visibleIDs = [ c18_radio, c19_currency, c20_text ];
    visibleIDs.forEach(id => {
        checkDisplayState(page, `.sublabel.blockIndicator_${id}`, true);
        checkDisplayState(page, `.response.blockIndicator_${id}`, true);
    });
    await saveChange(dialog, page, visibleIDs);

    //fill visible required questions
    await page.locator(`#radio_options_${c18_radio} label`).filter({ hasText: 'A' }).locator('span').click();
    await page.getByRole('textbox', { name: 'normal nested currency sub' }).fill('2');
    await page.getByRole('textbox', { name: 'normal nested text sub' }).fill('test progress');

    await saveChange(dialog, page, []);

    visibleIDs.forEach(id => checkDisplayState(page, `#subIndicator_${id}_1`, true));

    //second show trigger (3)
    dialog = await getDialog(sectionOneEdit);

    await dialog.locator(`.response.blockIndicator_${p17_dropdown} a.chosen-single`).click();
    await dialog.getByRole('option', { name: '3' }).click();

    visibleIDs.forEach(id => {
        checkDisplayState(page, `.sublabel.blockIndicator_${id}`, true);
        checkDisplayState(page, `.response.blockIndicator_${id}`, true);
    });

    await saveChange(dialog, page, []);

    visibleIDs.forEach(id => checkDisplayState(page, `#subIndicator_${id}_1`, true));


    /* ######## SECTION 2 ########
       1st controller: numeric. controlled question should be visible if >= 42
       2nd controller: checkboxes. controlled question should be visible if 'E & "F"' is checked
    */
    dialog = await getDialog(sectionTwoEdit);

    await page.locator(`.blockIndicator_${p22_numeric} input[name="${p22_numeric}"]`).fill('41');
    await page.keyboard.press('Tab');

    //expect modal conditional/nested labels and inputs are hidden
    hiddenIDs = [ c23_org_emp, c24_date, c25_textarea, cp26_checkboxes, c27_multiselect, c28_checkbox ];
    hiddenIDs.forEach(id => {
        checkDisplayState(page, `.sublabel.blockIndicator_${id}`, false);
        checkDisplayState(page, `.response.blockIndicator_${id}`, false);
    });
    await saveChange(dialog, page, []);

    hiddenIDs.forEach(id => checkDisplayState(page, `#subIndicator_${id}_1`, false));

    //show 1st set of subquestions
    dialog = await getDialog(sectionTwoEdit);

    await page.locator(`.blockIndicator_${p22_numeric} input[name="${p22_numeric}"]`).fill('42');
    await page.keyboard.press('Tab');

    hiddenIDs = [ c27_multiselect, c28_checkbox ];
    visibleIDs = [ c23_org_emp, c24_date, c25_textarea, cp26_checkboxes ];

    hiddenIDs.forEach(id => {
        checkDisplayState(page, `.sublabel.blockIndicator_${id}`, false);
        checkDisplayState(page, `.response.blockIndicator_${id}`, false);
    });
    visibleIDs.forEach(id => {
        checkDisplayState(page, `.sublabel.blockIndicator_${id}`, true);
        checkDisplayState(page, `.response.blockIndicator_${id}`, true);
    });
    await saveChange(dialog, page, visibleIDs);

    //fill through the second controller, where controller has value that still hides remaining two
    await page.getByRole('searchbox', { name: 'Search for user to add as' }).fill('userName:tester');
    await page.getByRole('cell', { name: 'Tester, Tester Product Liaison' }).click();
    await page.getByRole('textbox', { name: 'normal nested date sub question' }).fill('12/04/2024');
    await page.getByRole('textbox', { name: 'normal nested multitext sub' }).fill('test');
    await page.locator('label').filter({ hasText: 'C & D' }).locator('span').click();

    hiddenIDs.forEach(id => {
        checkDisplayState(page, `.sublabel.blockIndicator_${id}`, false);
        checkDisplayState(page, `.response.blockIndicator_${id}`, false);
    });
    await saveChange(dialog, page, []);
    
    visibleIDs.forEach(id => checkDisplayState(page, `#subIndicator_${id}_1`, true));
    hiddenIDs.forEach(id => checkDisplayState(page, `#subIndicator_${id}_1`, false));
    
    //remaining subquestions
    dialog = await getDialog(sectionTwoEdit);

    await page.locator('label').filter({ hasText: 'E & "F"' }).locator('span').click();
    visibleIDs = [ c23_org_emp, c24_date, c25_textarea, cp26_checkboxes, c27_multiselect, c28_checkbox ];
    visibleIDs.forEach(id => {
        checkDisplayState(page, `.sublabel.blockIndicator_${id}`, true);
        checkDisplayState(page, `.response.blockIndicator_${id}`, true);
    });
    await saveChange(dialog, page, [ c27_multiselect, c28_checkbox ]);

    await page.getByRole('searchbox', { name: 'multiselect child (show if' }).click();
    await page.getByRole('option', { name: 'apple Press to select', exact: true }).click();
    await page.locator('.blockIndicator_28 label').filter({ hasText: 'test' }).locator('span').click();

    await saveChange(dialog, page, []);
    
    visibleIDs.forEach(id => checkDisplayState(page, `#subIndicator_${id}_1`, true));


    /* ######## SECTION 3 (staple) ########
        controller: dropdown, 1,2,3
        controlled question should be visible if 2 or 3
        triggers are on the separate conditions
    */
    dialog = await getDialog(sectionThreeEdit);

    await dialog.locator(`.response.blockIndicator_${p30_dropdown} a.chosen-single`).click();
    await dialog.getByRole('option', { name: '1' }).click();

    hiddenIDs = [ p31_text, p32_text ];
    hiddenIDs.forEach(id => {
        checkDisplayState(page, `.sublabel.blockIndicator_${id}`, false);
        checkDisplayState(page, `.response.blockIndicator_${id}`, false);
    });
    await saveChange(dialog, page, []);

    hiddenIDs.forEach(id => checkDisplayState(page, `#subIndicator_${id}_1`, false));

    //first show trigger (2)
    dialog = await getDialog(sectionThreeEdit);

    await dialog.locator(`.response.blockIndicator_${p30_dropdown} a.chosen-single`).click();
    await dialog.getByRole('option', { name: '2' }).click();

    visibleIDs = [ p31_text, p32_text ];
    visibleIDs.forEach(id => {
        checkDisplayState(page, `.sublabel.blockIndicator_${id}`, true);
        checkDisplayState(page, `.response.blockIndicator_${id}`, true);
    });
    await saveChange(dialog, page, visibleIDs);

    await page.locator(`.blockIndicator_${p31_text} input[name="${p31_text}"]`).fill(`test ${p31_text}`);
    await page.locator(`.blockIndicator_${p32_text} input[name="${p32_text}"]`).fill(`test ${p32_text}`);

    await saveChange(dialog, page, []);

    visibleIDs.forEach(id => checkDisplayState(page, `#subIndicator_${id}_1`, true));

    //second show trigger (3)
    dialog = await getDialog(sectionThreeEdit);

    await dialog.locator(`.response.blockIndicator_${p30_dropdown} a.chosen-single`).click();
    await dialog.getByRole('option', { name: '3' }).click();

    visibleIDs = [ p31_text, p32_text ];
    visibleIDs.forEach(id => {
        checkDisplayState(page, `.sublabel.blockIndicator_${id}`, true);
        checkDisplayState(page, `.response.blockIndicator_${id}`, true);
    });
    await saveChange(dialog, page, []);

    visibleIDs.forEach(id => checkDisplayState(page, `#subIndicator_${id}_1`, true));
});