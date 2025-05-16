
# LEAF QA Automation Framework

This README provides clear and simple guidelines for writing and maintaining test cases in the LEAF QA Automation Framework. It’s designed to keep everything consistent and easy to understand for everyone working on the project.

## Folder Structure

- `tests/`: All test files are stored here.
  - Example: `homepage.spec.ts`, `adminPanelFormEditor.spec.ts`
- `global.setup.ts`: Handles global setup logic executed before tests.
- `playwright.config.ts`: Configuration file for Playwright.

## Test Writing Standards

### Organization

- All test files go into the `tests/` folder.
- Group related tests logically and use clear file names that explain the purpose of the tests.

### Naming Conventions

#### File Names

- Use descriptive and meaningful file names.
  - Example: `homepage.spec.ts` for homepage-related tests, `adminPanelSettings.spec.ts` for admin settings tests.
- File names should indicate the functionality being tested.
- Always use `.spec.ts` as the suffix for consistency and Playwright compatibility.

### Matching Test Scripts with Test Names in Excel

- Each test case written in the framework must match the corresponding test name in the Excel sheet.
- The Excel sheet serves as a source of truth for test case documentation and steps.
- Ensure that the test name in the script aligns exactly with the test name in the sheet to maintain traceability.
- Example workflow:
  1. Locate the test name in the Excel sheet.
  2. Write the corresponding test case in the `tests/` folder.
  3. Validate the implementation by cross-referencing the test steps from the Excel sheet.

#### Test Names

- Keep test names concise yet descriptive, clearly stating the intent of the test.
  - Good Example: `shouldDisplayErrorMessageWhenLoginFails`
  - Poor Example: `errorTest`
  - Avoid using long, overly complicated names.

#### Variable and Function Names

- Use camelCase for all variable and function names.
- Names should describe the purpose clearly. Avoid generic names like `data` or `test1`.
  - Good Example: `loginButton`, `validateLoginPage`
  - Poor Example: `btn1`, `checkPage`

### Writing Test Cases

- Use Playwright's `test` blocks to define test cases:
  ```typescript
  import { test, expect } from '@playwright/test';

  test('should navigate to the homepage', async ({ page }) => {
      await page.goto('https://example.com');
      await expect(page).toHaveTitle('Example Domain');
  });
  ```
- Always include assertions to validate your results:
  ```typescript
  await expect(page.locator('#successMessage')).toHaveText('Form saved successfully');
  ```
- Use shared setup logic with hooks like `test.beforeEach`:
  ```typescript
  test.beforeEach(async ({ page }) => {
      await page.goto('https://example.com/login');
  });
  ```
- Ensure test cases are modular and only test one scenario at a time.
  - Good Example: A test for successful login should not also check the homepage UI.

### Test Data Management

- Don’t hardcode values. Store reusable test data in `.json` files or constants:
  ```json
  {
      "username": "testUser",
      "password": "securePassword"
  }
  ```
- For dynamic data, consider using libraries like `faker` to generate random inputs when needed.

### Formatting and Indentation

- Use consistent 2-space indentation across all files.
- Ensure there’s a blank line between test cases for readability.
- Break long lines at around 80-100 characters.
- Organize imports at the top of the file, grouped by library and relative imports.

#### Examples:

**Consistent 2-Space Indentation:**

```typescript
import { test, expect } from '@playwright/test';

test('should navigate to the homepage', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle('Example Domain');
});
```

**Blank Line Between Test Cases:**

```typescript
test('should display login page', async ({ page }) => {
  await page.goto('https://example.com/login');
  await expect(page.locator('h1')).toHaveText('Login');
});

test('should allow user to log in', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.fill('#username', 'testUser');
  await page.fill('#password', 'securePassword');
  await page.click('#loginButton');
  await expect(page).toHaveURL('https://example.com/dashboard');
});
```

**Breaking Long Lines:**

```typescript
test('should display error message when login fails due to incorrect credentials', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.fill('#username', 'wrongUser');
  await page.fill('#password', 'wrongPassword');
  await page.click('#loginButton');
  await expect(page.locator('#errorMessage'))
    .toHaveText('Invalid username or password. Please try again.');
});
```

**Organized Imports:** // NOT SURE IF WE NEED THIS !!!!

```typescript
// Library imports
import { test, expect } from '@playwright/test';

// Relative imports
import { loginAsAdmin } from '../utils/auth';
import { getTestData } from '../data/testData';
```

### Comments

- Add comments to explain parts of the test that aren’t obvious or are crucial to understand the test logic.
  ```typescript
  // Navigate to the login page
  await page.goto('https://example.com/login');
  ```
- Avoid redundant comments that simply restate what the code does.
