// DOM Elements
const loadingEl = document.getElementById('loading');
const testFormEl = document.getElementById('testForm');
const environmentSelect = document.getElementById('environment');
const threadGroupsContainer = document.getElementById('threadGroupsContainer');
const advancedOptionsContainer = document.getElementById('advancedOptionsContainer');
const addOptionBtn = document.getElementById('addOptionBtn');
const startTestBtn = document.getElementById('startTestBtn');
const testMonitoringEl = document.getElementById('testMonitoring');
const errorMessageEl = document.getElementById('errorMessage');
const errorTextEl = document.getElementById('errorText');
const retryBtn = document.getElementById('retryBtn');
const modeRadios = document.querySelectorAll('input[name="mode"]');
const valueLabel = document.getElementById('valueLabel');
const valueInput = document.getElementById('value');

// Header elements
const headerStats = document.getElementById('headerStats');
const headerActions = document.getElementById('headerActions');
const statusValue = document.getElementById('statusValue');
const usersValue = document.getElementById('usersValue');
const rpsValue = document.getElementById('rpsValue');
const failuresValue = document.getElementById('failuresValue');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');

// Tab elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

// State
let threadGroups = [];
let environments = [];
let advancedOptionCount = 0;
let statsInterval = null;
let charts = {
  rps: null,
  responseTime: null,
  users: null
};
let chartData = {
  labels: [],
  rps: [],
  responseTime: [],
  users: []
};

// Initialize
async function init() {
  // Check if test is already running (page refresh)
  await checkTestStatus();
  
  await Promise.all([
    loadEnvironments(),
    loadThreadGroups()
  ]);
  setupEventListeners();
  initCharts();
}

// Check if test is running on page load
async function checkTestStatus() {
  try {
    const response = await fetch('/api/test-status');
    const data = await response.json();
    
    if (data.running) {
      // Resume monitoring UI
      loadingEl.style.display = 'none';
      testFormEl.style.display = 'none';
      testMonitoringEl.style.display = 'block';
      headerStats.style.display = 'flex';
      headerActions.style.display = 'flex';
      
      statusValue.textContent = 'RUNNING';
      statusValue.style.color = '#ff6b6b';
      
      startStatsPolling();
    }
  } catch (error) {
    console.error('Error checking test status:', error);
  }
}

// Load environments from API
async function loadEnvironments() {
  try {
    const response = await fetch('/api/environments');
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to load environments');
    }
    
    environments = data.environments;
    renderEnvironments();
    
  } catch (error) {
    console.error('Error loading environments:', error);
  }
}

// Render environment options
function renderEnvironments() {
  environmentSelect.innerHTML = '<option value="">-- Select Environment --</option>';
  
  environments.forEach(env => {
    const option = document.createElement('option');
    option.value = env;
    option.textContent = env;
    environmentSelect.appendChild(option);
  });
}

// Load thread groups from API
async function loadThreadGroups() {
  try {
    const response = await fetch('/api/thread-groups');
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to load thread groups');
    }
    
    threadGroups = data.threadGroups;
    renderThreadGroups();
    
    loadingEl.style.display = 'none';
    testFormEl.style.display = 'block';
    
  } catch (error) {
    showError(error.message);
  }
}

// Render thread groups as checkboxes
function renderThreadGroups() {
  threadGroupsContainer.innerHTML = '';
  
  if (threadGroups.length === 0) {
    threadGroupsContainer.innerHTML = '<p class="help-text">No thread groups found in JMX file.</p>';
    return;
  }
  
  threadGroups.forEach((group, index) => {
    const label = document.createElement('label');
    label.className = 'checkbox-label';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'threadGroup';
    checkbox.value = group.testname;
    checkbox.checked = group.enabled;
    checkbox.id = `group-${index}`;
    
    const span = document.createElement('span');
    span.textContent = group.name;
    
    label.appendChild(checkbox);
    label.appendChild(span);
    threadGroupsContainer.appendChild(label);
  });
}

