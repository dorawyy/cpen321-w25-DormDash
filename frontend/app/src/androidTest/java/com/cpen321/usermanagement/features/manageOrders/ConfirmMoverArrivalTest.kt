package com.cpen321.usermanagement.features.manageOrders

import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import dagger.hilt.android.testing.HiltAndroidTest
import org.junit.Test

@HiltAndroidTest
/*
* For this test, mover needs to accept the job corresponding to this student
* and change its status to AWAITING_STUDENT_CONFIRMATION using the current jobs screen
 */
class ConfirmMoverArrivalTest: OrderTestBase() {
      @Test
      fun confirmMoverArrival_UpdateStatus(){
          composeTestRule.waitForIdle()
          Thread.sleep(3000) // Give OrderViewModel time to load active order state

          composeTestRule.onNodeWithTag("confirm arrival button", useUnmergedTree = true)
              .assertExists("No confirm button").performClick()
      }
}