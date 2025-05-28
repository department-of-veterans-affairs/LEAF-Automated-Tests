# LEAF Automated Tests

This repository contains automated tests for https://github.com/department-of-veterans-affairs/LEAF.

## Running Tests

1. Install and Run the LEAF Development Environment:
    - https://github.com/department-of-veterans-affairs/LEAF/blob/master/docs/InstallationConfiguration.md
2. Navigate to https://host.docker.internal/ and follow prompts to run tests

## Types of Tests

Two types of automated tests are included, and more information may be found in their respective folders.

1. **API Tests**: Located in `API-tests/` folder. These tests primarily focus on testing API endpoints and accuracy of responses.
2. **End-to-end**: Located in `end2end/` folder. These tests simulate user interactions with a browser to ensure functionalities work as expected.