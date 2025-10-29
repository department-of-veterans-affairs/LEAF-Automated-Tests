import {test, expect, Page, Locator} from '@playwright/test';
import { LEAF_URLS, createTestRequest, deleteTestRequestByRequestID } from '../leaf_test_utils/leaf_util_methods.ts';

//This test is designed to test LEAF
test.describe.configure({ mode: 'serial' });

//Global Variables
const siteMapname = `LEAF 4832 - Customization`;
const editorCardText = `☰ ${siteMapname}`;
const siteMapDesc = 'Testing for LEAF 4823 Customization';
const leafSiteCard = siteMapname + 'Testing for LEAF 4823 Customization';

const serviceRequest ='LEAF 4832 - Request';
const serviceRequest2 ='LEAF 4832 - Request2';
const stapledRequest = 'LEAF 4832 - Stapled Request';
const stapleName = 'Test IFTHEN staple | Multiple person designated';
const customFormID = 'form_f8b95';
const initialFormViewColumns = [ 'UID', 'Service', 'Title', 'Status', 'Action' ];
const initialRoleViewColumns = [ 'UID', 'Type', 'Service', 'Title', 'Status', 'Action' ];

const customFormViewColumns = [ 'UID', 'Service', 'Title', 'Status', 'Priority', 'Days Since Last Action', 'Action' ];
const customRoleViewColumns = [ 'UID', 'Type', 'Service', 'Title', 'Status', 'Priority', 'Days Since Last Action', 'Action' ];

const customForm_formViewColumns = [ 'UID', 'Service', 'Title', 'Date Submitted', 'Reviewer 1', 'Action' ];
const customForm_roleViewOneForm = [ 'UID', 'Type', 'Service', 'Title', 'Date Submitted', 'Reviewer 1', 'Action' ];
const customForm_roleViewMultiForms = [ 'UID', 'Type', 'Service', 'Title', 'Status', 'Priority', 'Days Since Last Action', 'Action' ];

let requestId_oneForm:string;
let requestId_multForms:string
let requestId_withStaple:string;

/**
 * Validates inbox table headers.  Accounts for service potentially being abscent.
 * @param tableLocator of table being validated
 * @param headers array of expected header values, in the order they are expected
 */
const validateInboxTableColumns = async (tableLocator:Locator, headers:Array<string>) => {
  let idx = 0;
  for(let i = 0; i < headers.length; i++) {
    const h = headers[i].toLowerCase();
    if (h !== 'service') {
      await expect(tableLocator.locator('thead th')
        .nth(idx)
        .getByText(headers[i]),
        `${headers[i]} to be a header in the table and in place ${idx}`
      ).toBeVisible();
      idx++;
    } else {
      //The service header is only present if at least one request has a service selected
      //If it is present, it should be at the indicated index.  Only increment idx if it exists.
      const sCount = await tableLocator.locator('thead th').nth(i).getByText(headers[i]).count();
      if (sCount > 0) {
        expect(sCount, `service column is present at index ${i}`).toBeGreaterThan(0);
        idx++;
      }
    }
  }
}

