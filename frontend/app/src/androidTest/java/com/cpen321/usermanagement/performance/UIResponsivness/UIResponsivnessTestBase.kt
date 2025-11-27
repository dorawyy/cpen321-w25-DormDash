package com.cpen321.usermanagement.performance.UIResponsivness

import androidx.compose.ui.test.*
import android.content.Intent
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.By
import androidx.test.uiautomator.Until
import com.cpen321.usermanagement.MainActivity
import com.cpen321.usermanagement.utils.BaseTestSetup
import com.cpen321.usermanagement.utils.TestAccountHelper
import dagger.hilt.android.testing.HiltAndroidTest
import org.junit.Before
import org.junit.After


/**
 * Base class for UI responsiveness tests.
 */
@HiltAndroidTest
abstract class UIResponsivnessTestBase : BaseTestSetup() {

    protected val appPackage = "com.cpen321.usermanagement"
    private val launchTimeout = 5000L
    protected val timeout = 100L // 0.1 seconds timeout for elements to appear

    companion object {
        @Volatile
        private var isSetupDone = false
        private val setupLock = Any()
    }

    @Before
    override fun baseSetup() {
        // Call parent setup first (initializes device, hilt injection)
        super.baseSetup()
        
        if (isSetupDone) return
        
        synchronized(setupLock) {
            if (isSetupDone) return
            isSetupDone = true

            // Wake and unlock device
            if (!device.isScreenOn) device.wakeUp()
            device.swipe(500, 1000, 500, 100, 10)
            device.pressHome()

            // Launch MainActivity via Intent
            val context = InstrumentationRegistry.getInstrumentation().targetContext
            val intent = Intent(context, MainActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)

            // Wait for the app to appear
            device.wait(Until.hasObject(By.pkg(appPackage).depth(0)), launchTimeout)

            composeTestRule.waitForIdle()

            // Sign in with the first available account (for performance testing)
            signIn()
        }
    }

    /**
     * Signs in with the first available Google account.
     * For performance tests, we use a simplified sign-in that picks the first account.
     */
    private fun signIn() {
        composeTestRule.onNodeWithText("Sign in with Google", useUnmergedTree = true)
            .performClick()

        val accountPickerAppeared = device.wait(
            Until.hasObject(By.pkg("com.google.android.gms")),
            10_000
        )

        if (accountPickerAppeared) {
            device.wait(Until.hasObject(By.clickable(true)), 3_000)
            val firstClickable = device.findObject(By.clickable(true))
            firstClickable?.click()
        }

        val mainScreenAppeared = device.wait(
            Until.hasObject(By.text("DormDash")),
            10_000
        )
        if (!mainScreenAppeared) {
            throw RuntimeException("Main screen did not appear after Google sign-in")
        }

        composeTestRule.waitForIdle()
    }

    @After
    fun resetToHome() {
        try {
            repeat(5) {
                val isHomeScreen = composeTestRule.onAllNodesWithText("DormDash", useUnmergedTree = true)
                    .fetchSemanticsNodes().isNotEmpty()

                if (isHomeScreen) return

                device.pressBack()
                composeTestRule.waitForIdle()
            }

            // Final verification — wait up to 3 seconds for "Your orders" to appear
            composeTestRule.waitUntil(timeoutMillis = 3000) {
                composeTestRule.onAllNodesWithText("DormDash", useUnmergedTree = true)
                    .fetchSemanticsNodes().isNotEmpty()
            }

        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
