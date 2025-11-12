package com.cpen321.usermanagement.performance.UIResponsivness

import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.performClick
import dagger.hilt.android.testing.HiltAndroidTest
import org.junit.Test
import org.junit.runner.RunWith

@HiltAndroidTest
@RunWith(AndroidJUnit4::class)
class MoverUIResponseTimeTest : UIResponsivnessTestBase() {

    private val timeout = 100L // 0.1 seconds time out for elements to appear

    @Test
    fun clickFindJobsButton_showsAvailableJobs() {
        composeTestRule.waitForIdle()
        Thread.sleep(3000)

        composeTestRule.onNodeWithText("Find Jobs", useUnmergedTree = true)
            .assertExists("Find Jobs button should exist")
            .performClick()

        composeTestRule.waitForIdle()

        // Wait for "Available Jobs" text to appear within timeout
        composeTestRule.waitUntil(timeoutMillis = timeout) {
            composeTestRule.onAllNodesWithText("Available Jobs", useUnmergedTree = true)
                .fetchSemanticsNodes().isNotEmpty()
        }
    }

    @Test
    fun clickAvailabilityButton_opensSetAvailabilityScreen() {
        composeTestRule.waitForIdle()
        Thread.sleep(3000)

        // Click on the "Availability" button
        composeTestRule.onNodeWithText("Availability", useUnmergedTree = true)
            .assertExists("Availability button should exist")
            .performClick()

        composeTestRule.waitForIdle()

        // Assert "Set Availability" text appears within timeout
        composeTestRule.waitUntil(timeoutMillis = timeout) {
            composeTestRule.onAllNodesWithText("Set Availability", useUnmergedTree = true)
                .fetchSemanticsNodes()
                .isNotEmpty()
        }

        // Click on the + icon in Monday box (test tag: "add_time_slot_MONDAY")
        composeTestRule.onNodeWithTag("add_time_slot_MONDAY", useUnmergedTree = true)
            .assertExists("Add time slot button for Monday should exist")
            .performClick()

        composeTestRule.waitForIdle()

        // Assert "Add Time Slot" text appears within timeout
        composeTestRule.waitUntil(timeoutMillis = timeout) {
            composeTestRule.onAllNodesWithText("Add Time Slot", useUnmergedTree = true)
                .fetchSemanticsNodes()
                .isNotEmpty()
        }
    }
}
