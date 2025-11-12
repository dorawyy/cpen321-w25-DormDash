# Testing and Code Review

## 1. Change History

| **Change Date** | **Modified Sections** | **Rationale** |
|-----------------| --------------------- | ------------- |
| _Nov 12_        |         All          | Initial document creation. |

---

## 2. Back-end Test Specification: APIs

### 2.1. Locations of Back-end Tests and Instructions to Run Them

#### 2.1.1. Tests

| **Interface**                 | **Describe Group Location, No Mocks**                | **Describe Group Location, With Mocks**            | **Mocked Components**              |
| ----------------------------- | ---------------------------------------------------- | -------------------------------------------------- | ---------------------------------- |
| **POST /user/login**          | [`tests/unmocked/authenticationLogin.test.js#L1`](#) | [`tests/mocked/authenticationLogin.test.js#L1`](#) | Google Authentication API, User DB |
| **POST /study-groups/create** | ...                                                  | ...                                                | Study Group DB                     |
| ...                           | ...                                                  | ...                                                | ...                                |
| ...                           | ...                                                  | ...                                                | ...                                |

#### 2.1.2. Commit Hash Where Tests Run

`[Insert Commit SHA here]`

#### 2.1.3. Explanation on How to Run the Tests

1. **Clone the Repository**:

    - Open your terminal and run:
      ```
      git clone https://github.com/example/your-project.git
      ```

2. **...**

### 2.2. GitHub Actions Configuration Location

`~/.github/workflows/backend-tests.yml`

### 2.3. Jest Coverage Report Screenshots for Tests Without Mocking

_(Placeholder for Jest coverage screenshot without mocking)_

### 2.4. Jest Coverage Report Screenshots for Tests With Mocking

_(Placeholder for Jest coverage screenshot with mocking)_

### 2.5. Jest Coverage Report Screenshots for Both Tests With and Without Mocking

_(Placeholder for Jest coverage screenshot both with and without mocking)_

---

## 3. Back-end Test Specification: Tests of Non-Functional Requirements

### 3.1. Test Locations in Git

| **Non-Functional Requirement**  | **Location in Git**                              |
| ------------------------------- | ------------------------------------------------ |
| **Performance (Response Time)** | [`tests/nonfunctional/response_time.test.js`](#) |
| **Chat Data Security**          | [`tests/nonfunctional/chat_security.test.js`](#) |

### 3.2. Test Verification and Logs

- **Performance (Response Time)**

    - **Verification:** This test suite simulates multiple concurrent API calls using Jest along with a load-testing utility to mimic real-world user behavior. The focus is on key endpoints such as user login and study group search to ensure that each call completes within the target response time of 2 seconds under normal load. The test logs capture metrics such as average response time, maximum response time, and error rates. These logs are then analyzed to identify any performance bottlenecks, ensuring the system can handle expected traffic without degradation in user experience.
    - **Log Output**
      ```
      [Placeholder for response time test logs]
      ```

- **Chat Data Security**
    - **Verification:** ...
    - **Log Output**
      ```
      [Placeholder for chat security test logs]
      ```

---

## 4. Front-end Test Specification

### 4.1. Location in Git of Front-end Test Suite:

`frontend/src/androidTest/java/com/cpen321/usermanagement/features`

### 4.2. Tests

- **Use Case: Login**

    - **Expected Behaviors:**
      | **Scenario Steps** | **Test Case Steps** |
      | ------------------ | ------------------- |
      | 1. The user opens "Add Todo Items" screen. | Open "Add Todo Items" screen. |
      | 2. The app shows an input text field and an "Add" button. The add button is disabled. | Check that the text field is present on screen.<br>Check that the button labelled "Add" is present on screen.<br>Check that the "Add" button is disabled. |
      | 3a. The user inputs an ill-formatted string. | Input "_^_^^OQ#$" in the text field. |
      | 3a1. The app displays an error message prompting the user for the expected format. | Check that a dialog is opened with the text: "Please use only alphanumeric characters ". |
      | 3. The user inputs a new item for the list and the add button becomes enabled. | Input "buy milk" in the text field.<br>Check that the button labelled "add" is enabled. |
      | 4. The user presses the "Add" button. | Click the button labelled "add ". |
      | 5. The screen refreshes and the new item is at the bottom of the todo list. | Check that a text box with the text "buy milk" is present on screen.<br>Input "buy chocolate" in the text field.<br>Click the button labelled "add".<br>Check that two text boxes are present on the screen with "buy milk" on top and "buy chocolate" at the bottom. |
      | 5a. The list exceeds the maximum todo-list size. | Repeat steps 3 to 5 ten times.<br>Check that a dialog is opened with the text: "You have too many items, try completing one first". |

    - **Test Logs:**
      ```
      [Placeholder for Espresso test execution logs]
      ```

**Feature: Find Jobs**
- **Use Case: Browse and Filter Jobs**

  **Expected Behaviors:**

| **Scenario Steps**                                                                                                                                                                                  | **Test Case Steps**                                                                                                                                                                                              |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1. Mover clicks on "Find Jobs" on the navigation bar on the bottom of the home page.                                                                                                                | Wait for the app to load the mover main screen (wait until "Find Jobs" text is present).<br/>Click the "Find Jobs" button in the navigation bar.<br>Wait for the screen to load.                                 |
| 2. The system displays all unassigned jobs including the pickup, drop-off addresses, volume of items, date and time, the type of job (storage or return) and the credit they can earn from the job. | Check that the Job List is displayed.<br>Check that Job's pickup, dropoff address, volume, date/time,type and credits are displayed.                                                                             |
| 2a. No unassigned jobs exist                                                                                                                                                                        | Navigate to Find Jobs screen.<br>Wait for the screen to load.                                                                                                                                                    |
| 2a1. Display to mover that there are no jobs available                                                                                                                                              | Check that the text "No available jobs" is displayed.<br>Check that 0 job cards are present on screen.                                                                                                           |
| 3. Mover can click toggle to switch jobs displayed from "Show All" to "Within Availability"                                                                                                         | Navigate to Find Jobs screen.<br>Wait for jobs to load.<br>Check that text "Show All" is displayed.<br>Check that 2 job cards are displayed.<br>Click the `availability_switch`.<br>Wait for filtering to apply. |
| 4. System displays unassigned jobs only within mover's availability time windows                                                                                                                    | Check that text "Show All" does not exist.  Check that text "Within Availability" is displayed.<br>Check that only 1 job card is displayed.                                                                      |
| 4a. No unassigned jobs exist within mover's availability                                                                                                                                            | Click the `availability_switch`.<br>Wait for filtering to apply.                                                                                                                                                 |
| 4a1. Display to mover that there are no jobs available currently with suggestion to broaden their availability                                                                                      | Check that text "No available jobs within your availability" is displayed.<br>Check that 0 job cards are present on screen.                                                                                      |
| 5. Mover can optionally accept the job (see UC-4 "Accept Job" use case)                                                                                                                             | [See UC-4 "Accept Job" test case]                                                                                                                                                                                |
    

- **Test Logs:**
    ```
    [Placeholder for Espresso test execution logs]
    ```


- **Use Case: Accept Job**

  **Expected Behaviors:**

| **Scenario Steps**                                                                                                                                                                                      | **Test Case Steps**                                                                                                                                                                                                                        |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1. Mover clicks on “Accept” for the corresponding job they’d like to accept.                                                                                                                            | Click the "Find Jobs" tab and wait for the jobs to load <br>Verify the "Accept" button is displayed, enabled. <br>Record the initial number of Jobs. Click the "Accept" button.                                                            |
| 2. System assigns the job to the mover, Firebase Cloud Messaging Service notifies the student who created the order that it has been accepted, and a live update occurs for the student’s order status. | After acceptance, navigate to the "Current Jobs" tab.                                                                                                                                                                                      |
| 3. Mover sees the job listed under “Current Jobs”                                                                                                                                                       | Confirm the accepted job appears in Current Job List and the job status is shown.<br>Return to "Find Jobs", wait for the list to refresh, and assert that the number of Job entries decreased by 1 compared to the recorded initial count. |

- **Test Logs:**
    ```
    [Placeholder for Espresso test execution logs]
    ```

---

## 5. Automated Code Review Results

### 5.1. Commit Hash Where Codacy Ran

`[Insert Commit SHA here]`

### 5.2. Unfixed Issues per Codacy Category

_(Placeholder for screenshots of Codacy's Category Breakdown table in Overview)_

### 5.3. Unfixed Issues per Codacy Code Pattern

_(Placeholder for screenshots of Codacy's Issues page)_

### 5.4. Justifications for Unfixed Issues

- **Code Pattern: [Usage of Deprecated Modules](#)**

    1. **Issue**

        - **Location in Git:** [`src/services/chatService.js#L31`](#)
        - **Justification:** ...

    2. ...
