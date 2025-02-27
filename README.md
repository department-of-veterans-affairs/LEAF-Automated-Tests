# LEAF QA Automation Framework

This README provides guidelines for setting up, writing, and maintaining test cases in the LEAF QA Automation Framework. It ensures consistency and clarity for all team members working on test automation.

## Prerequisites

Before running tests, ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (Comes with Node.js)
- [Playwright](https://playwright.dev/) (Installed globally or locally)

### Install Dependencies

Run the following command to install project dependencies:

```sh
npm install
```

### Install Playwright Browsers

After installing dependencies, install Playwright browsers using:

```sh
npx playwright install
```

This ensures that all required browsers (Chromium, Firefox, WebKit) are downloaded and available for testing.

## Folder Structure

The framework follows this folder structure:

```
LEAF-Automated-Tests/
├── end2end/
│   ├── tests/                 # Contains all test files
│   │   ├── homepage.spec.ts   # Example test file
│   │   ├── adminPanel.spec.ts # Example test file
│   │   ├── global.setup.ts    # Handles global setup logic before tests
│   ├── playwright.config.ts   # Configuration file for Playwright
```

## Running Tests

### Execute All Tests

Run all test cases using:

```sh
npx playwright test
```

### Run Tests in Headed Mode

To run tests with a visible browser UI:

```sh
npx playwright test --headed
```

### Run a Specific Test

To execute a specific test file, use:

```sh
npx playwright test end2end/tests/homepage.spec.ts
```

### Generate HTML Report

To generate an HTML report after test execution:

```sh
npx playwright test --reporter=html
```

This will create a detailed test report in an HTML format that you can open in a browser.

## Test Writing Standards

### Organization

- All test files should be placed in the `tests/` folder.
- Group related tests logically and use clear file names to indicate their purpose.

### Naming Conventions

#### File Names

- Use descriptive and meaningful names.
  - Example: `homepage.spec.ts`, `adminPanelSettings.spec.ts`
- Always use `.spec.ts` as the suffix for Playwright compatibility.

#### Test Names

- Keep test names concise yet descriptive.
  - Good Example: `shouldDisplayErrorMessageWhenLoginFails`
  - Poor Example: `errorTest`

#### Variable and Function Names

- Use camelCase for all variable and function names.
  - Good Example: `loginButton`, `validateLoginPage`
  - Poor Example: `btn1`, `checkPage`

### Matching Test Scripts with Test Names in Excel

- Each test case written in the framework must match the corresponding test name in the Excel sheet.
- The Excel sheet serves as the source of truth for test case documentation and steps.
- Ensure that test names in scripts align exactly with those in the sheet to maintain traceability.

### Writing Test Cases

- Use Playwright's `test` blocks to define test cases:
  ```typescript
  import { test, expect } from '@playwright/test';

  test('should navigate to the homepage', async ({ page }) => {
      await page.goto('https://example.com');
      await expect(page).toHaveTitle('Example Domain');
  });
  ```
- Always include assertions to validate results:
  ```typescript
  await expect(page.locator('#successMessage')).toHaveText('Form saved successfully');
  ```
- Use shared setup logic with hooks like `test.beforeEach`:
  ```typescript
  test.beforeEach(async ({ page }) => {
      await page.goto('https://example.com/login');
  });
  ```
- Keep test cases modular, testing one scenario at a time.

### Test Data Management

- Avoid hardcoding values. Store reusable test data in `.json` files or constants:

  ```json
  {
      "username": "testUser",
      "password": "securePassword"
  }
  ```
- Use libraries like `faker` to generate random inputs when needed.

### Comments

- Add comments where necessary to explain complex test logic.

  ```typescript
  // Navigate to the login page
  await page.goto('https://example.com/login');
  ```
- Avoid redundant comments that restate obvious actions.

---

This guide helps you set up and run tests efficiently using Playwright. For further details, refer to the [Playwright Documentation](https://playwright.dev/).

