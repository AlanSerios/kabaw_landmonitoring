package com.example.kabawairmonitoringsystem.ui.main

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation3.runtime.NavKey
import com.example.kabawairmonitoringsystem.data.DefaultDataRepository
import com.example.kabawairmonitoringsystem.theme.KabawAirMonitoringSystemTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    onItemClick: (NavKey) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: MainScreenViewModel = viewModel { MainScreenViewModel(DefaultDataRepository()) },
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text("Kabaw Dashboard", 
                        fontWeight = FontWeight.Bold, 
                        fontSize = 22.sp,
                        color = Color(0xFF1E293B)
                    ) 
                },
                navigationIcon = {
                    IconButton(onClick = { /*TODO*/ }) {
                        Text("M", fontWeight = FontWeight.Bold)
                    }
                },
                actions = {
                    IconButton(onClick = { /*TODO*/ }) {
                        Text("S", fontWeight = FontWeight.Bold)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White
                )
            )
        }
    ) { paddingValues ->
        when (state) {
            MainScreenUiState.Loading -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            }
            is MainScreenUiState.Success -> {
                DashboardContent(paddingValues = paddingValues, modifier = modifier)
            }
            is MainScreenUiState.Error -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("Error loading data", color = MaterialTheme.colorScheme.error)
                }
            }
        }
    }
}

@Composable
internal fun DashboardContent(paddingValues: PaddingValues, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC)) // Light grayish background
            .padding(paddingValues)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp, vertical = 32.dp), // Generous padding so it's not tight
        verticalArrangement = Arrangement.spacedBy(32.dp) // Wide gap between sections
    ) {
        // Map Placeholder
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .height(280.dp),
            shape = RoundedCornerShape(24.dp), // Softer, bigger rounded corners
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFE2E8F0))
        ) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(
                    text = "Interactive Map Area",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF64748B)
                )
            }
        }

        // Telemetry Grid
        Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
            Text(
                "Live Telemetry",
                fontSize = 20.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF0F172A)
            )
            
            TelemetryCard(title = "NDVI", value = "0.76", subtitle = "Healthy Vegetation", color = Color(0xFF10B981))
            TelemetryCard(title = "NDWI", value = "-0.12", subtitle = "Normal Moisture", color = Color(0xFF3B82F6))
            TelemetryCard(title = "AQI", value = "42", subtitle = "Good Air Quality", color = Color(0xFFF59E0B))
        }
    }
}

@Composable
fun TelemetryCard(title: String, value: String, subtitle: String, color: Color) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp), // Deep padding inside cards
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(text = title, fontSize = 16.sp, color = Color(0xFF64748B), fontWeight = FontWeight.Medium)
                Spacer(modifier = Modifier.height(8.dp))
                Text(text = value, fontSize = 36.sp, fontWeight = FontWeight.Bold, color = color)
            }
            Text(text = subtitle, fontSize = 14.sp, color = Color(0xFF94A3B8))
        }
    }
}

@Preview(showBackground = true)
@Composable
fun MainScreenPreview() {
    KabawAirMonitoringSystemTheme { 
        DashboardContent(PaddingValues(0.dp)) 
    }
}

@Preview(showBackground = true, widthDp = 340)
@Composable
fun MainScreenPortraitPreview() {
    KabawAirMonitoringSystemTheme { 
        DashboardContent(PaddingValues(0.dp)) 
    }
}
