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
# Git Workflow Guide

### 1. Branch Management

- Always ensure you are on the correct branch before working on or executing tests.
- First, switch to the main branch:

```sh
git checkout main
```

- Pull the latest changes from the remote repository:

```sh
git pull origin main
```

- Create a new branch for your work:

```sh
git checkout -b <new-branch-name>
```

### 2. Making Changes and Committing
- After making your changes, stage them:

```sh
git add .
```

- Commit the changes with a meaningful message:

```sh
git commit -m "your commit message"
```

### 3. Pushing Changes to Remote Repository
- Push the new branch to the remote repository:

```sh
git push origin <branch-name>
```

### 4. Rebasing Your Branch
- Rebase your branch with the latest changes from the main branch:

```sh
git rebase main
```

### 5. Resolving Merge Conflicts (if any)
- If conflicts arise, Git will notify you. Open the conflicting files and manually resolve the conflicts.
- After resolving, stage the changes:

```sh
git add .
```

- Continue the rebase process:

```sh
git rebase --continue
```

- If you want to abort the rebase:

```sh
git rebase --abort
```

## Additional Resources
Follow this tutorial for more info:
- [Git & GitHub tutorial (YouTube)](https://youtu.be/Uszj_k0DGsg?si=TzAPM2bSS_Y7dlaC)

By following these steps, we can ensure a smooth and efficient workflow for the entire team.



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