<template>
  <div class="transaction-chart-container">
    <!-- Chart Controls -->
    <div class="chart-controls">
      <div class="control-group">
        <label class="control-label">Date Range</label>
        <div class="date-filter-container">
          <!-- Custom Date Range Picker -->
          <div class="custom-date-range-picker" ref="datePickerRef">
            <button @click="showDatePicker = !showDatePicker" class="date-range-button">
              <i class="fas fa-calendar-alt"></i>
              <span class="date-range-text">
                {{ formatDateRange(selectedStartDate, selectedEndDate) }}
              </span>
              <i class="fas fa-chevron-down" :class="{ 'rotate-180': showDatePicker }"></i>
            </button>
            
            <!-- Date Picker Dropdown -->
            <div v-if="showDatePicker" class="date-picker-dropdown">
              <div class="date-picker-header">
                <h4>Select Date Range</h4>
                <button @click="showDatePicker = false" class="close-btn">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              
              <div class="date-picker-body">
                <div class="date-inputs">
                  <div class="date-input-group">
                    <label>From:</label>
                    <input 
                      v-model="selectedStartDate" 
                      type="date" 
                      @change="validateAndUpdateChart"
                      class="date-input"
                      :max="maxDate"
                    />
                  </div>
                  
                  <div class="date-input-group">
                    <label>To:</label>
                    <input 
                      v-model="selectedEndDate" 
                      type="date" 
                      @change="validateAndUpdateChart"
                      class="date-input"
                      :max="maxDate"
                    />
                  </div>
                </div>
                
                <div v-if="dateRangeError" class="error-message">
                  {{ dateRangeError }}
                </div>
                
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart Canvas Container (always visible) -->
    <div class="chart-container">
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>Loading transaction data...</p>
    </div>
    
    <!-- No Data Message -->
    <div v-if="!loading && !hasData" class="no-data-message">
      <p>No transaction data available for the selected period.</p>
    </div>

    <!-- Chart Canvas -->
    <div class="chart-wrapper" id="chart-wrapper">
      <canvas ref="chartCanvas" id="transaction-chart"></canvas>
    </div>
    </div>

    <!-- Summary Stats -->
    <div class="chart-summary" v-if="!loading && hasData">
      <div class="summary-item">
        <span class="summary-label">Total Transactions:</span>
        <span class="summary-value">{{ totalTransactions }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Total Revenue:</span>
        <span class="summary-value">{{ formatCurrency(totalRevenue) }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Average per {{ averageRevenueLabel }}:</span>
        <span class="summary-value">{{ formatCurrency(averageRevenue) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue';
import { useFetch } from '#app';
import { useNuxtApp } from '#app';

// Define emits
const emit = defineEmits(['dateRangeChanged']);

const chartCanvas = ref(null);
let chartInstance = null;
const chartJsLoaded = ref(false);
const { $Chart } = useNuxtApp();
const datePickerRef = ref(null);

// Check if Chart.js is loaded only on client-side
if (process.client) {
  chartJsLoaded.value = !!$Chart || !!window.Chart;
}

// Reactive data
const loading = ref(true);
const selectedStartDate = ref('');
const selectedEndDate = ref('');
const selectedPeriod = ref('day'); // Always 'day' for unified date filter
const showTransactions = ref(true);
const showRevenue = ref(true);
const dateRangeError = ref('');
const showDatePicker = ref(false);
const isSingleDayView = computed(() => selectedStartDate.value && selectedEndDate.value && selectedStartDate.value === selectedEndDate.value);

// Maximum date (today)
const maxDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

const transactionStats = ref({
  labels: [],
  transactionData: [],
  revenueData: []
});

const hasData = computed(() => 
  transactionStats.value.transactionData.some(d => d > 0) || transactionStats.value.revenueData.some(d => d > 0)
);

// Initialize default date (7 days range)
const initializeDefaultDate = () => {
  const now = new Date();
  const sixDaysAgo = new Date(now);
  sixDaysAgo.setDate(now.getDate() - 6);

  selectedEndDate.value = now.toISOString().split('T')[0];
  selectedStartDate.value = sixDaysAgo.toISOString().split('T')[0];
};

// Helper to get YYYY-MM-DD string from a Date object
const toYMD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Helper to calculate day difference from YYYY-MM-DD strings
const dayDiff = (dateStr1, dateStr2) => {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Validate date range and update chart
const validateAndUpdateChart = () => {
  dateRangeError.value = '';
  
  if (!selectedStartDate.value || !selectedEndDate.value) {
    dateRangeError.value = 'Please select a start and end date';
    return;
  }
  
  const startDate = new Date(selectedStartDate.value);
  const endDate = new Date(selectedEndDate.value);
  
  // Check if start date is not after end date
  if (startDate > endDate) {
    dateRangeError.value = 'Start date cannot be after end date';
    return;
  }
  
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 30) {
    dateRangeError.value = 'The maximum date range is 31 days';
    return;
  }
  
  // If all validations pass, update the chart
  updateChart();
};

// Helper function to ensure dates are sent as UTC to prevent timezone shifts
const toISODateStringUTC = (dateStr) => {
  if (!dateStr) return dateStr;
  
  // Parse the date string (YYYY-MM-DD format)
  const [year, month, day] = dateStr.split('-').map(Number);
  
  // Create a UTC date with the same year, month, day
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  
  // Return as ISO date string (YYYY-MM-DD)
  return utcDate.toISOString().split('T')[0];
};

const fetchTransactionStats = async () => {
  loading.value = true;
  let params = { period: 'day' }; // Always use 'day' period for unified date filter

  // Send start and end dates with proper UTC handling to prevent timezone shifts
  params.startDate = toISODateStringUTC(selectedStartDate.value);
  params.endDate = toISODateStringUTC(selectedEndDate.value);

  // Validation for required parameters
  if (!selectedStartDate.value || !selectedEndDate.value) {
    loading.value = false;
    return;
  }

  try {
    console.log('Fetching transaction stats with params:', params);
    
    // Add dev bypass header in development mode
    const headers = {};
    if (process.env.NODE_ENV === 'development') {
      headers['x-admin-dev-bypass'] = 'true';
    }
    
    const data = await $fetch('/api/admin/transactions/stats', { 
      params,
      headers
    });
    console.log('Transaction stats response:', data);
    
    if (data && data.labels) {
    transactionStats.value = data;
    } else {
      console.error('Invalid data format received from API:', data);
      // Set default empty data structure
      transactionStats.value = { 
        labels: [], 
        transactionData: [], 
        revenueData: []
      };
    }
  } catch (error) {
    console.error("Error fetching transaction stats:", error);
    transactionStats.value = { labels: [], transactionData: [], revenueData: [] };
  } finally {
    loading.value = false;
  }
};


const handleClickOutside = (event) => {
  if (datePickerRef.value && !datePickerRef.value.contains(event.target)) {
    showDatePicker.value = false;
  }
};

// Computed properties
const chartData = computed(() => {
  if (!transactionStats.value || !transactionStats.value.labels || !hasData.value) {
    return {
      labels: [],
      datasets: [
        {
          label: 'No data available',
          data: [],
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        },
      ],
    };
  }

  const datasets = [];
  
  if (showTransactions.value) {
    datasets.push({
      label: 'Transactions',
      data: transactionStats.value.transactionData,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 3,
      pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
      tension: 0.4,
      fill: true,
      yAxisID: 'y'
    });
  }
  
  if (showRevenue.value) {
    datasets.push({
      label: 'Revenue',
      data: transactionStats.value.revenueData,
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderColor: 'rgba(34, 197, 94, 1)',
      borderWidth: 3,
      pointBackgroundColor: 'rgba(34, 197, 94, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
      tension: 0.4,
      fill: true,
      yAxisID: 'y1'
    });
  }
  
  return {
    labels: transactionStats.value.labels,
    datasets
  };
});

const totalTransactions = computed(() => {
  return transactionStats.value.transactionData.reduce((sum, val) => sum + val, 0);
});

const totalRevenue = computed(() => {
  return transactionStats.value.revenueData.reduce((sum, val) => sum + val, 0);
});

const averageRevenue = computed(() => {
  const total = totalRevenue.value;
  const count = transactionStats.value.revenueData.filter(v => v > 0).length;
  if (count === 0) return 0;
  return Math.round(total / count);
});

const averageRevenueLabel = computed(() => {
  switch (selectedPeriod.value) {
    case 'day':
      return 'day';
    case 'month':
      return 'day';
    case 'year':
      return 'month';
    default:
      return 'data';
  }
});

const chartTitle = computed(() => {
  if (isSingleDayView.value) {
    if (!selectedStartDate.value) return 'Hourly Transactions';
    const date = new Date(selectedStartDate.value + 'T00:00:00');
    return `Hourly Transactions for ${date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })}`;
  }
  return 'Daily Transaction Overview';
});

// Chart options
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  devicePixelRatio: window.devicePixelRatio || 1,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: '#fff',
        usePointStyle: true,
        padding: 20,
        font: {
          size: 14,
          weight: '500'
        }
      }
    },
    title: {
      display: true,
      text: chartTitle.value, // Use the new dynamic title
      color: '#fff',
      font: { 
        size: 20, 
        weight: 'bold',
        family: 'Inter, system-ui, sans-serif'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(10, 10, 15, 0.85)',
      backdropFilter: 'blur(4px)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      padding: 12,
      titleFont: {
        size: 14,
        weight: '600'
      },
      bodyFont: {
        size: 13,
        weight: '500'
      },
        callbacks: {
          title: function(tooltipItems) {
            const item = tooltipItems[0];
            if (!item) return '';
            const label = item.label;

            if (isSingleDayView.value) {
              return `${label.padStart(2, '0')}:00`;
            } else {
              const date = new Date(label + 'T00:00:00');
              return date.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });
            }
          },
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            if (context.dataset.yAxisID === 'y1') {
              label += formatCurrency(context.parsed.y);
            } else {
              label += `${context.parsed.y.toLocaleString('id-ID')} transactions`;
            }
          }
          return label;
        }
      }
    }
  },
  scales: {
    x: {
      ticks: { 
        color: '#fff',
        font: {
          size: 12,
          weight: '500'
        },
        callback: function(value) {
          const label = this.getLabelForValue(value);
          if (isSingleDayView.value) {
            return `${label.padStart(2, '0')}:00`;
          }
          const date = new Date(label + 'T00:00:00');
          return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
        }
      },
      grid: { 
        color: 'rgba(255,255,255,0.12)',
        lineWidth: 1
      }
    },
    y: {
      type: 'linear',
      display: showTransactions.value,
      position: 'left',
      beginAtZero: true,
      ticks: { 
        color: '#fff',
        font: {
          size: 12,
          weight: '500'
        },
        callback: function(value) {
          if (Number.isInteger(value)) {
            return value.toLocaleString('en-US');
          }
        }
      },
      grid: { 
        color: 'rgba(255,255,255,0.12)',
        lineWidth: 1
      }
    },
    y1: {
      type: 'linear',
      display: showRevenue.value,
      position: 'right',
      beginAtZero: true,
      ticks: { 
        color: '#fff',
        font: {
          size: 12,
          weight: '500'
        },
        callback: function(value) {
          return formatCurrency(value);
        }
      },
      grid: {
        drawOnChartArea: false,
        color: 'rgba(255,255,255,0.12)',
        lineWidth: 1
      },
    }
  },
  elements: {
    point: {
      hoverRadius: 8,
      radius: 6
    },
    line: {
      tension: 0.4
    }
  }
}));

