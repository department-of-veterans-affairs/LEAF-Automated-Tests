# LEAF End-to-end testing

TODO: Add overview

# LEAF Automated Tests

This repository contains automated end-to-end tests for the LEAF application, developed using Playwright. Follow the instructions below to set up, install dependencies, and run tests in this project.

## Prerequisites

Ensure you have the following installed on your system:

1. **Node.js**: Required to run Playwright. Check your installation by running:

   node -v

2. **npm**: Installed with Node.js, used for managing packages. Verify by running:

   npm -v

## Installation

Follow these steps to install Playwright:

1. **Navigate to the Project Directory**

   The Playwright configuration and setup files (`playwright.config.ts` and `package.json`) are located in `LEAF-Automated-Tests/end2end`.

   Open your terminal and navigate to this directory:

cd LEAF-Automated-Tests/end2end

2. **Install Playwright**

   Inside the `end2end` directory, run the following command to install Playwright:

   npm install @playwright/test

   This command will add Playwright as a dependency in the `package.json` file and ensure it is installed in the `node_modules` folder within the `end2end` directory.

3. **Install Playwright Browsers**

   Playwright requires specific browsers for testing. To install these, run:

   npx playwright install

   This command downloads the required browsers (Chromium, Firefox, and WebKit) for testing.

   This setup ensures that all dependencies are correctly located within the `end2end` directory.

## Running Tests

To execute tests using Playwright, follow these steps:

1. **Navigate to the `end2end` Directory**

   Ensure you are in the `end2end` directory:

   cd LEAF-Automated-Tests/end2end

2. **Run the Tests**

   Use the following command to run all tests:

   npx playwright test

3. **Running Specific Tests**

   To run a specific test or test suite, use the following command:

   npx playwright test tests/example.spec.ts

## Troubleshooting

- **Cannot Find Module Error**

  If you encounter an error like:

  Error: Cannot find module 'C:\Users\Nikesh\LEAF\LEAF\node_modules\@playwright\test\cli.js'
  at Module.\_resolveFilename (node:internal/modules/cjs/loader:1225:15)
  at Module.\_load (node:internal/modules/cjs/loader:1051:27)
  at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:174:12)
  at node:internal/main/run_main_module:28:49

  This usually means that the Playwright module cannot be found. To resolve this:

  1. Verify that `node_modules` exists within the `end2end` directory (and not at the project root).
  2. If `node_modules` is missing, reinstall Playwright by following the [Installation](#installation) steps above.

- **Other Errors**

  Ensure you are running all commands from within the `end2end` directory to prevent path-related issues.

## Notes

- **File Structure**: All Playwright-related files (`playwright.config.ts`, `package.json`, and `node_modules`) are organized within `LEAF-Automated-Tests/end2end` for clarity and modularity.

- **Additional Documentation**: For further customization and configuration, refer to the official [Playwright documentation](https://playwright.dev/docs/intro).

## Useful commands

Start Playwright's code generator UI:

npx playwright codegen --ignore-https-errors https://host.docker.internal/Test_Request_Portal/

Debug tests:

npx playwright test --ui

View trace:

npx playwright show-trace [path to trace.zip]
