// DOM Elements
const loadingEl = document.getElementById('loading');
const testFormEl = document.getElementById('testForm');
const environmentSelect = document.getElementById('environment');
const threadGroupsContainer = document.getElementById('threadGroupsContainer');
const advancedOptionsContainer = document.getElementById('advancedOptionsContainer');
const addOptionBtn = document.getElementById('addOptionBtn');
const startTestBtn = document.getElementById('startTestBtn');
const testRunningEl = document.getElementById('testRunning');
const errorMessageEl = document.getElementById('errorMessage');
const errorTextEl = document.getElementById('errorText');
const reportPathEl = document.getElementById('reportPath');
const backBtn = document.getElementById('backBtn');
const retryBtn = document.getElementById('retryBtn');
const modeRadios = document.querySelectorAll('input[name="mode"]');
const valueLabel = document.getElementById('valueLabel');
const valueInput = document.getElementById('value');

// State
let threadGroups = [];
let environments = [];
let advancedOptionCount = 0;

// Initialize
async function init() {
  await Promise.all([
    loadEnvironments(),
    loadThreadGroups()
  ]);
  setupEventListeners();
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
  
  // Back button
  backBtn.addEventListener('click', () => {
    testRunningEl.style.display = 'none';
    testFormEl.style.display = 'block';
  });
  
  // Retry button
  retryBtn.addEventListener('click', () => {
    errorMessageEl.style.display = 'none';
    testFormEl.style.display = 'block';
  });
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
    
    // Show success message
    reportPathEl.textContent = data.reportDir;
    testFormEl.style.display = 'none';
    testRunningEl.style.display = 'block';
    
  } catch (error) {
    showError(error.message);
  } finally {
    startTestBtn.disabled = false;
    startTestBtn.textContent = '🚀 START TEST';
  }
}

// Show error message
function showError(message) {
  errorTextEl.textContent = message;
  loadingEl.style.display = 'none';
  testFormEl.style.display = 'none';
  errorMessageEl.style.display = 'block';
}

// Initialize app
init();