// Helper functions
const formatCurrency = (amount) => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (typeof numericAmount !== 'number' || isNaN(numericAmount)) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericAmount);
};

// Format date range for display
const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return 'Select date range';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  const startFormatted = start.toLocaleDateString('en-US', options);
  const endFormatted = end.toLocaleDateString('en-US', options);
  
  return `${startFormatted} - ${endFormatted}`;
};




// Methods
const updateChart = async () => {
  // Store previous data to compare
  const previousData = { ...transactionStats.value };
  
  await fetchTransactionStats();
  
  // Skip chart updates in SSR context
  if (!process.client) return;
  
  if (chartInstance) {
    try {
      // Only update if data actually changed
      const dataChanged = JSON.stringify(previousData) !== JSON.stringify(transactionStats.value);
      
      if (dataChanged) {
        // Update chart data more efficiently
        chartInstance.data.labels = chartData.value.labels;
        chartInstance.data.datasets = chartData.value.datasets;
        chartInstance.options.plugins.title.text = chartTitle.value;
        chartInstance.update('none'); // Use 'none' animation mode to reduce flicker
        console.log('Chart updated successfully');
      }
    } catch (error) {
      console.error('Error updating chart:', error);
      // If updating fails, try recreating the chart
      chartInstance = null;
      await createChart();
    }
  } else {
    // Try to recreate chart if it doesn't exist
    await createChart();
  }
};

