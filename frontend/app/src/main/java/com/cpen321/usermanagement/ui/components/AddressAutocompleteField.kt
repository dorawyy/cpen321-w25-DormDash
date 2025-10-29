package com.cpen321.usermanagement.ui.components

import android.content.Context
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.Dp
import com.cpen321.usermanagement.BuildConfig
import com.google.android.gms.maps.model.LatLng
import com.google.android.libraries.places.api.Places
import com.google.android.libraries.places.api.model.AutocompleteSessionToken
import com.google.android.libraries.places.api.model.LocationBias
import com.google.android.libraries.places.api.model.RectangularBounds
import com.google.android.libraries.places.api.net.FetchPlaceRequest
import com.google.android.libraries.places.api.net.FindAutocompletePredictionsRequest
import com.google.android.libraries.places.api.net.PlacesClient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

data class AddressSuggestion(
    val placeId: String,
    val primaryText: String,
    val secondaryText: String,
    val fullText: String
)

data class SelectedAddress(
    val formattedAddress: String,
    val latitude: Double,
    val longitude: Double
)

@Composable
fun AddressAutocompleteField(
    value: String,
    onValueChange: (String) -> Unit,
    onAddressSelected: (SelectedAddress) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var suggestions by remember { mutableStateOf<List<AddressSuggestion>>(emptyList()) }
    var isLoading by remember { mutableStateOf(false) }
    var showSuggestions by remember { mutableStateOf(false) }

    val placesClient = rememberPlacesClient(context)

    DebouncedAddressSearch(
        query = value,
        placesClient = placesClient,
        context = context,
        minLength = 3,
        debounceMs = 500,
        onStart = { isLoading = true },
        onResult = { preds ->
            suggestions = preds
            showSuggestions = preds.isNotEmpty()
        },
        onError = {
            suggestions = emptyList()
            showSuggestions = false
        },
        onFinished = { isLoading = false }
    )

    AddressAutocompleteContent(
        value = value,
        onValueChange = onValueChange,
        onAddressSelected = onAddressSelected,
        isLoading = isLoading,
        suggestions = suggestions,
        showSuggestions = showSuggestions,
        coroutineScope = coroutineScope,
        placesClient = placesClient,
        modifier = modifier
    )
}

@Composable
private fun AddressAutocompleteContent(
    value: String,
    onValueChange: (String) -> Unit,
    onAddressSelected: (SelectedAddress) -> Unit,
    isLoading: Boolean,
    suggestions: List<AddressSuggestion>,
    showSuggestions: Boolean,
    coroutineScope: CoroutineScope,
    placesClient: PlacesClient,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier) {
        AddressTextField(
            value = value,
            onValueChange = onValueChange,
            isLoading = isLoading,
            modifier = Modifier.fillMaxWidth()
        )

        if (showSuggestions && suggestions.isNotEmpty()) {
            SuggestionsDropdown(
                suggestions = suggestions,
                onSuggestionClick = { suggestion ->
                    coroutineScope.launch {
                        handleSuggestionClick(
                            suggestion = suggestion,
                            placesClient = placesClient,
                            onValueChange = onValueChange,
                            onAddressSelected = onAddressSelected,
                            setShowSuggestions = { /* no-op: state captured in parent */ },
                            setSuggestions = { /* no-op: state captured in parent */ }
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                maxHeight = 250.dp
            )
        }
    }
}

@Composable
private fun rememberPlacesClient(context: Context): PlacesClient {
    return remember {
        if (!Places.isInitialized()) {
            Places.initialize(context, BuildConfig.MAPS_API_KEY)
        }
        Places.createClient(context)
    }
}

@Composable
private fun DebouncedAddressSearch(
    query: String,
    placesClient: PlacesClient,
    context: Context,
    minLength: Int = 3,
    debounceMs: Long = 500,
    onStart: () -> Unit,
    onResult: (List<AddressSuggestion>) -> Unit,
    onError: () -> Unit,
    onFinished: () -> Unit
) {
    LaunchedEffect(query) {
        if (query.length >= minLength) {
            onStart()
            delay(debounceMs)
            try {
                val preds = fetchAddressPredictions(
                    placesClient = placesClient,
                    query = query,
                    context = context
                )
                onResult(preds)
            } catch (e: Exception) {
                e.printStackTrace()
                onError()
            } finally {
                onFinished()
            }
        } else {
            onResult(emptyList())
            onError()
        }
    }
}

private suspend fun handleSuggestionClick(
    suggestion: AddressSuggestion,
    placesClient: PlacesClient,
    onValueChange: (String) -> Unit,
    onAddressSelected: (SelectedAddress) -> Unit,
    setShowSuggestions: (Boolean) -> Unit,
    setSuggestions: (List<AddressSuggestion>) -> Unit
) {
    try {
        val address = fetchPlaceDetails(
            placesClient = placesClient,
            placeId = suggestion.placeId
        )
        if (address != null) {
            onValueChange(address.formattedAddress)
            onAddressSelected(address)
            setShowSuggestions(false)
            setSuggestions(emptyList())
        }
    } catch (e: Exception) {
        e.printStackTrace()
    }
}

@Composable
fun AddressTextField(
    value: String,
    onValueChange: (String) -> Unit,
    isLoading: Boolean,
    label: String = "Address",
    placeholder: String = "e.g. 123 Main St",
    enabled: Boolean = true,
    modifier: Modifier = Modifier
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label) },
        placeholder = { Text(placeholder) },
        modifier = modifier,
        enabled = enabled,
        singleLine = true,
        trailingIcon = {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    strokeWidth = 2.dp
                )
            }
        }
    )
}

