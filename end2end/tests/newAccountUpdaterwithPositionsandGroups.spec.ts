import { test, expect, Page } from '@playwright/test';
import { LEAF_URLS } from '../leaf_test_utils/leaf_util_methods';

test.describe.configure({ mode: 'serial' });

const gridContainerIDs:Array<string> = [
  '#grid_initiator', '#grid_orgchart_employee', '#grid_groups_info', '#grid_positions_info'
]
const originalRequestsRequestor:Array<string> = [ '561' ];
const originalRequestsEmployee:Array<string> = [ '341', '33' ];
const originalGroups:Array<string> = [ 'Iron Sports'];
const originalPositions:Array<string> = [
  'LEAF Coaches', 'Chief of Everything', 'Chief, Facilties', 'Dog Sitter West Region'
];

interface UserInfo {
  username: string;
  userDisplay: string;
}

let fromUser:UserInfo = {
  username: 'vtrfaufelecia',
  userDisplay: 'Schultz, Phuong Boyer.',
};
let toUser:UserInfo = {
  username: 'vtrvxhconception',
  userDisplay: 'Predovic, Augustine Hammes.',
};

/** the two methods here are used only in this file */
/**
 * Set the from and to accounts and preview results.
 * @param page page instance of the test
 * @param fromUser from account info
 * @param toUser to account info
 */
