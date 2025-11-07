package com.cpen321.usermanagement.features.auth

import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.uiautomator.By
import androidx.test.uiautomator.Until
import dagger.hilt.android.testing.HiltAndroidTest
import org.junit.Test
import org.junit.runner.RunWith

@HiltAndroidTest
@RunWith(AndroidJUnit4::class)
class SignUpTest: AuthTestBase() {

    @Test
    fun authScreen_showsBothButtons() {
        composeTestRule.waitForIdle()

        // Both buttons should be visible simultaneously
        composeTestRule.onNodeWithText("Sign in with Google", useUnmergedTree = true)
            .assertExists()
        composeTestRule.onNodeWithText("Sign up with Google", useUnmergedTree = true)
            .assertExists()
    }

    @Test
    fun test_SignUp_NavigateToMainScreen() {
        // Use setupTestAccount() which looks for test account and adds it if needed
        setupTestAccount()

        // Wait for role selection
        composeTestRule.waitUntil(timeoutMillis = 3000) {
            composeTestRule
                .onAllNodesWithText("I'm a Student", useUnmergedTree = true)
                .fetchSemanticsNodes()
                .isNotEmpty()
        }

        // Choose student role
        composeTestRule.onNodeWithText("I'm a Student", useUnmergedTree = true)
            .assertExists("Role button should exist")
            .performClick()

        // Skip bio
        composeTestRule.waitUntil(timeoutMillis = 10_000) {
            composeTestRule
                .onAllNodesWithText("Skip", useUnmergedTree = true)
                .fetchSemanticsNodes()
                .isNotEmpty()
        }
        composeTestRule.onNodeWithText("Skip", useUnmergedTree = true)
            .assertExists("Skip button should exist")
            .performClick()

        // Verify we're on main screen
        composeTestRule.onNodeWithText("DormDash", useUnmergedTree = true)
            .assertExists("Title should exist")
    }
}