@Composable
fun SuggestionsDropdown(
    suggestions: List<AddressSuggestion>,
    onSuggestionClick: (AddressSuggestion) -> Unit,
    modifier: Modifier = Modifier,
    maxHeight: Dp = 250.dp
) {
    if (suggestions.isEmpty()) return

    Card(
        modifier = modifier
            .padding(top = 4.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        LazyColumn(
            modifier = Modifier.heightIn(max = maxHeight)
        ) {
            items(suggestions) { suggestion ->
                AddressSuggestionItem(
                    suggestion = suggestion,
                    onClick = { onSuggestionClick(suggestion) }
                )
                if (suggestion != suggestions.last()) {
                    Divider()
                }
            }
        }
    }
}

@Composable
private fun AddressSuggestionItem(
    suggestion: AddressSuggestion,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        Icon(
            imageVector = Icons.Default.LocationOn,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(end = 12.dp)
        )
        Column {
            Text(
                text = suggestion.primaryText,
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurface
            )
            if (suggestion.secondaryText.isNotEmpty()) {
                Text(
                    text = suggestion.secondaryText,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

private suspend fun fetchAddressPredictions(
    placesClient: PlacesClient,
    query: String,
    context: Context
): List<AddressSuggestion> {
    try {
        val token = AutocompleteSessionToken.newInstance()

        // Bias results to Greater Vancouver area
        val bounds = RectangularBounds.newInstance(
            com.google.android.gms.maps.model.LatLng(49.0, -123.3), // Southwest
            com.google.android.gms.maps.model.LatLng(49.4, -122.5)  // Northeast
        )

        val request = FindAutocompletePredictionsRequest.builder()
            .setSessionToken(token)
            .setQuery(query)
            .setLocationBias(bounds)
            .setCountries("CA")
            .build()

        val response = placesClient.findAutocompletePredictions(request).await()

        return response.autocompletePredictions.map { prediction ->
            AddressSuggestion(
                placeId = prediction.placeId,
                primaryText = prediction.getPrimaryText(null).toString(),
                secondaryText = prediction.getSecondaryText(null).toString(),
                fullText = prediction.getFullText(null).toString()
            )
        }
    } catch (e: Exception) {
        e.printStackTrace()
        return emptyList()
    }
}

private suspend fun fetchPlaceDetails(
    placesClient: PlacesClient,
    placeId: String
): SelectedAddress? {
    try {
        val placeFields = listOf(
            com.google.android.libraries.places.api.model.Place.Field.ID,
            com.google.android.libraries.places.api.model.Place.Field.NAME,
            com.google.android.libraries.places.api.model.Place.Field.ADDRESS,
            com.google.android.libraries.places.api.model.Place.Field.LAT_LNG
        )

        val request = FetchPlaceRequest.builder(placeId, placeFields).build()
        val response = placesClient.fetchPlace(request).await()

        val place = response.place
        val latLng = place.latLng
        val address = place.address

        if (latLng != null && address != null) {
            return SelectedAddress(
                formattedAddress = address,
                latitude = latLng.latitude,
                longitude = latLng.longitude
            )
        }
    } catch (e: Exception) {
        e.printStackTrace()
    }
    return null
}