const fillAndPreview = async (page:Page, fromUser:UserInfo, toUser:UserInfo) => {
  await page.locator('#employeeSelector').getByLabel('search input').fill(fromUser.username);
  await page.getByRole('cell', { name: fromUser.userDisplay }).click();

  await page.locator('#newEmployeeSelector').getByLabel('search input').fill(toUser.username);
  await page.getByRole('cell', { name: toUser.userDisplay }).click();

  await expect(page.getByText('New Account Search results')).toBeVisible();
  await page.getByRole('button', {name: 'Preview Changes'}).click();
  await expect(page.locator('#section2')).toBeVisible();
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('button', { name: 'Update Records' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start Over' })).toBeVisible();
  await expect(page.getByText("Building report")).toHaveCount(0);

  expect(await page.locator('#grid_initiator').textContent() ?? '').not.toBe('');
  expect(await page.locator('#grid_orgchart_employee').textContent() ?? '').not.toBe('');
  expect(await page.locator('#grid_groups_info').textContent() ?? '').not.toBe('');
  expect(await page.locator('#grid_positions_info').textContent() ?? '').not.toBe('');
}

/**
 * Confirm outcome of account updater swap tests.
 * @param page page instance of the test
 */
const verifySwaps = async (page:Page) => {
  await expect(page.getByRole('heading', { name: 'Updates Complete'})).toBeVisible();
  await expect(page.locator('#no_errors')).toContainText('no errors');
  for (let i = 0; i < originalRequestsRequestor.length; i++) {
    await expect(
      page.locator('#initiators_updated')
    ).toContainText(`Request #${originalRequestsRequestor[i]} reassigned to ${toUser.username}`);
  }
  for (let i = 0; i < originalRequestsEmployee.length; i++) {
    await expect(
      page.locator('#orgchart_employee_updated'),
    ).toContainText(new RegExp(`Request #${originalRequestsEmployee[i]},.+(?=updated to ${toUser.username})`));
  }
  for (let i = 0; i < originalGroups.length; i++) {
    await expect(
      page.locator('#groups_updated')
    ).toContainText(`Removed ${fromUser.username} and added ${toUser.username} to ${originalGroups[i]} (nexus)`);
  }
  for (let i = 0; i < originalPositions.length; i++) {
    await expect(page.locator('#positions_updated')).toContainText(
      `Removed ${fromUser.username} and added ${toUser.username} to position: ${originalPositions[i]}`
    );
  }
  //there is no way to specify requestor swaps so cannot assert count with certainty
  await expect(page.locator('#orgchart_employee_updated > div')).toHaveCount(originalRequestsEmployee.length);
  await expect(page.locator('#groups_updated > div')).toHaveCount(originalGroups.length);
  await expect(page.locator('#positions_updated > div')).toHaveCount(originalPositions.length);
}

test.describe('Account Updater functionalities', () => {
  test('lookup user account from nexus', async ({ page }) => {
    await page.goto(LEAF_URLS.NEXUS_HOME);
    await expect(page.getByText('Search Available Search')).toBeVisible();

    await page.getByLabel('Search', { exact: true }).click();
    await page.keyboard.type(`username.disabled:${fromUser.username}`);
    await expect(page.locator('#employeeBody')).toBeVisible();
    await page.getByRole('link', { name: fromUser.userDisplay}).click();
  
    //Verify account page and that user has positions assigned
    await expect(page.locator('#employeeAccount')).toHaveText(fromUser.username);
    await expect(page.getByText('Position Assignments')).toBeVisible();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#positionBody ul li')).toHaveCount(originalPositions.length);
  });

  test('swap requestor, employee field, groups and positions', async ({ page }) => {
    await page.goto(LEAF_URLS.ACCOUNT_UPDATER);

    //Sync the Service first
    const syncPromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Sync Services' }).click();
    const syncPage = await syncPromise;
    await expect(syncPage.getByText('Syncing has finished. You are set to go.')).toBeVisible();

    await fillAndPreview(page, fromUser, toUser);

    //tables and export buttons exist.  There is at least one row expected for each
    for (let i = 0; i < gridContainerIDs.length; i++) {
      const gridLoc = page.locator(gridContainerIDs[i]);
      await expect(gridLoc.getByRole('button', { name: 'Export' })).toBeVisible();
      await expect(gridLoc.locator('table tbody tr').first()).toBeVisible();
      await expect(gridLoc.getByText("Building report")).toHaveCount(0);
    }

    //Accept changes - swap everything for this first test
    await page.getByRole('button', { name: 'Update Records' }).click();
    await verifySwaps(page);
  });

  //Switch Groups & Positions back to the Disabled User
  test('swap back - checkboxes can select fields, groups and positions', async ({ page }) => {
    await page.goto(LEAF_URLS.ACCOUNT_UPDATER);

    //Sync the Service first
    const syncPromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Sync Services' }).click();
    const syncPage = await syncPromise;
    await expect(syncPage.getByText('Syncing has finished. You are set to go.')).toBeVisible();

    fromUser = {
      username: 'vtrvxhconception',
      userDisplay: 'Predovic, Augustine Hammes.',
    };
    toUser = {
      username: 'vtrfaufelecia',
      userDisplay: 'Schultz, Phuong Boyer.',
    }

    await fillAndPreview(page, fromUser, toUser);

    /*
    Where possible (Requestor swap is not optional), use checkboxes to swap only the orig values.
    */
    for (let i = 0; i < gridContainerIDs.length; i++) {
      const gridLoc = page.locator(gridContainerIDs[i]);
      await expect(gridLoc.getByRole('button', { name: 'Export' })).toBeVisible();
      await expect(gridLoc.locator('table tbody tr').first()).toBeVisible();
      await expect(gridLoc.getByText("Building report")).toHaveCount(0);
      if (i === 0) { //there is no checkbox for requestor swap table
        await expect(gridLoc.locator('th input')).not.toBeVisible();
      } else {
        //uncheck all requests
        await expect(gridLoc.locator('th input')).toBeVisible();
        await gridLoc.locator('th input').setChecked(false);
        const gridRows = await gridLoc.getByRole('row').all();
        for (let i = 0; i < gridRows.length; i++) {
          await expect(gridRows[i].getByRole('checkbox')).not.toBeChecked();
        }

        switch(i) {
          case 1: //employee swaps
            for (let e = 0; e < originalRequestsEmployee.length; e++) {
              const row = gridLoc.locator(`tr:has(td[id$="_${originalRequestsEmployee[e]}_uid"])`);
              await row.getByRole('checkbox').setChecked(true);
            }
            break;
          case 2: //groups
            for (let g = 0; g < originalGroups.length; g++) {
              const hasCell = page.locator('td', { hasText: originalGroups[g] });
              const row = gridLoc.locator('tr').filter({ has: hasCell });
              await row.getByRole('checkbox').setChecked(true);
            }
            break;
          case 3: //positions
            for (let p = 0; p < originalPositions.length; p++) {
              const hasCell = page.locator('td', { hasText: originalPositions[p] });
              const row = gridLoc.locator('tr').filter({ has: hasCell });
              await row.getByRole('checkbox').setChecked(true);
            }
          default:
          break;
        }
      }
    }

    await page.getByRole('button', { name: 'Update Records' }).click();
    await verifySwaps(page);
  });

  test('test page behavior when no groups or positions are found, no field updates', async ({ page }) => {
    /* already synced in above tests */
    await page.goto(LEAF_URLS.ACCOUNT_UPDATER);

    fromUser = {
      username: 'vtrmvtlynnette',
      userDisplay: 'Jacobs, Gilbert Wilderman.',
    };
    toUser = {
      username: 'vtrkmwroseann',
      userDisplay: 'Greenholt, Shirlene Parisian',
    }

    await fillAndPreview(page, fromUser, toUser);

    //do not move these employee fields
    await expect(page.locator(`#grid_orgchart_employee`).getByRole('button', { name: 'Export' })).toBeVisible();
    const gridEmployee = page.locator('#grid_orgchart_employee th input');
    await expect(gridEmployee).toBeVisible();
    await gridEmployee.setChecked(false);
    const gridRows = await page.locator('#grid_orgchart_employee').getByRole('row').all();

    for (let i = 0; i < gridRows.length; i++) {
      await expect(gridRows[i].getByRole('checkbox')).not.toBeChecked();
    }

    await expect(page.locator('#grid_groups_info')).toContainText('No groups found');
    await expect (page.locator('#grid_positions_info')).toContainText('No Positions found');

    await page.getByRole('button', { name: 'Update Records' }).click();

    await expect(page.locator('#orgchart_no_updates')).toContainText('no updates');
    await expect(page.locator('#groups_no_updates')).toContainText('no updates');
    await expect(page.locator('#positions_no_updates')).toContainText('no updates');
    await expect(page.locator('#no_errors')).toContainText('no errors');
  });
})