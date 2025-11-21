package com.cpen321.usermanagement.ui.components.shared

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.disabled
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import java.time.*
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DatePickerDialog(
    onDateSelected: (Long) -> Unit,
    onDismiss: () -> Unit,
    title: String = "Select Date",
    initialDateMillis: Long? = null,
    minDateOffsetDays: Int = 0
) {
    // ----- UTC today -----
    val todayUTC = Calendar.getInstance(TimeZone.getTimeZone("UTC")).apply {
        set(Calendar.HOUR_OF_DAY, 0)
        set(Calendar.MINUTE, 0)
        set(Calendar.SECOND, 0)
        set(Calendar.MILLISECOND, 0)
    }.timeInMillis

    val minSelectableUTC = Calendar.getInstance(TimeZone.getTimeZone("UTC")).apply {
        timeInMillis = todayUTC
        add(Calendar.DAY_OF_YEAR, minDateOffsetDays)
    }.timeInMillis

    // ----- Convert millis -> LocalDate (UTC) -----
    val initialDate = initialDateMillis ?: todayUTC
    val initialLocalDate = Instant.ofEpochMilli(initialDate)
        .atZone(ZoneOffset.UTC).toLocalDate()

    var selectedDate by remember { mutableStateOf(initialLocalDate) }
    val visibleMonth by remember { mutableStateOf(initialLocalDate.withDayOfMonth(1)) }

    // Helper: convert LocalDate -> UTC millis
    fun LocalDate.toUtcMillis(): Long =
        this.atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli()

    // ---- Build calendar grid ----
    val daysInMonth = visibleMonth.lengthOfMonth()
    val firstDayOfWeekOffset = visibleMonth.dayOfWeek.value % 7

    val days = buildList {
        repeat(firstDayOfWeekOffset) { add(null) }
        for (d in 1..daysInMonth) add(LocalDate.of(visibleMonth.year, visibleMonth.month, d))
    }

    androidx.compose.material3.DatePickerDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            TextButton(
                onClick = {
                    onDateSelected(selectedDate.toUtcMillis())
                }
            ) { Text("OK") }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    ) {
        Column(Modifier.padding(16.dp)) {
            Text(title, style = MaterialTheme.typography.titleLarge)

            Spacer(Modifier.height(16.dp))

            // --- Month / Year ---
            Text(
                "${visibleMonth.month} ${visibleMonth.year}",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(bottom = 12.dp)
            )

            // --- Days Grid ---
            LazyVerticalGrid(
                columns = GridCells.Fixed(7),
                modifier = Modifier.fillMaxWidth(),
                contentPadding = PaddingValues(4.dp)
            ) {
                items(days) { date ->
                    if (date == null) {
                        Spacer(Modifier.size(40.dp))
                    } else {
                        val utc = date.toUtcMillis()
                        val enabled = utc >= minSelectableUTC
                        val isSelected = date == selectedDate

                        // Choose colors based on state
                        val backgroundColor = when {
                            isSelected -> MaterialTheme.colorScheme.primary
                            else       -> androidx.compose.ui.graphics.Color.Transparent
                        }
                        val textColor = when {
                            !enabled   -> MaterialTheme.colorScheme.onSurfaceVariant
                            isSelected -> MaterialTheme.colorScheme.onPrimary
                            else       -> MaterialTheme.colorScheme.onSurface
                        }

                        Box(
                            modifier = Modifier
                            .size(40.dp)
                            .background(
                                color = backgroundColor,
                                shape = CircleShape
                            )                                       // ✅ background first
                            .testTag("day_${date.toEpochDay()}")   // stays on the same node
                            .semantics {
                                if (!enabled) disabled()
                            }
                            .let { base ->
                                if (enabled) {
                                    base.clickable {
                                        selectedDate = date
                                    }
                                } else base
                            },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = date.dayOfMonth.toString(),
                                textAlign = TextAlign.Center,
                                color = textColor,
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }
                }
            }
        }
    }
}
