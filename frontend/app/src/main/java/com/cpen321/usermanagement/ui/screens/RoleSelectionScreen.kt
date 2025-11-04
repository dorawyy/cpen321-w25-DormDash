package com.cpen321.usermanagement.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.cpen321.usermanagement.ui.theme.LocalFontSizes
import com.cpen321.usermanagement.ui.theme.LocalSpacing

@Composable
fun RoleSelectionScreen(
    onRoleSelected: (String) -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(LocalSpacing.current.large),
            contentAlignment = Alignment.Center
        ) {
            RoleSelectionContent(onRoleSelected = onRoleSelected)
        }
    }
}

@Composable
private fun RoleSelectionContent(
    onRoleSelected: (String) -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier.fillMaxWidth()
    ) {
        WelcomeHeader()
        Spacer(modifier = Modifier.height(LocalSpacing.current.extraLarge))
        RoleButtons(onRoleSelected = onRoleSelected)
        Spacer(modifier = Modifier.height(LocalSpacing.current.large))
    }
}

@Composable
private fun WelcomeHeader() {
    Text(
        text = "Welcome to DormDash!",
        fontSize = LocalFontSizes.current.extraLarge,
        fontWeight = FontWeight.Bold,
        color = MaterialTheme.colorScheme.primary,
        textAlign = TextAlign.Center
    )
    Spacer(modifier = Modifier.height(LocalSpacing.current.medium))
    Text(
        text = "Choose your role to get started",
        fontSize = LocalFontSizes.current.medium,
        color = MaterialTheme.colorScheme.onBackground,
        textAlign = TextAlign.Center
    )
}

@Composable
private fun RoleButtons(
    onRoleSelected: (String) -> Unit
) {
    Button(
        onClick = { onRoleSelected("STUDENT") },
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
    ) {
        Text(
            text = "I'm a Student",
            fontSize = LocalFontSizes.current.medium,
            fontWeight = FontWeight.Medium
        )
    }
    Spacer(modifier = Modifier.height(LocalSpacing.current.medium))
    OutlinedButton(
        onClick = { onRoleSelected("MOVER") },
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
    ) {
        Text(
            text = "I'm a Mover",
            fontSize = LocalFontSizes.current.medium,
            fontWeight = FontWeight.Medium
        )
    }
}