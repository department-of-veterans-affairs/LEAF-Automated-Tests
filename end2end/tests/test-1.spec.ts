import { test, expect } from '@playwright/test';
import { 
  getRandomId,
  createTestForm,
  deleteTestFormByFormID
 } from '../leaf_test_utils/leaf_util_methods.ts';

const testID = getRandomId();


test('test', async ({ page }) => {

  const NO_WORKFLOW = '0';
  const UNPUBLISHED = '-1';
  const NEED_TO_KNOW_ON = '1';
  const FORM_TYPE_STANDARD = '';

  let formID = await createTestForm(page, `form_name_${testID}`, `form_descr_${testID}`);

  const selectWorkflow = page.locator('#workflowID');
  await expect(selectWorkflow).toHaveValue(NO_WORKFLOW);

  const selectAvailability = page.locator('#availability');
  await expect(selectAvailability).toHaveValue(UNPUBLISHED);

  const needToKnow = page.locator('#needToKnow');
  await expect(needToKnow).toHaveValue(NEED_TO_KNOW_ON);

  const formType = page.locator('#formType');
  await expect(formType).toHaveValue(FORM_TYPE_STANDARD);

  await deleteTestFormByFormID(page, formID);
});