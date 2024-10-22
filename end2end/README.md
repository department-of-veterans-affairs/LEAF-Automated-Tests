# LEAF End-to-end testing

These tests simulate interactions with LEAF from a web browser to help ensure the user interface is working as intended.

LEAF uses Playwright for end-to-end testing. The test database is populated and updated via LEAF's API tester.

## Installing Playwright* Development Tools

0. Prerequisites: 
    - Install [node.js](https://nodejs.org/en)
1. Set up and run the [LEAF Development Environment](https://github.com/department-of-veterans-affairs/LEAF/blob/master/docs/InstallationConfiguration.md)
3. On the command line: Navigate to the location where the development environment is installed
4. Change directory into `LEAF-Automated-Tests/end2end`
5. Install Playwright development tools:
```
npm install -D @playwright/test@latest
npx playwright install
```

*Note: If you decide to use Playwright's installation instructions, it will prompt with with some decisions that need to be made. The choices we've made are:
  - TypeScript or JavaScript? **TypeScript**
  - Name of your tests folder? **tests**
  - GitHub Actions workflow? **N**
  - Install browsers? **Y**


## Useful commands

These commands should be run from within the folder: `LEAF-Automated-Tests/end2end`

Start Playwright's code generator UI:
```
npx playwright codegen --ignore-https-errors https://host.docker.internal/Test_Request_Portal/
```

Debug tests:
```
npx playwright test --ui
```

View trace:
```
npx playwright show-trace [path to trace.zip]
```