const createChart = async () => {
  // Skip in SSR context
  if (!process.client) {
    return;
  }
  
  // Ensure Chart.js is loaded
  if (!window.Chart) {
    try {
      await loadChartJs();
    } catch (error) {
      console.error('Failed to load Chart.js:', error);
      return;
    }
  }
  
  // Try to get the canvas in multiple ways
  let canvas = chartCanvas.value;
  
  // If chartCanvas ref is null, try to get it by ID as a fallback
  if (!canvas && process.client) {
    canvas = document.getElementById('transaction-chart');
    console.log('Tried to find canvas by ID:', canvas);
  }
  
  if (!canvas) {
    console.error('Chart canvas not found by any method');
    return;
  }
  
  // If a previous chart instance exists, destroy it first
  if (chartInstance) {
    try {
      chartInstance.destroy();
      chartInstance = null;
    } catch (error) {
      console.error('Error destroying existing chart:', error);
    }
  }
  
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context from canvas');
      return;
    }
    
    console.log('Creating new Chart instance with data:', chartData.value);
    chartInstance = new window.Chart(ctx, {
      type: 'line',
      data: chartData.value,
      options: chartOptions.value
    });
    console.log('Chart instance created:', chartInstance);
  } catch (error) {
    console.error('Error creating chart:', error);
  }
}

