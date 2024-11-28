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

## Developing New Tests

Before developing new tests, please familiarize yourself with the following requirements.

### Synchronize your database

Before starting development, you must run the API tester ([How do I do this?](../README.md#running-tests)). This helps ensure that tests run consistently across all developer workstations.

### File Organization

Individual tests that can run in parallel must organized into files by their functional location. The functional location refers to the page in which the function occurs. For example, the Form Editor exists in the Admin Panel. Therefore the file would be named `adminPanelFormEditor` + file extension. Most tests should fall into this category.

Inter-dependent tests that exercise a series of features must be prefixed with `lifecycle`, and briefly describe its function. For example, `lifecycleSimpleTravel` implements a simple travel workflow, creates a record, applies approval actions, and builds a report.

Files must use camelCase. No spaces are permitted in filenames. Underscores should be used in lieu of spaces if needed.

### Naming Tests (Titles)

Test Titles must briefly and plainly explain the component or feature it exercises. For example, if we're creating a test on the homepage to check the search box's ability to find a specific record in a certain way, the title can be `search [specific record] using [method]`. It's not necessary to explain that the test is for the homepage, because this is implicit in the filename. Titles must be formatted in plain language, no naming conventions such as CamelCase should be used for the whole title.

### Screenshots

Including screenshots within tests is highly recommended, but not currently required. Screenshots provide value when reviewing tests, as it can be immediately apparent in a screenshot if a test is functioning correctly.


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