// Add advanced option field
function addAdvancedOption(key = '', value = '') {
  const optionDiv = document.createElement('div');
  optionDiv.className = 'advanced-option';
  optionDiv.dataset.id = advancedOptionCount++;
  
  const keyInput = document.createElement('input');
  keyInput.type = 'text';
  keyInput.placeholder = 'Property name (e.g., timeout)';
  keyInput.value = key;
  keyInput.className = 'option-key';
  
  const valueInput = document.createElement('input');
  valueInput.type = 'text';
  valueInput.placeholder = 'Value (e.g., 30000)';
  valueInput.value = value;
  valueInput.className = 'option-value';
  
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = '✕';
  removeBtn.onclick = () => optionDiv.remove();
  
  optionDiv.appendChild(keyInput);
  optionDiv.appendChild(valueInput);
  optionDiv.appendChild(removeBtn);
  
  advancedOptionsContainer.appendChild(optionDiv);
}

// Setup event listeners
function setupEventListeners() {
  // Add advanced option button
  addOptionBtn.addEventListener('click', () => addAdvancedOption());
  
  // Form submit
  testFormEl.addEventListener('submit', handleSubmit);
  
  // Mode radio change
  modeRadios.forEach(radio => {
    radio.addEventListener('change', updateModeLabel);
  });
  
  // Tab switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  
  // Stop button
  if (stopBtn) {
    stopBtn.addEventListener('click', handleStopTest);
  }
  
  // Reset button
  if (resetBtn) {
    resetBtn.addEventListener('click', handleResetTest);
  }
  
  // Retry button
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      errorMessageEl.style.display = 'none';
      testFormEl.style.display = 'block';
    });
  }
  
  // Download buttons
  const downloadZipBtn = document.getElementById('downloadZipBtn');
  const downloadCsvBtn = document.getElementById('downloadCsvBtn');
  const downloadReportBtn = document.getElementById('downloadReportBtn');
  const downloadLogsBtn = document.getElementById('downloadLogsBtn');
  
  if (downloadZipBtn) {
    downloadZipBtn.addEventListener('click', () => {
      window.location.href = '/api/download/zip';
    });
  }
  
  if (downloadCsvBtn) {
    downloadCsvBtn.addEventListener('click', () => {
      window.location.href = '/api/download/csv';
    });
  }
  
  if (downloadReportBtn) {
    downloadReportBtn.addEventListener('click', () => {
      window.open('/api/report', '_blank');
    });
  }
  
  if (downloadLogsBtn) {
    downloadLogsBtn.addEventListener('click', () => {
      window.location.href = '/api/download/logs';
    });
  }
}

// Update mode label
function updateModeLabel() {
  const selectedMode = document.querySelector('input[name="mode"]:checked').value;
  
  if (selectedMode === 'loop') {
    valueLabel.textContent = 'Loop Count';
    valueInput.value = '1';
    valueInput.min = '1';
  } else {
    valueLabel.textContent = 'Duration (seconds)';
    valueInput.value = '60';
    valueInput.min = '1';
  }
}

// Handle form submit
async function handleSubmit(e) {
  e.preventDefault();
  
  // Get selected thread groups
  const selectedGroups = Array.from(document.querySelectorAll('input[name="threadGroup"]:checked'))
    .map(cb => cb.value);
  
  if (selectedGroups.length === 0) {
    alert('Please select at least one thread group!');
    return;
  }
  
  // Get form values
  const environment = document.getElementById('environment').value;
  const users = parseInt(document.getElementById('users').value);
  const rampUp = parseInt(document.getElementById('rampUp').value);
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const value = parseInt(document.getElementById('value').value);
  
  if (!environment) {
    alert('Please select an environment!');
    return;
  }
  
  // Get advanced options
  const advancedOptions = Array.from(document.querySelectorAll('.advanced-option'))
    .map(option => ({
      key: option.querySelector('.option-key').value.trim(),
      value: option.querySelector('.option-value').value.trim()
    }))
    .filter(opt => opt.key && opt.value);
  
  // Build request payload
  const payload = {
    selectedGroups,
    environment,
    users,
    rampUp,
    mode,
    value,
    advancedOptions
  };
  
  // Disable submit button
  startTestBtn.disabled = true;
  startTestBtn.textContent = '⏳ Starting Test...';
  
  try {
    const response = await fetch('/api/start-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to start test');
    }
    
    // Show monitoring UI
    testFormEl.style.display = 'none';
    testMonitoringEl.style.display = 'block';
    headerStats.style.display = 'flex';
    headerActions.style.display = 'flex';
    
    // Update header status
    statusValue.textContent = 'RUNNING';
    statusValue.style.color = '#ff6b6b';
    
    // Enable stop button
    if (stopBtn) {
      stopBtn.disabled = false;
    }
    
    // Start real-time monitoring
    startStatsPolling();
    console.log('Test started:', data);
    
  } catch (error) {
    showError(error.message);
  } finally {
    startTestBtn.disabled = false;
    startTestBtn.textContent = '🚀 START TEST';
  }
}

