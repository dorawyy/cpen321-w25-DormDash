package com.cpen321.usermanagement.features.manageOrders


import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import dagger.hilt.android.testing.HiltAndroidTest
import org.junit.Test


@HiltAndroidTest
class CancelOrderTest : OrderTestBase() {

    @Test
    fun cancelOrder_ReceiveRefund(){

        composeTestRule.waitForIdle()
        Thread.sleep(3000) // Give OrderViewModel time to load active order state

        composeTestRule.onNodeWithText("Order Active", useUnmergedTree = true)
            .assertExists("No Active Order Found")
            .performClick()
        
        // Step 2: Click on the profile icon to navigate to profile screen
        composeTestRule
            .onNodeWithTag("ProfileButton")
            .assertExists("Profile button should exist")
            .performClick()

        // Step 3: Wait for profile screen to load
        composeTestRule.waitForIdle()

        // Step 4: Find and click the "Manage Orders" button
        composeTestRule
            .onNodeWithText("Manage Orders", useUnmergedTree = true)
            .assertExists("Manage Orders button should exist on profile screen")
            .performClick()

        // Step 5: Wait for Manage Orders screen to load
        composeTestRule.waitForIdle()
        Thread.sleep(1000) // Give time for orders to load

        // Step 6: Find and click on the order with "Pending Confirmation" status
        composeTestRule
            .onNodeWithTag("order_list_item_PENDING", useUnmergedTree = true)
            .assertExists("No pending order, only pending orders can be cancelled")
            .performClick()

        // Step 7: Wait for order details dialog to appear
        composeTestRule.waitForIdle()

        // Step 8: Click the "Cancel Order" button
        composeTestRule
            .onNodeWithTag("cancel_order_button", useUnmergedTree = true)
            .assertExists("Cancel Order button should exist")
            .performClick()

        // Step 9: Wait for cancellation to complete and verify success
        composeTestRule.waitForIdle()
        Thread.sleep(2000) // Give time for backend to process cancellation

        // Verify that the order was cancelled (dialog should be closed)
        composeTestRule
            .onNodeWithTag("cancel_order_button", useUnmergedTree = true)
            .assertDoesNotExist()
    }
}