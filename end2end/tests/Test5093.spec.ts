import { test, expect } from '@playwright/test';
import {
    getRandomId,
    createTestRequest
} from '../leaf_test_utils/leaf_util_methods.ts';

const testID = getRandomId();

test('Required Not Highlighted When Group is Populated', async ({ page }) => {
    
    let requestID = '';

    try{
        
        // Create a new request
        requestID = await createTestRequest(page, 'Concrete Music', `New Request ${testID}`, 'General Form');

        // Skip first page
        await page.locator('#nextQuestion2').click();

        // Set assigned person to Hank Healthcare Abbott
        await page.getByLabel('Search for user to add as Assigned Person', { exact: true }).fill('userName:VTRJWVANGEL');
        await page.getByRole('cell', { name: 'Abbott, Hank Healthcare' }).click();
        await page.locator('#nextQuestion2').click();

        // Verify Assigned Group is visible on the 3rd page and click Next Question
        await expect(page.getByText('Assigned Group', { exact: true })).toBeVisible();
        await page.locator('#nextQuestion2').click();

        // Verify the Input-Required-Error formatting (white text, red background) is displayed
        await expect(page.getByText('* Required')).toHaveClass('input-required input-required-error');

        // Set the Assigned Group to "AS Test Group"
        await page.getByLabel('Search for user to add as Assigned Group').click();
        await page.getByLabel('Search for user to add as Assigned Group').fill('group#200');
        await expect(page.locator('td')).toContainText('AS Test Group');
        await page.getByRole('cell', { name: 'AS Test Group' }).click();

        // Verify the Input-Required-Error formatting is not displayed
        // (* Request is just red text)
        await expect(page.getByText('* Required')).toHaveClass('input-required');
    } finally {
        
        // delete the request if it was created
        if(requestID != '') {
            await page.getByRole('button', { name: 'Cancel Request' }).click();
            await page.getByRole('button', { name: 'Yes' }).click();
        }
    }
    
 });