// Switch tabs
function switchTab(tabName) {
  // Update tab buttons
  tabBtns.forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Update tab panels
  tabPanels.forEach(panel => {
    if (panel.id === tabName + 'Tab') {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });
}

// Handle stop test
async function handleStopTest() {
  if (!confirm('Are you sure you want to stop the test?')) {
    return;
  }
  
  try {
    const response = await fetch('/api/stop-test', {
      method: 'POST'
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Test stopped');
      // Stop polling
      if (statsInterval) {
        clearInterval(statsInterval);
        statsInterval = null;
      }
      // Update status
      statusValue.textContent = 'STOPPED';
      statusValue.style.color = '#ff9800';
      // Disable stop button
      if (stopBtn) stopBtn.disabled = true;
    }
  } catch (error) {
    console.error('Error stopping test:', error);
    alert('Failed to stop test: ' + error.message);
  }
}

// Handle reset test
async function handleResetTest() {
  if (!confirm('Are you sure you want to reset? This will clear all test data and return to the configuration form.')) {
    return;
  }
  
  try {
    const response = await fetch('/api/reset', {
      method: 'POST'
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Test reset');
      // Reset UI and go back to form
      resetUI();
      testFormEl.style.display = 'block';
      testMonitoringEl.style.display = 'none';
    }
  } catch (error) {
    console.error('Error resetting test:', error);
    alert('Failed to reset: ' + error.message);
  }
}

// Reset UI to initial state
function resetUI() {
  headerStats.style.display = 'none';
  headerActions.style.display = 'none';
  
  // Stop polling
  if (statsInterval) {
    clearInterval(statsInterval);
    statsInterval = null;
  }
  
  // Reset header values
  statusValue.textContent = 'READY';
  usersValue.textContent = '0';
  rpsValue.textContent = '0';
  failuresValue.textContent = '0%';
  
  // Disable stop button
  if (stopBtn) {
    stopBtn.disabled = true;
  }
  
  // Disable download buttons
  const downloadBtns = ['downloadZipBtn', 'downloadCsvBtn', 'downloadReportBtn', 'downloadLogsBtn'];
  downloadBtns.forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) btn.disabled = true;
  });
  
  // Clear stats table
  document.getElementById('statsTableBody').innerHTML = '<tr><td colspan="13" class="no-data">No data yet. Start a test to see statistics.</td></tr>';
}

// Show error message
function showError(message) {
  if (errorTextEl) {
    errorTextEl.textContent = message;
  }
  loadingEl.style.display = 'none';
  testFormEl.style.display = 'none';
  errorMessageEl.style.display = 'block';
}

// Initialize charts
function initCharts() {
  const chartConfig = {
    type: 'line',
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      animation: {
        duration: 0
      }
    }
  };
  
  // RPS Chart
  charts.rps = new Chart(document.getElementById('rpsChart'), {
    ...chartConfig,
    data: {
      labels: chartData.labels,
      datasets: [{
        label: 'Requests/sec',
        data: chartData.rps,
        borderColor: '#ff6b6b',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        tension: 0.4
      }]
    }
  });
  
  // Response Time Chart
  charts.responseTime = new Chart(document.getElementById('responseTimeChart'), {
    ...chartConfig,
    data: {
      labels: chartData.labels,
      datasets: [{
        label: 'Average Response Time (ms)',
        data: chartData.responseTime,
        borderColor: '#4ecdc4',
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        tension: 0.4
      }]
    }
  });
  
  // Users Chart
  charts.users = new Chart(document.getElementById('usersChart'), {
    ...chartConfig,
    data: {
      labels: chartData.labels,
      datasets: [{
        label: 'Active Users',
        data: chartData.users,
        borderColor: '#ffa726',
        backgroundColor: 'rgba(255, 167, 38, 0.1)',
        tension: 0.4
      }]
    }
  });
}

