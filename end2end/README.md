# LEAF End-to-end testing

These tests simulate interactions with LEAF from a web browser to help ensure the user interface is working as intended.

LEAF uses Playwright for end-to-end testing. The test database is populated and updated via LEAF's API tester.

## Installing Playwright* Development Tools

0. Prerequisites: 
    - Install [node.js](https://nodejs.org/en)
1. Set up and run the [LEAF Development Environment](https://github.com/department-of-veterans-affairs/LEAF/blob/master/docs/InstallationConfiguration.md)
3. On the command line: Navigate to the location where the development environment is installed
4. Change directory into `LEAF-Automated-Tests/end2end`
5. Install Playwright development tools using one of 2 methods:
    - If you only intend on running tests through the command line, use the following commands
        ```
        npm install -D @playwright/test@latest
        npx playwright install
        ```
   - In order to use the VSCode Playwright extension, Playwright must be installed using the following command:
       ```
       npm init playwright@latest
       ```
       As long as Playwright is being installed in LEAF-Automated-Tests/end2end, the default options can be used:
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

### Test Repeatability

Tests must pass on repeated runs. This helps ensure that tests remain robust, and provide significant value during the development process as tests are frequently run multiple times.

### Screenshots

Including screenshots within tests is highly recommended, but not currently required. Screenshots provide value when reviewing tests, as it can be immediately apparent in a screenshot if a test is functioning correctly.

## Sequential Testing

As a stop gap you may need to run the sequential tests. There is a `sequential-runner.ts` that will allow for running tests in sequence. This will run the api tests from the script to help simplify things. This will take upwards of 50 minutes at the time of writing.

1. Login to your container should be `docker exec -it leaf-playwright-1 bash`
2. Run the sequential test `npx tsx sequential-runner.ts tests/ --output my-test-report.txt`
    - You may be asked to install tsx.
3. When complete you can look at the out file. `head -n 20 my-test-report.txt` will show something similar ![Sequential Playwrite test report](sequential-pw-test-report.png "Sequential Playwrite test report")

There may be cases where you will need to run a single test `npx playwright test tests/{nameofthetest}.ts`



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