// Method to attempt to fix chart rendering issues
const attemptFixChart = async () => {
  console.log('Attempting to fix chart issues');
  
  // Destroy existing chart instance if it exists
  if (chartInstance) {
    try {
      chartInstance.destroy();
      chartInstance = null;
    } catch (error) {
      console.error('Error destroying chart instance:', error);
    }
  }
  
  // Re-fetch data
  await fetchTransactionStats();
  
  // Force a repaint of the canvas
  if (process.client) {
    const canvasElement = document.getElementById('transaction-chart');
    if (canvasElement) {
      // Force browser to reflow/repaint
      canvasElement.style.display = 'none';
      // Trigger reflow
      void canvasElement.offsetHeight;
      canvasElement.style.display = 'block';
      console.log('Forced canvas repaint');
    }
  }
  
  // Wait for DOM update
  await nextTick();
  
  // Multiple attempts with increasing timeouts
  let attempts = 0;
  const maxAttempts = 3;
  
  const tryCreateChart = async () => {
    attempts++;
    console.log(`Chart creation attempt ${attempts} of ${maxAttempts}`);
    
    // Try first with ref
    if (chartCanvas.value) {
      console.log('Recreating chart with ref:', chartCanvas.value);
      await createChart();
      return true;
    }
    
    // Try with getElementById as fallback
    if (process.client) {
      const canvas = document.getElementById('transaction-chart');
      if (canvas) {
        console.log('Recreating chart with getElementById:', canvas);
        chartCanvas.value = canvas; // Update the ref
        await createChart();
        return true;
      }
    }
    
    console.log(`Chart canvas still not available on attempt ${attempts}`);
    return false;
  };
  
  // First attempt
  if (await tryCreateChart()) return;
  
  // Second attempt after short delay
  await new Promise(resolve => setTimeout(resolve, 300));
  if (await tryCreateChart()) return;
  
  // Last attempt after longer delay
  await new Promise(resolve => setTimeout(resolve, 700));
  if (await tryCreateChart()) return;
  
  console.error('All attempts to fix chart failed, try reloading the page');
};

