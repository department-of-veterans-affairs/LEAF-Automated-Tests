
# LEAF Automated Tests  

This repository contains automated tests. It is structured into three main folders, each serving a distinct purpose in testing the API and UI functionalities:

- `api-test-helper` – A helper service to trigger API tests.  
- `API-tests` – Contains test cases for validating API functionality.  
- `end2end` – Contains Playwright-based end-to-end UI tests.  

---

## Folder Overview  

### 1. `api-test-helper`  

The `api-test-helper` is a Go-based web service designed to **trigger API test execution** from the `API-tests` folder.

---

### 2. `API-tests`  

The `API-tests` folder contains **Go-based test files** that validate LEAF’s API endpoints. These tests verify API functionalities. 

#### Responsibilities:  

- **Validates API endpoints** for creating, updating, and deleting employee records.

### 3. `end2end`  

The `end2end` folder contains **Playwright-based automated tests for UI validation**.

#### Responsibilities:  

- **Validates user workflows**  
- **Ensures frontend functionality**
- **Runs tests in Playwright**