# LEAF QA Automation Framework

This README provides guidelines for setting up, writing, and maintaining test cases in the LEAF QA Automation Framework.

---

## Prerequisites
1. **Node.js**
2. **NPM**
3. **Playwright** (installed via `npm install` or `npm init playwright@latest`)

## Folder Structure

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
```sh
npx playwright test
```

### Run Tests in Headed Mode
```sh
npx playwright test --headed
```

### Run a Specific Test
```sh
npx playwright test end2end/tests/homepage.spec.ts
```

## Debugging Tests
To run a test in debug mode and step through it:
```sh
npx playwright test end2end/tests/homepage.spec.ts --debug
```
This launches the [Playwright Inspector](https://playwright.dev/docs/inspector), allowing you to pause and inspect execution step by step.

## Matching Test Scripts with Test Names in Excel
- Each test case written in this framework **must** match its corresponding test name in the Excel sheet.
- The Excel sheet is the source of truth for test documentation and steps.
- Ensure test names in the scripts match exactly with the sheet for consistency and traceability.

---

For more details, see the [Playwright Documentation](https://playwright.dev/).