test.describe('SiteMap Creation, Verification and Inbox Customazation', () => {
test('create New Sitemap Card', async ({ page }) => {
  const awaitSettings = page.waitForResponse(res =>
    res.url().includes('settings') && res.status() === 200
  );
  await page.goto(LEAF_URLS.PORTAL_HOME + 'report.php?a=LEAF_sitemaps_template');
  await awaitSettings;

  await expect(page.getByRole('button', { name: '+ Add Site' })).toBeVisible();

  //Style the Sitemap
  const siteMapColor = '#5d1adb';
  const siteMapFontColor = '#e2db08';
  await page.getByRole('button', { name: '+ Add Site' }).click();
  
  //TODO: replace locators with the commented ones below when their labels are fixed
  await expect(page.locator('#button-title')).toBeVisible();
  await page.locator('#button-title').fill(siteMapname);
  await page.locator('#button-description').fill(siteMapDesc);
  await page.locator('#button-target').fill(LEAF_URLS.PORTAL_HOME);
  //await page.getByLabel('Site Title').fill(siteMapname);
  //await page.getByLabel('Site Description').fill(siteMapDesc);
  //await page.getByLabel('Target Site Address').fill(LEAF_URLS.PORTAL_HOME);
  await page.locator('input[name="btnColor"]').click();
  await page.locator('input[name="btnColor"]').fill(siteMapColor);
  await page.locator('input[name="btnFntColor"]').click();
  await page.locator('input[name="btnFntColor"]').fill(siteMapFontColor);
  await page.getByRole('img', { name: 'application-x-executable.svg' }).click();

  const awaitSave = page.waitForResponse(res =>
    res.url().includes('sitemap_json') && res.status() === 200
  );
  await page.getByRole('button', { name: 'Save Change' }).click();
  await awaitSave;

  await expect(page.getByText(leafSiteCard)).toBeVisible();
});

test('Display of Inbox Sitemap Personalization and initial columns', async ({ page }) => {
  let awaitInboxData = page.waitForResponse(res => 
    res.url().includes('includeStandardLEAF') && res.status() === 200
  );
  await page.goto(LEAF_URLS.PORTAL_HOME + 'report.php?a=LEAF_Inbox');
  await awaitInboxData;

  await expect(page.locator('#inbox').getByText(siteMapname)).toBeVisible();
  await expect(page.locator('#indexSites')).toContainText(siteMapname);

  //Form View
  await page.getByRole('button', { name: 'Toggle sections' }).click();
  const firstTable = page.locator('.depContainer table').first();
  await validateInboxTableColumns(firstTable, initialFormViewColumns);
  
  //Role View
  awaitInboxData = page.waitForResponse(res => 
    res.url().includes('includeStandardLEAF') && res.status() === 200
  );
  await expect(page.getByRole('button', { name: 'Organize by Roles' })).toBeVisible();
  await page.getByRole('button', { name: 'Organize by Roles' }).click();
  await awaitInboxData;
  
  const roleDivCountainer = page.locator('.siteFormContainers .depContainer');
  await expect(roleDivCountainer.first()).toBeVisible();

  const counter =  await roleDivCountainer.count();
  for (let i = 0; i < counter; i++) {
    const container = page.locator('div.depContainer').nth(i);
    const expandButton = container.locator('button');
    const table = container.getByRole('table');

    await expandButton.click();
    const requestSpanText = await expandButton.locator('> span').innerText();
    const tableTdRows = await table.locator('tbody tr').all();
    const rowCount = tableTdRows.length;
    expect(rowCount).toBeGreaterThan(0);
    expect(requestSpanText).toBe(`View ${rowCount} requests`);
    await validateInboxTableColumns(table, initialRoleViewColumns);
  }
});

test('General Customization of LEAF Inbox Columns and Inbox Display', async ({ page }) => {
  const colsToAdd = [ 'Priority', 'Days Since Last Action' ];

  //Add Customization (addition of priority and days since action columns)
  await page.goto(LEAF_URLS.PORTAL_HOME + 'admin/?a=mod_combined_inbox');
  await expect(page.getByText(siteMapname, { exact: true })).toBeVisible();

  const siteId = await page.getByText(editorCardText).getAttribute('value');
  const leafSiteId = `#site-container-${siteId}`;
 
  for (let i = 0; i < colsToAdd.length; i++) {
    const awaitSave = page.waitForResponse(res =>
      res.url().includes('sitemap_json') && res.status() === 200
    );
    await page.locator(leafSiteId).getByRole('textbox', { name: 'Click to search. Limit 7' }).fill(colsToAdd[i]);
    await page.locator(leafSiteId).locator('.choices__list div').getByText(colsToAdd[i]).click();
    await awaitSave;
  }

  //Verify the customization is present
  await page.goto(LEAF_URLS.PORTAL_HOME + 'report.php?a=LEAF_Inbox');
  await expect(page.locator('#indexSites')).toContainText(siteMapname);

  //Verify Role Customization
  let awaitInboxData = page.waitForResponse(res => 
    res.url().includes('includeStandardLEAF') && res.status() === 200
  );
  await expect(page.getByRole('button', { name: 'Organize by Roles' })).toBeVisible();
  await page.getByRole('button', { name: 'Organize by Roles' }).click();
  await awaitInboxData;

  const dynTxt = 'Tester Tester View';
  const dynRegex = new RegExp(`^${dynTxt}.*`);
  const testerMenu = page.getByRole('button', { name: dynRegex});
  const container = page.locator('div.depContainer').filter({ has: testerMenu });
  await testerMenu.click();
  await validateInboxTableColumns(container.getByRole('table'), customRoleViewColumns);

  //Form View
  awaitInboxData = page.waitForResponse(res => 
    res.url().includes('includeStandardLEAF') && res.status() === 200
  );
  await page.getByRole('button', { name: 'Organize by Forms' }).click();
  await awaitInboxData;
 
  const dynTxt2 = 'Complex Form';
  const dynRegex2 = new RegExp(`^${dynTxt2}.*`);
  const formMenu = page.getByRole('button', { name: dynRegex2 });
  const formContainer = page.locator('div.depContainer').filter({ has: formMenu });
  await formMenu.click();
  await validateInboxTableColumns(formContainer.getByRole('table'), customFormViewColumns);
});

test('Form View: Customization of a specific form and Inbox display', async ({ page }) => {
  const colsToAdd = [ 'Date Submitted', 'Multiple person designated: Reviewer 1 (ID: 14)' ];

  await page.goto(LEAF_URLS.PORTAL_HOME + 'admin/?a=mod_combined_inbox');
  await expect(page.getByText(editorCardText)).toBeVisible();
  
  const siteId = await page.getByText(editorCardText).getAttribute('value');
  const leafSiteId = `#site-container-${siteId}`;
  const formSelectId = `#form_select_${siteId}`;

  const awaitIndicators = page.waitForResponse(res =>
    res.url().includes(`forms=${customFormID}`) && res.status() === 200
  );
  await page.locator(formSelectId).selectOption(customFormID);
  await awaitIndicators;

  //this is here to help make sure choices js updates its selections
  await page.evaluate(() => {
    return new Promise((resolve) => {
      requestAnimationFrame(() => resolve(1));
    });
  });

  await page.locator(leafSiteId).getByLabel(`Remove item: 'status'`).click();

  for (let i = 0; i < colsToAdd.length; i++) {
    const awaitSave = page.waitForResponse(res =>
      res.url().includes('sitemap_json') && res.status() === 200
    );
    await page.locator(leafSiteId).getByRole('textbox', { name: 'Click to search. Limit 7' }).fill(colsToAdd[i]);
    await page.locator(leafSiteId).locator('.choices__list div').getByText(colsToAdd[i]).click();
    await awaitSave;
  }

  let awaitInboxData = page.waitForResponse(res => 
    res.url().includes('includeStandardLEAF') && res.status() === 200
  );
  await page.goto(LEAF_URLS.PORTAL_HOME + 'report.php?a=LEAF_Inbox');
  await awaitInboxData;
  await expect(page.locator('#indexSites')).toContainText(siteMapname);

  const dynTxt2 = 'Multiple person designated';
  const dynRegex2 = new RegExp(`^${dynTxt2}.*`);
  const formMenu = page.getByRole('button', { name: dynRegex2 });
  const formContainer = page.locator('div.depContainer').filter({ has: formMenu });
  await formMenu.click();
  await validateInboxTableColumns(formContainer.getByRole('table'), customForm_formViewColumns);
});

test('Create Multiple Person Form requests (Config)', async ({ page }) => {
  const loadingIndicators = page.locator('div[id^="loadingIndicator_"]:visible');
  //for role view, one form represented
  requestId_oneForm = await createTestRequest(page, 'AS - Service', serviceRequest, 'Multiple person designated');

  await expect(page.getByText('Form completion progress: 0% Next Question')).toBeVisible();

  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 1' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 1' }).fill('ad');
  await page.getByRole('cell', { name: 'Wolf, Adan Williamson. Direct' }).click();
  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 1' })).toHaveValue('userName:VTRHJHROSARIO');

  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 2' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 2' }).fill('h');
  await page.getByRole('cell', { name: 'Hackett, Linsey Spinka.' }).click();
  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 2' })).toHaveValue('userName:VTRXVPMADELAINE');

  await expect(loadingIndicators).toHaveCount(0);
  await expect(page.locator('.input-required-error')).toHaveCount(0);

  await expect(page.locator('#nextQuestion2')).toBeVisible();
  await page.locator('#nextQuestion2').click();

  await expect(page.getByRole('button', { name: 'Submit Request' })).toBeVisible();
  let awaitSubmit = page.waitForResponse(res => 
    res.url().includes(`form/${requestId_oneForm}/submit`) && res.status() === 200
  );
  await page.getByRole('button', { name: 'Submit Request' }).click();
  await awaitSubmit;

  //for role view, multiple forms represented
  requestId_multForms = await createTestRequest(page, 'AS - Service', serviceRequest2, 'Multiple person designated');

  await expect(page.getByText('Form completion progress: 0% Next Question')).toBeVisible();

  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 1' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 1' }).fill('test');
  await page.getByRole('cell', { name: 'Tester, Tester Product Liaison' }).click();
  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 1' })).toHaveValue('userName:tester');

  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 2' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 2' }).fill('h');
  await page.getByRole('cell', { name: 'Hackett, Linsey Spinka.' }).click();
  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 2' })).toHaveValue('userName:VTRXVPMADELAINE');

  await expect(loadingIndicators).toHaveCount(0);
  await expect(page.locator('.input-required-error')).toHaveCount(0);

  await expect(page.locator('#nextQuestion2')).toBeVisible();
  await page.locator('#nextQuestion2').click();

  await expect(page.getByRole('button', { name: 'Submit Request' })).toBeVisible();
  awaitSubmit = page.waitForResponse(res => 
    res.url().includes(`form/${requestId_multForms}/submit`) && res.status() === 200
  );
  await page.getByRole('button', { name: 'Submit Request' }).click();
  await awaitSubmit;
});