// Function to load Chart.js
const loadChartJs = async () => {
  // Skip in SSR context
  if (!process.client) {
    console.log('Skipping Chart.js load in SSR');
    return;
  }

  if (window.Chart) {
    console.log('Chart.js already loaded');
    chartJsLoaded.value = true;
    return;
  }

  console.log('Chart.js not loaded, attempting to load');
  
  try {
    // Try script tag approach first
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => {
        console.log('Chart.js loaded successfully via script tag');
        chartJsLoaded.value = true;
        resolve();
      };
      script.onerror = () => {
        console.warn('Failed to load Chart.js via script tag, will try alternative method');
        reject();
      };
      document.head.appendChild(script);
    });
  } catch (error) {
    console.warn('Loading Chart.js via script tag failed, trying alternative');
    
    // Try dynamic import as a fallback
    try {
      const dynamicImport = await import('https://cdn.jsdelivr.net/npm/chart.js/+esm');
      window.Chart = dynamicImport.Chart;
      chartJsLoaded.value = true;
      console.log('Chart.js loaded successfully via dynamic import');
    } catch (error) {
      console.error('All attempts to load Chart.js failed:', error);
      throw new Error('Failed to load Chart.js');
    }
  }
};

// Improved chart initialization with more reliable canvas detection
const initChart = async () => {
  // Make sure we're running on client-side
  if (!process.client) return;

  console.log('Initializing chart...');
  loading.value = true;

  try {
    // Check if canvas exists
    if (!chartCanvas.value) {
      console.log('Canvas not found, attempting to locate it by ID');
      // Try to get canvas by ID
      const canvasElement = document.getElementById('transaction-chart');
      if (canvasElement) {
        console.log('Canvas found by ID');
        // Create chart directly with this element
        createChartInstance(canvasElement);
      } else {
        console.log('Canvas not available yet, will try later via nextTick');
        // Defer until next tick when DOM should be updated
        await nextTick();
        if (chartCanvas.value) {
          console.log('Canvas found after nextTick');
          createChartInstance(chartCanvas.value);
        } else {
          console.log('Canvas still not available after nextTick');
          // Set up a MutationObserver to watch for when the canvas is added
          setupCanvasWatcher();
        }
      }
    } else {
      console.log('Canvas ref available, creating chart');
      createChartInstance(chartCanvas.value);
    }
  } catch (error) {
    console.error('Error initializing chart:', error);
  } finally {
    loading.value = false;
  }
};

// Create chart instance with the given canvas
const createChartInstance = (canvas) => {
  try {
    if (!canvas || !canvas.getContext) {
      console.error('Invalid canvas element');
      return;
    }

    const ChartLib = $Chart || window.Chart;
    
    if (!ChartLib) {
      console.error('Chart library not available');
      return;
    }
    
    const existingChart = ChartLib.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }

    if (chartInstance) {
        chartInstance = null;
    }

    console.log('Creating new Chart instance with data:', chartData.value);
    
    chartInstance = new ChartLib(canvas, {
      type: 'line',
      data: chartData.value,
      options: chartOptions.value
    });
    
    console.log('Chart instance created:', chartInstance);
  } catch (error) {
    console.error('Error creating chart instance:', error);
  }
};

// Set up MutationObserver to watch for canvas element
const setupCanvasWatcher = () => {
  if (!process.client) return;
  
  console.log('Starting canvas watcher');
  
  let retryCount = 0;
  const maxRetries = 5;
  
  // First try with a timeout
  setTimeout(() => {
    console.log('Checking chart instance after timeout');
    if (chartInstance) return;
    
    const canvasElement = document.getElementById('transaction-chart');
    console.log('Chart instance not created yet, canvas ref now:', canvasElement);
    
    if (canvasElement) {
      createChartInstance(canvasElement);
    } else {
      console.log('Chart canvas still not available after delay');
      
      // Set up a mutation observer as last resort
      try {
        const chartWrapper = document.getElementById('chart-wrapper');
        if (!chartWrapper) return;
        
        console.log('Watching chart wrapper for canvas');
        
        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.addedNodes.length) {
              const canvas = document.getElementById('transaction-chart');
              if (canvas) {
                console.log('Canvas detected by MutationObserver');
                createChartInstance(canvas);
                observer.disconnect();
                console.log('Canvas watcher disconnected');
                return;
              }
            }
          }
          
          // Increment retry count and disconnect if max reached
          retryCount++;
          if (retryCount >= maxRetries) {
            console.log(`Maximum retries (${maxRetries}) reached, disconnecting observer`);
            observer.disconnect();
          }
        });
        
        observer.observe(chartWrapper, { childList: true, subtree: true });
        
      } catch (error) {
        console.error('Error setting up mutation observer:', error);
      }
    }
  }, 500);
};

