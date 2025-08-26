import { Page } from '@playwright/test';

export class TestUtils {
  
  // Generate unique test data per test run
  static generateTestId(): string {
    return `test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }

  // Better network waiting for your Docker environment
  static async waitForNetworkIdle(page: Page, timeout = 15000): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout });
    // Additional small wait for any final settling
    await page.waitForTimeout(500);
  }

  // Reliable form filling that verifies the input
  static async fillFormField(page: Page, selector: string, value: string): Promise<void> {
    await page.waitForSelector(selector, { timeout: 10000 });
    await page.click(selector);
    await page.fill(selector, '');
    await page.fill(selector, value);
    
    // Verify the value was actually set
    const actualValue = await page.inputValue(selector);
    if (actualValue !== value) {
      throw new Error(`Form field not filled correctly. Expected: ${value}, Got: ${actualValue}`);
    }
  }

  // Get a stable record instead of relying on "first row"
  static async getAvailableRecordUID(page: Page): Promise<string> {
    await this.waitForNetworkIdle(page);
    await page.waitForSelector('//table/tbody/tr//a', { timeout: 15000 });
    
    const recordLinks = await page.locator('//table/tbody/tr//a').all();
    if (recordLinks.length === 0) {
      throw new Error('No records available for testing');
    }
    
    // Get text from the first available record, but make it more stable
    const uid = await recordLinks[0].textContent();
    if (!uid) {
      throw new Error('Could not extract UID from record');
    }
    
    return uid.trim();
  }

  // Wait for specific element to be stable (not just visible)
  static async waitForElementStable(page: Page, selector: string, timeout = 10000): Promise<void> {
    await page.waitForSelector(selector, { timeout });
    // Brief wait for any animations/changes to settle
    await page.waitForTimeout(200);
  }
}