test('Role View: Form specific columns display if only one form is present', async ({ page }) => {
  let awaitInboxData = page.waitForResponse(res => 
    res.url().includes('includeStandardLEAF') && res.status() === 200
  );
  await page.goto(LEAF_URLS.PORTAL_HOME + 'report.php?a=LEAF_Inbox');
  await awaitInboxData;

  await expect(page.locator('#inbox').getByText(siteMapname)).toBeVisible();
  await expect(page.getByRole('button', { name: 'View as Admin' })).toBeVisible();
  
  awaitInboxData = page.waitForResponse(res => 
    res.url().includes('includeStandardLEAF') && res.status() === 200
  );
  await page.getByRole('button', { name: 'Organize by Roles' }).click();
  await awaitInboxData;

  awaitInboxData = page.waitForResponse(res => 
    res.url().includes('includeStandardLEAF') && res.status() === 200
  );
  await page.getByRole('button', { name: 'View as Admin' }).click();
  await awaitInboxData;

  const dynTxt = 'Adan Wolf View ';
  const dynRegex = new RegExp(`^${dynTxt}.*`);
  const formMenu = page.getByRole('button', { name: dynRegex });
  const formContainer = page.locator('div.depContainer').filter({ has: formMenu });
  await formMenu.click();
  await expect(page.getByRole('link', { name: requestId_oneForm, exact: true }).first()).toBeVisible();
  await validateInboxTableColumns(formContainer.getByRole('table'), customForm_roleViewOneForm);
});