// Lifecycle
onMounted(async () => {
  document.addEventListener('click', handleClickOutside);
  // Skip chart initialization in SSR context
  if (!process.client) return;
  
  console.log('TransactionChart component mounted');
  initializeDefaultDate();
  
  // Try to load Chart.js
  try {
    await loadChartJs();
  } catch (error) {
    console.error('Could not load Chart.js:', error);
  }
  
  // Fetch data first
  console.log('Fetching transaction data');
  await fetchTransactionStats();
  
  // Give the DOM time to render
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Use nextTick to ensure DOM is updated before creating chart
  await nextTick();
  console.log('DOM updated via nextTick, canvas ref:', chartCanvas.value);
  
  // Try to create chart after nextTick
  if (chartCanvas.value) {
    try {
      await initChart();
    } catch (e) {
      console.error('Error creating chart on first attempt:', e);
    }
  }
  
  // Additional safety check with setTimeout to ensure DOM is fully rendered
  setTimeout(async () => {
    console.log('Checking chart instance after timeout');
    if (!chartInstance) {
      console.log('Chart instance not created yet, canvas ref now:', chartCanvas.value);
      if (chartCanvas.value) {
        console.log('Creating chart on canvas element after timeout:', chartCanvas.value);
        await initChart();
      } else {
        console.error('Chart canvas still not available after delay');
        // Try once more with a mutation observer
        setupCanvasWatcher();
      }
    }
  }, 800); // Increased timeout
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  if (chartInstance) {
    try {
    chartInstance.destroy();
      chartInstance = null;
    } catch (error) {
      console.error('Error destroying chart instance:', error);
    }
  }
});

// Watch for changes that should not trigger a full re-render but just an options update
watch([showTransactions, showRevenue], () => {
  if (chartInstance) {
    chartInstance.options = chartOptions.value;
    chartInstance.update();
  }
}, { deep: true });
</script>

<style scoped>
@import '~/assets/css/pages/admin-chart.css';
.transaction-chart-container {
  background: var(--galaxy-card-gradient);
  border-radius: var(--galaxy-radius-lg);
  box-shadow: 0 2px 12px 0 rgba(59,130,246,0.08);
  padding: 1.5rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 100%;
  position: relative;
  min-height: 500px;
}

.chart-container {
  position: relative;
  min-height: 400px;
  margin-bottom: 1.5rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin-bottom: 1rem;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--galaxy-aurora-cyan);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-overlay, .no-data-message {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(4px);
  border-radius: var(--galaxy-radius-lg);
  z-index: 10;
}

.loading-overlay p, .no-data-message p {
  color: var(--galaxy-starlight);
  font-size: 1.2rem;
  font-weight: 500;
}

.chart-controls {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--galaxy-starlight);
  letter-spacing: 0.025em;
}

.control-select,
.control-input {
  padding: 0.75rem 1rem;
  background-color: #1e293b;
  border: 2px solid var(--galaxy-aurora-cyan);
  border-radius: var(--galaxy-radius-md);
  color: var(--galaxy-starlight);
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 120px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.control-select option {
  background: #0f172a;
  color: var(--galaxy-starlight);
}

.control-select:focus,
.control-input:focus {
  outline: none;
  border-color: var(--galaxy-aurora-cyan);
  box-shadow: 0 0 0 3px rgba(77, 208, 225, 0.3);
}

.checkbox-group {
  display: flex;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--galaxy-starlight);
  cursor: pointer;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.control-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--galaxy-aurora-cyan);
}

.control-input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

