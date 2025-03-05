# LEAF Testing – Quick Start

This guide shows how to install the necessary tools, set up LEAF and Docker, run the API tester, and then run the end-to-end (E2E) Playwright tests in your browser.

---

## 1. Prerequisites
1. **LEAF + Docker Setup**  
   Follow the official [LEAF Installation & Configuration guide](https://github.com/department-of-veterans-affairs/LEAF/blob/master/docs/InstallationConfiguration.md) to run LEAF in a Docker environment.  

## 2. Run the API Tester
1. Go to: **[https://host.docker.internal/](https://host.docker.internal/)**  
2. Locate and click on the **API Tester** link under Automated Tests.
3. Wait until the API tests pass successfully.

## 3. Run E2E Tests in the Browser
1. **Return** to **[https://host.docker.internal/](https://host.docker.internal/)**.  
2. Find **End-to-End tests (Playwright)** link and click to open the test runner in your browser. 
3. When the tests finish, you’ll see the final **Report** in the browser.