test('Role View: General custom columns display if multiple forms are present', async ({ page }) => {
  await page.goto(LEAF_URLS.PORTAL_HOME + 'report.php?a=LEAF_Inbox');
  await expect(page.locator('#indexSites')).toContainText(siteMapname);

  //Verify Role Customization
  let awaitInboxData = page.waitForResponse(res => 
    res.url().includes('includeStandardLEAF') && res.status() === 200
  );
  await expect(page.getByRole('button', { name: 'Organize by Roles' })).toBeVisible();
  await page.getByRole('button', { name: 'Organize by Roles' }).click();
  await awaitInboxData;

  const dynTxt = 'Tester Tester View';
  const dynRegex = new RegExp(`^${dynTxt}.*`);
  const testerMenu = page.getByRole('button', { name: dynRegex});
  const container = page.locator('div.depContainer').filter({ has: testerMenu });
  await testerMenu.click();
  await expect(page.getByRole('link', { name: requestId_multForms, exact: true }).first()).toBeVisible();
  await validateInboxTableColumns(container.getByRole('table'), customForm_roleViewMultiForms);
});

test('Submit a request with a stapled form (Config)', async ({ page }) => {
  //Add and Verify the Staples
  await page.goto(LEAF_URLS.FORM_EDITOR_FORM + customFormID);
  await page.getByRole('button', { name: 'Staple other form' }).click();
  await page.getByLabel('Select a form to merge').selectOption('form_dac2a');
  await expect(page.getByRole('button', { name: 'Add', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByText('Close').click();
  await expect(page.getByRole('button', { name: 'Test IFTHEN staple, stapled' })).toBeVisible();

  //create and submit request
  requestId_withStaple = await createTestRequest(page, 'AS - Service', stapledRequest, 'Multiple person designated');

  await expect(page.getByText('Form completion progress: 0% Next Question')).toBeVisible();

  await page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 1' }).fill('ad');
  await page.getByRole('cell', { name: 'Wolf, Adan Williamson. Direct' }).click();
  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 1' })).toHaveValue('userName:VTRHJHROSARIO');

  await page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 2' }).fill('h');
  await page.getByRole('cell', { name: 'Hackett, Linsey Spinka.' }).click();
  await expect(page.getByRole('searchbox', { name: 'Search for user to add as Reviewer 2' })).toHaveValue('userName:VTRXVPMADELAINE');

  const loadingIndicators = page.locator('div[id^="loadingIndicator_"]:visible');
  await expect(loadingIndicators).toHaveCount(0);
  await expect(page.locator('.input-required-error')).toHaveCount(0);

  await expect(page.locator('#nextQuestion2')).toBeVisible();
  await page.locator('#nextQuestion2').click();

  await expect(page.getByLabel('parent dropdown')).toBeVisible(); //stapled page
  await expect(page.locator('#nextQuestion2')).toBeVisible();
  await page.locator('#nextQuestion2').click();

  await expect(page.getByRole('button', { name: 'Submit Request' })).toBeVisible();
  const awaitSubmit = page.waitForResponse(res => 
    res.url().includes(`form/${requestId_withStaple}/submit`) && res.status() === 200
  );
  await page.getByRole('button', { name: 'Submit Request' }).click();
  await awaitSubmit;

  //remove the staple, which is not needed once submitted
  await page.goto(LEAF_URLS.FORM_EDITOR_FORM + customFormID);
  await expect(page.getByRole('button', { name: 'Staple other form' })).toBeVisible();
  await page.getByRole('button', { name: 'Staple other form' }).click();
  await expect(page.getByText('Test IFTHEN staple [ Remove ]')).toBeVisible();
  await page.getByRole('button', { name: 'remove Test IFTHEN staple' }).click();
  await expect(page.getByText('Test IFTHEN staple [ Remove ]')).not.toBeVisible();
  await page.getByText('Close').click();
});

test('Role View: Form specific columns display if only one form is present (with staple)', async ({ page }) => {
  let awaitInboxData = page.waitForResponse(res => 
    res.url().includes('includeStandardLEAF') && res.status() === 200
  );
  await page.goto(LEAF_URLS.PORTAL_HOME + 'report.php?a=LEAF_Inbox');
  await awaitInboxData;
  await expect(page.locator('#indexSites')).toContainText(siteMapname);

  await expect(page.locator('#inbox').getByText(siteMapname)).toBeVisible();
  await expect(page.getByRole('button', { name: 'View as Admin' })).toBeVisible();
  
  awaitInboxData = page.waitForResponse(res => 
    res.url().includes('includeStandardLEAF') && res.status() === 200
  );
  await page.getByRole('button', { name: 'Organize by Roles' }).click();
  await awaitInboxData;

  awaitInboxData = page.waitForResponse(res => 
    res.url().includes('includeStandardLEAF') && res.status() === 200
  );
  await page.getByRole('button', { name: 'View as Admin' }).click();
  await awaitInboxData;

  const dynTxt = 'Adan Wolf View ';
  const dynRegex = new RegExp(`^${dynTxt}.*`);
  const formMenu = page.getByRole('button', { name: dynRegex });
  const formContainer = page.locator('div.depContainer').filter({ has: formMenu });
  await formMenu.click();
  await expect(page.getByRole('link', { name: requestId_oneForm, exact: true }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: stapleName })).toBeVisible();
  await validateInboxTableColumns(formContainer.getByRole('table'), customForm_roleViewOneForm);
});

test('Delete test requests and Site Card (cleanup)', async ({ page }) => {
  const testRequests = [ requestId_oneForm, requestId_multForms, requestId_withStaple ];
  for(let i = 0; i < testRequests.length; i++) {
    await deleteTestRequestByRequestID(page, testRequests[i]);
    console.log("deleted", testRequests[i]);
  }
  
  const awaitSettings = page.waitForResponse(res =>
    res.url().includes('settings') && res.status() === 200
  );
  await page.goto(LEAF_URLS.PORTAL_HOME + 'report.php?a=LEAF_sitemaps_template');
  await awaitSettings;
  await expect(page.getByRole('button', { name: '+ Add Site' })).toBeVisible();

  await page.getByRole('heading', { name: siteMapname }).getByRole('link').click();
  await page.getByRole('button', { name: 'Delete Site' }).click();
});

});