package com.cpen321.usermanagement

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.UiDevice
import dagger.hilt.android.testing.HiltAndroidRule
import dagger.hilt.android.testing.HiltAndroidTest
import org.junit.Before
import org.junit.Rule
import org.junit.runner.RunWith

/**
 * Base class for Find Jobs feature tests.
 * Provides common setup and utilities for testing.
 * Pre-configured with a fake mover account for authenticated testing.
 */
@HiltAndroidTest
@RunWith(AndroidJUnit4::class)
abstract class FindJobsTestBase {
    
    @get:Rule(order = 0)
    val hiltRule = HiltAndroidRule(this)

    @get:Rule(order = 1)
    val composeTestRule = createAndroidComposeRule<MainActivity>()
    
    protected lateinit var device: UiDevice
    
    @Before
    fun baseSetup() {
        hiltRule.inject()
        device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())
        
        // Wait for the app to settle after injection
        // The FakeAuthRepository automatically provides a logged-in mover
        composeTestRule.waitForIdle()

        // Grant notification permission automatically
        grantNotificationPermission()
    }
    
    /**
     * Navigate to Find Jobs screen from home
     */
    protected fun navigateToFindJobs() {
        // TODO: Implement navigation to Find Jobs screen
        // This will depend on your app's navigation structure
    }
    
    /**
     * Grant location permission using UI Automator
     */
    protected fun grantLocationPermission() {
        // Wait for permission dialog and click "While using the app" or "Only this time"
        device.wait(
            androidx.test.uiautomator.Until.findObject(
                androidx.test.uiautomator.By.text("While using the app")
            ),
            5000
        )?.click()
            ?: device.wait(
                androidx.test.uiautomator.Until.findObject(
                    androidx.test.uiautomator.By.text("Only this time")
                ),
                5000
            )?.click()
    }
    
    /**
     * Deny location permission using UI Automator
     */
    protected fun denyLocationPermission() {
        device.wait(
            androidx.test.uiautomator.Until.findObject(
                androidx.test.uiautomator.By.text("Don't allow")
            ),
            5000
        )?.click()
            ?: device.wait(
                androidx.test.uiautomator.Until.findObject(
                    androidx.test.uiautomator.By.text("Deny")
                ),
                5000
            )?.click()
    }

    /**
     * Grant notification permission using UI Automator
     */
    protected fun grantNotificationPermission() {
        device.wait(
            androidx.test.uiautomator.Until.findObject(
                androidx.test.uiautomator.By.text("Allow")
            ),
            5000
        )?.click()
    }

    /**
     * Deny notification permission using UI Automator
     */
    protected fun denyNotificationPermission() {
        device.wait(
            androidx.test.uiautomator.Until.findObject(
                androidx.test.uiautomator.By.text("Don't allow")
            ),
            5000
        )?.click()
    }
}
