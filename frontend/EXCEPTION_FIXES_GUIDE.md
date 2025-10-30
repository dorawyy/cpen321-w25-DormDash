# Exception Handling Fixes Guide

This guide shows which specific exceptions to catch in each remaining file.

## Files Already Fixed ✅
- SmartRouteViewModel.kt
- DynamicPriceCalculator.kt  
- OrderRepository.kt (line 129)
- JobRepository.kt (line 46)
- TimeUtils.kt (all 3 instances)
- RouteRepository.kt
- OrderViewModel.kt (lines 79, 148)
- MyFirebaseMessagingService.kt (line 67)
- JobViewModel.kt (lines 73, 134)
- PaymentRepository.kt (both instances)

## Files Still Needing Fixes

### JobRepository.kt (Multiple Methods)
**Context**: Network calls to job API endpoints

**Lines to fix**: 82, 111, 128, 155, 164, 173, 182, 191

**Replace**:
```kotlin
} catch (e: Exception) {
    emit(Resource.Error(e.message ?: "Unknown error occurred"))
}
```

**With**:
```kotlin
} catch (e: java.io.IOException) {
    android.util.Log.e("JobRepository", "Network error", e)
    emit(Resource.Error("Network error occurred"))
} catch (e: retrofit2.HttpException) {
    android.util.Log.e("JobRepository", "HTTP error: ${e.code()}", e)
    emit(Resource.Error("Server error occurred"))
} catch (e: com.google.gson.JsonSyntaxException) {
    android.util.Log.e("JobRepository", "JSON parsing error", e)
    emit(Resource.Error("Error parsing data"))
}
```

For non-Flow methods (lines 128, 155, 164, 173, 182, 191):
```kotlin
} catch (e: java.io.IOException) {
    android.util.Log.e("JobRepository", "Network error", e)
    Resource.Error("Network error occurred")
} catch (e: retrofit2.HttpException) {
    android.util.Log.e("JobRepository", "HTTP error: ${e.code()}", e)
    Resource.Error("Server error occurred"))
}
```

---

### OrderRepository.kt  
**Context**: Database/API calls

**Lines to fix**: 177, 201

**Line 177 (getActiveOrder)**:
```kotlin
} catch (e: java.io.IOException) {
    android.util.Log.e("OrderRepository", "Network error getting active order", e)
    null
} catch (e: retrofit2.HttpException) {
    android.util.Log.e("OrderRepository", "HTTP error getting active order", e)
    null
}
```

**Line 201 (getAllOrders - similar pattern)**:
```kotlin
} catch (e: java.io.IOException) {
    android.util.Log.e("OrderRepository", "Network error getting all orders", e)
    null
} catch (e: retrofit2.HttpException) {
    android.util.Log.e("OrderRepository", "HTTP error getting all orders", e)
    null
}
```

---

### TimeUtils.kt
**Context**: Time parsing operations

**Line 117** (parseTime24):
```kotlin
} catch (e: java.time.format.DateTimeParseException) {
    android.util.Log.e("TimeUtils", "Invalid time format: $timeString", e)
    null
}
```

---

### MyFirebaseMessagingService.kt
**Context**: Network call to update FCM token

**Line 89** (sendTokenToBackend):
```kotlin
} catch (e: java.io.IOException) {
    Log.e(TAG, "❌ Network error updating FCM token", e)
} catch (e: retrofit2.HttpException) {
    Log.e(TAG, "❌ HTTP error updating FCM token: ${e.code()}", e)
}
```

---

### AuthViewModel.kt
**Context**: Authentication operations

**Line 243** (sign in/sign up):
```kotlin
} catch (e: com.google.firebase.FirebaseException) {
    android.util.Log.e("AuthViewModel", "Firebase error during auth", e)
    _authState.value = AuthState.Error("Authentication failed: ${e.message}")
} catch (e: java.io.IOException) {
    android.util.Log.e("AuthViewModel", "Network error during auth", e)
    _authState.value = AuthState.Error("Network error. Please check your connection.")
} catch (e: retrofit2.HttpException) {
    android.util.Log.e("AuthViewModel", "Server error during auth: ${e.code()}", e)
    _authState.value = AuthState.Error("Server error: ${e.code()}")
}
```

**Line 272** (role selection or similar):
```kotlin
} catch (e: java.io.IOException) {
    android.util.Log.e("AuthViewModel", "Network error", e)
    _authState.value = AuthState.Error("Network error")
} catch (e: retrofit2.HttpException) {
    android.util.Log.e("AuthViewModel", "HTTP error: ${e.code()}", e)
    _authState.value = AuthState.Error("Server error")
}
```

---

### StudentMainScreen.kt
**Context**: Calendar intent