.date-range-picker {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-separator {
  color: var(--galaxy-starlight);
  font-weight: 500;
  padding: 0 0.5rem;
}

.date-filter-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.error-message {
  color: var(--galaxy-plasma-orange);
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 0.25rem;
  padding: 0.5rem;
  background: rgba(244, 67, 54, 0.1);
  border-radius: var(--galaxy-radius-sm);
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.chart-wrapper {
  margin-bottom: 1.5rem;
  position: relative;
  width: 100%;
  min-height: 400px;
  display: block;
}

canvas {
  width: 100% !important;
  max-width: 100%;
  height: 400px !important;
  background: transparent;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: block;
}

.chart-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--galaxy-radius-md);
}

.summary-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--galaxy-text-secondary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.summary-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--galaxy-starlight);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@media (max-width: 768px) {
  .chart-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-group {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .checkbox-group {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .chart-summary {
    grid-template-columns: 1fr;
  }
}

/* Custom Date Range Picker */
.custom-date-range-picker {
  position: relative;
  display: inline-block;
}

.date-range-button {
  background: var(--galaxy-card-gradient);
  border: 1px solid var(--galaxy-aurora-cyan);
  border-radius: var(--galaxy-radius-md);
  color: var(--galaxy-starlight);
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: var(--galaxy-transition-normal);
  font-size: 0.9rem;
  min-width: 250px;
  justify-content: space-between;
}

.date-range-button:hover {
  border-color: var(--galaxy-comet-green);
  box-shadow: var(--galaxy-glow-cyan);
}

.date-range-text {
  flex-grow: 1;
  text-align: center;
}

.date-range-button .fa-chevron-down {
  transition: transform 0.3s ease;
}

.date-range-button .fa-chevron-down.rotate-180 {
  transform: rotate(180deg);
}

.date-picker-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 100;
  background: var(--galaxy-deep-space);
  border: 1px solid var(--galaxy-aurora-cyan);
  border-radius: var(--galaxy-radius-lg);
  box-shadow: var(--galaxy-shadow-large);
  width: 320px;
  overflow: hidden;
  animation: fadeInDown 0.3s ease-out;
}

.date-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--galaxy-card-gradient);
  border-bottom: 1px solid var(--galaxy-aurora-cyan);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--galaxy-starlight);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  position: absolute;
  top: 0.75rem;
  right: 1rem;
}

.date-picker-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--galaxy-starlight);
}

.date-picker-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.date-inputs {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.date-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date-input-group label {
  font-size: 0.8rem;
  color: var(--galaxy-cloud-gray);
}

.date-input {
  background: #1e293b;
  border: 1px solid var(--galaxy-asteroid-gray);
  border-radius: var(--galaxy-radius-sm);
  color: var(--galaxy-starlight);
  padding: 0.5rem;
  font-size: 0.9rem;
}

.date-input:focus {
  outline: none;
  border-color: var(--galaxy-aurora-cyan);
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.quick-btn {
  background: transparent;
  border: 1px solid var(--galaxy-asteroid-gray);
  color: var(--galaxy-cloud-gray);
  padding: 0.5rem;
  border-radius: var(--galaxy-radius-sm);
  cursor: pointer;
  transition: var(--galaxy-transition-fast);
}

.quick-btn.active,
.quick-btn:hover {
  background: var(--galaxy-aurora-cyan);
  color: var(--galaxy-deep-space);
  border-color: var(--galaxy-aurora-cyan);
}

.picker-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid var(--galaxy-asteroid-gray);
  padding-top: 1rem;
}

.cancel-btn,
.apply-btn {
  padding: 0.5rem 1rem;
  border-radius: var(--galaxy-radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: var(--galaxy-transition-fast);
}

.cancel-btn {
  background: transparent;
  border: 1px solid var(--galaxy-asteroid-gray);
  color: var(--galaxy-starlight);
}

.cancel-btn:hover {
  background: var(--galaxy-asteroid-gray);
}

.apply-btn {
  background: var(--galaxy-aurora-cyan);
  border: 1px solid var(--galaxy-aurora-cyan);
  color: var(--galaxy-deep-space);
}

.apply-btn:hover {
  opacity: 0.9;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 