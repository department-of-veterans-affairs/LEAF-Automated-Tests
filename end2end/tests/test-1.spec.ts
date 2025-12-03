import { test, expect } from '@playwright/test';
import {
    LEAF_URLS, 
    getRandomId
} from '../leaf_test_utils/leaf_util_methods';

const emailID = getRandomId();
const fakeEmail = `email_${emailID}@sierra7.com`;
const selectedTemplate = 'Automated Email Reminder';

test('Changing Email To: Displays Custom Label and Restore Button After Reload', async ({ page }) => {

  let emailToSaved = false;

  try {
    await page.goto(LEAF_URLS.PORTAL_HOME + 'admin/?a=mod_templates_email');
    await page.getByRole('button', { name: selectedTemplate }).click();
    await page.getByLabel('Email To:').click();
    await page.getByLabel('Email To:').fill(fakeEmail);
    await page.getByRole('button', { name: 'Save Changes' }).click();
    emailToSaved = true;

    await page.reload();
    await expect(page.locator('li').filter({ hasText: selectedTemplate + ' (custom)' }).locator('span')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Restore Original' })).toBeVisible();

  } finally {

    if(emailToSaved) {
      await page.getByRole('button', { name: 'Restore Original' }).click();
      await page.getByRole('button', { name: 'Yes' }).click();
    }
  }
});

test('Changing Email CC: Displays Custom Label and Restore Button After Reload', async ({ page }) => {

  let emailCCSaved = false;

  try{
    await page.goto(LEAF_URLS.PORTAL_HOME + 'admin/?a=mod_templates_email');
    await page.getByRole('button', { name: selectedTemplate }).click();
    await page.getByLabel('Email CC:').click();
    await page.getByLabel('Email CC:').fill(fakeEmail);
    await page.getByRole('button', { name: 'Save Changes' }).click();
    emailCCSaved = true;

    await page.reload();
    await expect(page.locator('li').filter({ hasText: selectedTemplate + ' (custom)' }).locator('span')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Restore Original' })).toBeVisible();
  } finally {

    if(emailCCSaved) {
      await page.getByRole('button', { name: 'Restore Original' }).click();
      await page.getByRole('button', { name: 'Yes' }).click();
    } 
  }
});

test('Changing Subject: Displays Custom Label and Restore Button After Reload' , async ({ page }) => {
  
  let subjectSaved = false;

  try {
    await page.goto('https://host.docker.internal/Test_Request_Portal/admin/?a=mod_templates_email');
    await page.getByRole('button', { name: selectedTemplate }).click();
    await page.getByRole('textbox', { name: 'Template Editor coding area.' }).fill('Important! ');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    subjectSaved = true;

    await expect(page.locator('li').filter({ hasText: selectedTemplate + ' (custom)'}).locator('span')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Restore Original' })).toBeVisible();

  } finally {
    if(subjectSaved) {
      await page.getByRole('button', { name: 'Restore Original' }).click();
      await page.getByRole('button', { name: 'Yes' }).click();
    }
  }
})