**Line 349**:
```kotlin
} catch (e: android.content.ActivityNotFoundException) {
    android.util.Log.e("StudentMainScreen", "No calendar app found", e)
    // Show toast: "No calendar app found"
} catch (e: IllegalArgumentException) {
    android.util.Log.e("StudentMainScreen", "Invalid calendar data", e)
}
```

---

### StatusPanel.kt
**Context**: Date parsing and calendar intent

**Line 225, 228** (date parsing - already should be fixed):
Check if these are DateTimeParseException

**Line 248** (calendar intent):
```kotlin
} catch (e: android.content.ActivityNotFoundException) {
    android.util.Log.e("StatusPanel", "No calendar app found", e)
} catch (e: IllegalArgumentException) {
    android.util.Log.e("StatusPanel", "Invalid calendar data", e)
}
```

---

### LocationUtils.kt
**Context**: Geocoding and location operations

**Lines 113, 147**:
```kotlin
} catch (e: java.io.IOException) {
    android.util.Log.e("LocationUtils", "Network error getting location", e)
    null
} catch (e: IllegalArgumentException) {
    android.util.Log.e("LocationUtils", "Invalid coordinates", e)
    null
}
```

---

### OrderMapView.kt
**Context**: Map operations

**Line 44**:
```kotlin
} catch (e: IllegalArgumentException) {
    android.util.Log.e("OrderMapView", "Invalid map coordinates", e)
} catch (e: NullPointerException) {
    android.util.Log.e("OrderMapView", "Missing map data", e)
}
```

---

### AddressAutocompleteField.kt
**Context**: Network calls to geocoding API

**Lines 178, 206, 335, 367**:
```kotlin
} catch (e: java.io.IOException) {
    android.util.Log.e("AddressAutocomplete", "Network error", e)
    // Handle error appropriately
} catch (e: retrofit2.HttpException) {
    android.util.Log.e("AddressAutocomplete", "HTTP error: ${e.code()}", e)
} catch (e: com.google.gson.JsonSyntaxException) {
    android.util.Log.e("AddressAutocomplete", "JSON parsing error", e)
}
```

---

### CreateOrderBottomSheet.kt
**Context**: Order creation with payment

**Lines 154, 266, 373**:
```kotlin
} catch (e: java.io.IOException) {
    android.util.Log.e("CreateOrderBottomSheet", "Network error creating order", e)
    errorMessage = "Network error. Please try again."
} catch (e: retrofit2.HttpException) {
    android.util.Log.e("CreateOrderBottomSheet", "Server error: ${e.code()}", e)
    errorMessage = "Server error: ${e.code()}"
} catch (e: IllegalStateException) {
    android.util.Log.e("CreateOrderBottomSheet", "Invalid order state", e)
    errorMessage = e.message ?: "Cannot create order"
}
```

---

### CreateReturnJobBottomSheet.kt
**Context**: Return job creation

**Lines 230, 303**:
```kotlin
} catch (e: java.io.IOException) {
    android.util.Log.e("CreateReturnJob", "Network error", e)
    errorMessage = "Network error. Please try again."
} catch (e: retrofit2.HttpException) {
    android.util.Log.e("CreateReturnJob", "Server error: ${e.code()}", e)
    errorMessage = "Server error: ${e.code()}"
} catch (e: IllegalStateException) {
    android.util.Log.e("CreateReturnJob", "Invalid state", e)
    errorMessage = e.message ?: "Cannot create return job"
}
```

---

### di/SocketDebugLogger.kt
**Context**: Socket data parsing

**Line 34** (if exists):
```kotlin
} catch (e: org.json.JSONException) {
    Log.e("SocketDebug", "Failed to parse socket data", e)
} catch (e: IllegalArgumentException) {
    Log.e("SocketDebug", "Invalid socket data", e)
}
```

---

## Required Imports

Add these imports to files where needed:

```kotlin
import retrofit2.HttpException
import com.google.gson.JsonSyntaxException
import org.json.JSONException
import java.io.IOException
import java.time.format.DateTimeParseException
import android.content.ActivityNotFoundException
import com.google.firebase.FirebaseException
```

## Summary

**Exception Types by Context**:
- **Network calls**: `IOException`, `HttpException`, `JsonSyntaxException`
- **Date/Time parsing**: `DateTimeParseException`, `ParseException`
- **JSON parsing**: `JSONException`, `JsonSyntaxException`
- **Firebase operations**: `FirebaseException`, `FirebaseAuthException`
- **Intent launching**: `ActivityNotFoundException`
- **Invalid data**: `IllegalArgumentException`, `IllegalStateException`, `NullPointerException`
- **Geocoding/Location**: `IOException`, `IllegalArgumentException`

Always use `android.util.Log.e()` for error logging with appropriate TAG and message.
