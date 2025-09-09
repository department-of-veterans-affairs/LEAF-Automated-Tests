import { Page } from '@playwright/test';

/**
 * @param page Page instance from test
 * @param includesString part of url from network call to wait for 
 * @param callback action to take prior to awaiting promise
 */
export async function awaitPromise(page: Page, includesString:string = '', callback:Function) {  
  const promiseToAwait = page.waitForResponse(res =>
    res.url().includes(includesString) && res.status() === 200
  );
  await callback(page);
  await promiseToAwait;
}

// Generate unique test data
export function generateTestData() {
  const testId:string = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  return {
    titleText: `LEAF-4891-${testId}`,
    formName: `Test LEAF-4888-${testId}`,
    uniqueText: `Single line text ${testId}`,
    testId: testId
  };
}

// Docker-optimized waiting function (from primer)
export async function dockerWait(page: any, extraBuffer: number = 1000) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(extraBuffer);
}