// Start polling stats
function startStatsPolling() {
  // Poll every 2 seconds
  statsInterval = setInterval(async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      
      // Update header stats
      statusValue.textContent = data.status;
      
      // Always update table and header values with latest data
      usersValue.textContent = data.users;
      rpsValue.textContent = data.rps;
      failuresValue.textContent = data.failures;
      
      // Always update stats table with latest data
      updateStatsTable(data.requests);
      
      if (data.status === 'RUNNING') {
        statusValue.style.color = 'white';
        // Enable stop button when running
        if (stopBtn) stopBtn.disabled = false;
        // Update charts while running
        updateCharts(data);
      } else if (data.status === 'PROCESSING') {
        statusValue.style.color = '#ffa500'; // Orange for processing
        // Keep polling until CSV is ready
        if (stopBtn) stopBtn.disabled = true;
      } else if (data.status === 'COMPLETED') {
        statusValue.style.color = '#4caf50';
        // Update one final time with completed data
        updateCharts(data);
        // Stop polling after showing completion
        if (statsInterval) {
          clearInterval(statsInterval);
          statsInterval = null;
        }
        // Disable stop button
        if (stopBtn) stopBtn.disabled = true;
        // Enable download buttons
        enableDownloadButtons();
        // Show completion notification
        alert('✅ Test completed! Report is ready.');
      } else {
        statusValue.style.color = 'white';
        if (stopBtn) stopBtn.disabled = true;
      }
      
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, 2000);
}

// Update stats table
function updateStatsTable(requests) {
  const tbody = document.getElementById('statsTableBody');
  
  if (!requests || requests.length === 0) {
    tbody.innerHTML = '<tr><td colspan="13" class="no-data">No data yet.</td></tr>';
    return;
  }
  
  tbody.innerHTML = requests.map(req => `
    <tr>
      <td>${req.type}</td>
      <td>${req.name}</td>
      <td>${req.requests}</td>
      <td>${req.fails}</td>
      <td>${req.median}</td>
      <td>${req.p95}</td>
      <td>${req.p99}</td>
      <td>${req.avg}</td>
      <td>${req.min}</td>
      <td>${req.max}</td>
      <td>${req.avgSize}</td>
      <td>${req.currentRps}</td>
      <td>${req.currentFailures}</td>
    </tr>
  `).join('');
}

// Update charts
function updateCharts(data) {
  const now = new Date().toLocaleTimeString();
  
  // Add new data point
  chartData.labels.push(now);
  chartData.rps.push(parseFloat(data.rps) || 0);
  chartData.responseTime.push(data.requests[0]?.avg || 0);
  chartData.users.push(data.users || 0);
  
  // Keep only last 30 data points
  if (chartData.labels.length > 30) {
    chartData.labels.shift();
    chartData.rps.shift();
    chartData.responseTime.shift();
    chartData.users.shift();
  }
  
  // Update all charts
  charts.rps.update();
  charts.responseTime.update();
  charts.users.update();
}

// Enable download buttons when test completes
function enableDownloadButtons() {
  const downloadBtns = ['downloadZipBtn', 'downloadCsvBtn', 'downloadReportBtn', 'downloadLogsBtn'];
  downloadBtns.forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) btn.disabled = false;
  });
  
  const infoText = document.getElementById('downloadInfoText');
  if (infoText) {
    infoText.textContent = 'Test completed! Downloads are now available.';
    infoText.style.color = '#4caf50';
  }
}

// Initialize app
init();
