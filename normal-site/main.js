// Global state
let authToken = null;
let currentUser = null;
let currentPage = 'home';
let patients = [];
let selectedPatientId = null;

// API Base URL
const API_BASE = window.location.origin.includes('localhost:8082') 
  ? 'http://localhost:3001/api' 
  : '/api';


// 2. THE NEW CODE: Session Restoration (Runs once when page loads)
document.addEventListener('DOMContentLoaded', () => {
  const storedToken = localStorage.getItem('authToken');
  const storedUser = localStorage.getItem('user');

  if (storedToken && storedUser && storedToken !== 'undefined') {
    // Restore state
    authToken = storedToken;
    currentUser = JSON.parse(storedUser);

    // Update UI
    document.getElementById('home-page').style.display = 'none';
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.style.display = 'block';

    console.log("Session restored! Navigating to dashboard...");
    
    // Redirect to the main page immediately
    navigateTo('patients'); 
  }
});

// Helper: Authenticated fetch
async function authedFetch(url, options = {}) {
  // Always read the token from localStorage to ensure it's current
  const token = localStorage.getItem('authToken');
  if (!token) {
    // Redirect to home page if not authenticated
    navigateTo('home');
    throw new Error('Not authenticated');
  }

  const headers = new Headers(options.headers || {});
  headers.append('Authorization', `Bearer ${token}`);
  headers.append('Content-Type', 'application/json');

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const err = await res.json();
    // If unauthorized, redirect to home page
    if (res.status === 401 || res.status === 403) {
      // Clear authentication data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      authToken = null;
      currentUser = null;
      // Hide logout button and show login forms
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) logoutBtn.style.display = 'none';
      // Navigate to home page
      navigateTo('home');
      throw new Error(err.message || 'Authentication required');
    }
    throw new Error(err.message || 'API request failed');
  }

  return res.json();
}

// Helper: Show message
function showMessage(elementId, text, type = 'success') {
  const el = document.getElementById(elementId);
  if (!el) return;
  
  el.textContent = text;
  el.className = `msg ${type}`;
  el.style.display = 'block';
  
  setTimeout(() => {
    el.style.display = 'none';
  }, 5000);
}

// Helper: Show error
function showError(elementId, text) {
  const el = document.getElementById(elementId);
  if (!el) return;
  
  el.textContent = `❌ ${text}`;
  el.style.display = 'block';
}

// Helper: Hide error
function hideError(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.style.display = 'none';
}

// Helper: Show loading
function showLoading(elementId, show = true) {
  const el = document.getElementById(elementId);
  if (el) el.style.display = show ? 'block' : 'none';
}

// Navigation
function navigateTo(pageName) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  // Show selected page
  const targetPage = document.getElementById(`${pageName}-page`);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    // Check if the link has a data-page attribute (not the logout button)
    if (link.dataset.page && link.dataset.page === pageName) {
      link.classList.add('active');
    }
  });

  currentPage = pageName;

  // Update URL without reloading the page (client-side routing)
  const newUrl = pageName === 'home' ? '/' : `/#${pageName}`;
  window.history.pushState({ page: pageName }, '', newUrl);

  // Load page data
  if (pageName === 'diet' && authToken) {
    loadDietPage();
  } else if (pageName === 'patients' && authToken) {
    loadPatientsPage();
  } else if (pageName === 'medications' && authToken) {
    loadMedicationsPage();
  } else if (pageName === 'progress' && authToken) {
    loadProgressPage();
  }
}

// Check authentication on load
function checkAuth() {
  // Always read the token from localStorage to ensure it's current
  authToken = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');
  
  if (authToken && userStr && userStr !== 'undefined') {
    try {
      currentUser = JSON.parse(userStr);
      console.log('✅ Logged in as:', currentUser.email);
      
      // Show logout button and hide signup/login forms
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.style.display = 'block';
        logoutBtn.classList.add('active'); // Make sure it's visible and active
      }
      
      // Show main navigation and hide login forms
      const homePage = document.getElementById('home-page');
      if (homePage) {
        homePage.style.display = 'none';
      }
      
      // Navigate to appropriate page based on auth state
      // Check if there's a specific page in the URL hash
      const hash = window.location.hash.substring(1);
      if (hash && hash !== 'home') {
        navigateTo(hash);
      } else {
        // Default to patients page as the main dashboard
        navigateTo('patients');
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
      // Clear invalid auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      authToken = null;
      currentUser = null;
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.style.display = 'none';
        logoutBtn.classList.remove('active');
      }
    }
  } else {
    // Hide logout button if not authenticated
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.style.display = 'none';
      logoutBtn.classList.remove('active');
    }
    
    // Show login/signup page
    const homePage = document.getElementById('home-page');
    if (homePage) {
      homePage.style.display = 'block';
      navigateTo('home');
    }
  }
}

// Signup Handler
document.getElementById('signup').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  
  if (!email || !password) {
    return showMessage('msg', 'Email and password required', 'error');
  }

  try {
    // Split name into first and last name for the backend
    const nameParts = name.split(' ');
    const first_name = nameParts[0] || name; // Use the whole name if no space found
    const last_name = nameParts.slice(1).join(' ') || ' '; // Use remaining parts or a space as placeholder
    
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name, last_name, email, password, role: 'family' })
    });

    const data = await res.json();

    if (res.ok) {
      showMessage('msg', 'Registration successful! Please sign in.', 'success');
      
      // Switch to login form
      setTimeout(() => {
        document.getElementById('signup').reset();
        document.getElementById('login-toggle').click();
      }, 1500);
    } else {
      showMessage('msg', data.message || 'Registration failed', 'error');
    }
  } catch (err) {
    showMessage('msg', err.message || 'Network error', 'error');
  }
});

// Login Handler
document.getElementById('login').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();
  
  if (!email || !password) {
    return showMessage('login-msg', 'Email and password required', 'error');
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      // Save auth data
      // ❌ OLD (Broken): data.token is undefined because it's inside 'data.data'
      // authToken = data.token;
      // currentUser = data.user;

      // ✅ NEW (Fixed): Access the nested 'data' object
      authToken = data.data.token;
      currentUser = data.data.user;

      localStorage.setItem('authToken', authToken);
      localStorage.setItem('user', JSON.stringify(currentUser));
      
      showMessage('login-msg', 'Signed in successfully!', 'success');
      
      // Show logout button and navigate to patients page as the main dashboard
      setTimeout(() => {
        document.getElementById('home-page').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'block';
        navigateTo('patients');
      }, 100);
    } else {
      showMessage('login-msg', data.message || 'Login failed', 'error');
    }
  } catch (err) {
    showMessage('login-msg', err.message || 'Network error', 'error');
  }
});

// Toggle between signup and login forms
document.getElementById('login-toggle').addEventListener('click', () => {
  document.getElementById('signup').parentElement.style.display = 'none';
  document.getElementById('login-form').style.display = 'block';
});

document.getElementById('signup-toggle').addEventListener('click', () => {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('signup').parentElement.style.display = 'block';
});

// Navigation listeners
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    const page = link.dataset.page;
    
    // Check if this is the logout button (has no data-page attribute)
    if (!page) {
      // This is the logout button, prevent default navigation and call logout
      e.preventDefault();
      logout();
      return;
    }
    
    // Check localStorage directly instead of in-memory variable
    const token = localStorage.getItem('authToken');
    if (!token && page !== 'home') {
      alert('Please sign in first');
      navigateTo('home'); // Navigate back to home page
      return;
    }
    
    navigateTo(page);
  });
});

// Logout function
function logout() {
  // Clear authentication data from localStorage
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  
  // Reset global state variables
  authToken = null;
  currentUser = null;
  patients = [];
  selectedPatientId = null;
  
  // Show signup/login forms, hide other pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById('home-page').style.display = 'block';
  document.getElementById('home-page').classList.add('active');
  
  // Reset navigation menu
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelector('.nav-link[data-page="home"]').classList.add('active');
  
  // Hide logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.style.display = 'none';
    logoutBtn.classList.remove('active');
  }
  
  // Reset any form inputs
  const loginForm = document.getElementById('login');
  if (loginForm) loginForm.reset();
  const signupForm = document.getElementById('signup');
  if (signupForm) signupForm.reset();
  
  // Reset the currentPage to 'home'
  currentPage = 'home';
}

// Add logout listener if logout button exists
const logoutButton = document.getElementById('logout-btn');
if (logoutButton) {
  logoutButton.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
}

// Diet Page Functions
async function loadDietPage() {
  try {
    showLoading('diet-loading', true);
    hideError('diet-error');
    
    // Fetch patients - updated endpoint
    const data = await authedFetch(`${API_BASE}/patients/me`);
    patients = data.data || [];
    
    if (patients.length === 0) {
      showLoading('diet-loading', false);
      document.getElementById('diet-empty').innerHTML = '<p>👋 No patients found. Ask your doctor to add you to a patient\'s care team.</p>';
      document.getElementById('diet-empty').style.display = 'block';
      return;
    }
    
    // Populate patient selector
    const selector = document.getElementById('diet-patient-select');
    selector.innerHTML = '<option value="">-- Choose Patient --</option>';
    
    patients.forEach(patient => {
      const option = document.createElement('option');
      option.value = patient.patient_id;
      option.textContent = patient.name;
      selector.appendChild(option);
    });
    
    // Show patient selector
    showLoading('diet-loading', false);
    document.getElementById('patient-selector').style.display = 'block';
    document.getElementById('diet-empty').style.display = 'block';
    
  } catch (err) {
    showLoading('diet-loading', false);
    showError('diet-error', err.message);
  }
}

// Patient selector change handler
document.getElementById('diet-patient-select').addEventListener('change', async (e) => {
  selectedPatientId = e.target.value;
  
  if (!selectedPatientId) {
    document.getElementById('diet-content').style.display = 'none';
    document.getElementById('diet-empty').style.display = 'block';
    return;
  }
  
  await loadDietData(selectedPatientId);
});

// Load diet data for selected patient
async function loadDietData(patientId) {
  try {
    showLoading('diet-loading', true);
    hideError('diet-error');
    document.getElementById('diet-content').style.display = 'none';
    document.getElementById('diet-empty').style.display = 'none';
    
    // Fetch nutrition data in parallel
    const [profileData, mealsData] = await Promise.all([
      authedFetch(`${API_BASE}/nutrition/${patientId}`),  // Updated endpoint
      authedFetch(`${API_BASE}/logs/meal/${patientId}`)  // Updated endpoint for meals
    ]);
    
    // Render nutrition profile
    renderNutritionProfile(profileData.data);  // Updated to access .data property
    
    // Render recent meals
    renderRecentMeals(mealsData.data || []);  // Updated to access .data property
    
    // Show content
    showLoading('diet-loading', false);
    document.getElementById('diet-content').style.display = 'block';
    
  } catch (err) {
    showLoading('diet-loading', false);
    showError('diet-error', err.message);
  }
}

// Patients Page Functions
async function loadPatientsPage() {
 try {
   showLoading('patients-loading', true);
   hideError('patients-error');
   
   // Fetch patients
   const data = await authedFetch(`${API_BASE}/patients/me`);
   patients = data.data || [];
   
   if (patients.length === 0) {
     showLoading('patients-loading', false);
     document.getElementById('patients-empty').style.display = 'block';
     return;
   }
   
   // Render patients list
   renderPatientsList(patients);
   showLoading('patients-loading', false);
   document.getElementById('patients-empty').style.display = 'none';
   
 } catch (err) {
   showLoading('patients-loading', false);
   showError('patients-error', err.message);
 }
}

// Render patients list
function renderPatientsList(patients) {
 const container = document.getElementById('patients-list');
 container.innerHTML = patients.map(patient => `
   <div class="patient-card">
     <h3>${patient.name}</h3>
     <p><strong>DOB:</strong> ${new Date(patient.date_of_birth).toLocaleDateString()}</p>
     <p><strong>Gender:</strong> ${patient.gender || 'Not specified'}</p>
     <p><strong>Unique Code:</strong> ${patient.unique_code}</p>
     <div class="patient-actions">
       <button class="btn secondary" onclick="navigateToPatientDetails('${patient.patient_id}')">View Details</button>
     </div>
   </div>
 `).join('');
}

// Medications Page Functions
async function loadMedicationsPage() {
 try {
   showLoading('medications-loading', true);
   hideError('medications-error');
   
   // Fetch patients
   const data = await authedFetch(`${API_BASE}/patients/me`);
   patients = data.data || [];
   
   if (patients.length === 0) {
     showLoading('medications-loading', false);
     document.getElementById('medications-empty').innerHTML = '<p>👋 No patients found. Ask your doctor to add you to a patient\'s care team.</p>';
     document.getElementById('medications-empty').style.display = 'block';
     return;
   }
   
   // Populate patient selector
   const selector = document.getElementById('medications-patient-select');
   selector.innerHTML = '<option value="">-- Choose Patient --</option>';
   
   patients.forEach(patient => {
     const option = document.createElement('option');
     option.value = patient.patient_id;
     option.textContent = patient.name;
     selector.appendChild(option);
   });
   
   // Show patient selector
   showLoading('medications-loading', false);
   document.getElementById('medications-patient-selector').style.display = 'block';
   document.getElementById('medications-empty').style.display = 'block';
   
 } catch (err) {
   showLoading('medications-loading', false);
   showError('medications-error', err.message);
 }
}

// Patient selector change handler for medications
document.getElementById('medications-patient-select').addEventListener('change', async (e) => {
 const patientId = e.target.value;
 
 if (!patientId) {
   document.getElementById('medications-content').style.display = 'none';
   document.getElementById('medications-empty').style.display = 'block';
   return;
 }
 
 await loadMedicationsData(patientId);
});

// Load medications data for selected patient
async function loadMedicationsData(patientId) {
 try {
   showLoading('medications-loading', true);
   hideError('medications-error');
   document.getElementById('medications-content').style.display = 'none';
   document.getElementById('medications-empty').style.display = 'none';
   
   // Fetch prescriptions and adherence data in parallel
   const [prescriptionsData, adherenceData] = await Promise.all([
     authedFetch(`${API_BASE}/prescriptions/${patientId}`),
     authedFetch(`${API_BASE}/logs/adherence/${patientId}`)
   ]);
   
   // Render prescriptions
   renderPrescriptions(prescriptionsData.data || []);
   
   // Render adherence logs
   renderAdherenceLogs(adherenceData.data || []);
   
   // Show content
   showLoading('medications-loading', false);
   document.getElementById('medications-content').style.display = 'block';
   
 } catch (err) {
   showLoading('medications-loading', false);
   showError('medications-error', err.message);
 }
}

// Render prescriptions
function renderPrescriptions(prescriptions) {
 const container = document.getElementById('prescriptions-list');
 
 if (!prescriptions || prescriptions.length === 0) {
   container.innerHTML = '<p style="color: #888; text-align: center;">No prescriptions available.</p>';
   return;
 }
 
 container.innerHTML = prescriptions.map(prescription => `
   <div class="prescription-card">
     <h4>${prescription.medication_name}</h4>
     <p><strong>Dosage:</strong> ${prescription.dosage}</p>
     <p><strong>Frequency:</strong> ${prescription.frequency_per_day} times per day</p>
     <p><strong>Times:</strong> ${prescription.dosing_times.join(', ')}</p>
     <p><strong>Instructions:</strong> ${prescription.instructions || 'None'}</p>
     <p><strong>Active:</strong> ${prescription.is_active ? 'Yes' : 'No'}</p>
   </div>
 `).join('');
}

// Render adherence logs
function renderAdherenceLogs(adherenceLogs) {
 const container = document.getElementById('adherence-list');
 
 if (!adherenceLogs || adherenceLogs.length === 0) {
   container.innerHTML = '<p style="color: #888; text-align: center;">No adherence logs available.</p>';
   return;
 }
 
 // Show only the most recent logs
 const recentLogs = adherenceLogs.slice(0, 10);
 
 container.innerHTML = recentLogs.map(log => `
   <div class="adherence-card">
     <div class="adherence-header">
       <span class="adherence-status ${log.status}">${getAdherenceStatusEmoji(log.status)} ${formatAdherenceStatus(log.status)}</span>
       <span class="adherence-date">${formatDate(log.created_at)}</span>
     </div>
     <p><strong>Medication:</strong> ${log.prescription?.medication_name || 'Unknown'}</p>
     <p><strong>Scheduled:</strong> ${log.scheduled_time ? new Date(log.scheduled_time).toLocaleTimeString() : 'N/A'}</p>
     <p><strong>Taken:</strong> ${log.taken_time ? new Date(log.taken_time).toLocaleTimeString() : 'Not taken'}</p>
     ${log.notes ? `<p><strong>Notes:</strong> ${log.notes}</p>` : ''}
   </div>
 `).join('');
}

// Progress Page Functions
async function loadProgressPage() {
 try {
   showLoading('progress-loading', true);
   hideError('progress-error');
   
   // Fetch patients
   const data = await authedFetch(`${API_BASE}/patients/me`);
   patients = data.data || [];
   
   if (patients.length === 0) {
     showLoading('progress-loading', false);
     document.getElementById('progress-empty').innerHTML = '<p>👋 No patients found. Ask your doctor to add you to a patient\'s care team.</p>';
     document.getElementById('progress-empty').style.display = 'block';
     return;
   }
   
   // Populate patient selector
   const selector = document.getElementById('progress-patient-select');
   selector.innerHTML = '<option value="">-- Choose Patient --</option>';
   
   patients.forEach(patient => {
     const option = document.createElement('option');
     option.value = patient.patient_id;
     option.textContent = patient.name;
     selector.appendChild(option);
   });
   
   // Show patient selector
   showLoading('progress-loading', false);
   document.getElementById('progress-patient-selector').style.display = 'block';
   document.getElementById('progress-empty').style.display = 'block';
   
 } catch (err) {
   showLoading('progress-loading', false);
   showError('progress-error', err.message);
 }
}

// Patient selector change handler for progress
document.getElementById('progress-patient-select').addEventListener('change', async (e) => {
 const patientId = e.target.value;
 
 if (!patientId) {
   document.getElementById('progress-content').style.display = 'none';
   document.getElementById('progress-empty').style.display = 'block';
   return;
 }
 
 await loadProgressData(patientId);
});

// Load progress data for selected patient
async function loadProgressData(patientId) {
 try {
   showLoading('progress-loading', true);
   hideError('progress-error');
   document.getElementById('progress-content').style.display = 'none';
   document.getElementById('progress-empty').style.display = 'none';
   
   // Fetch progress data in parallel
   const [snapshotsData, logsData] = await Promise.all([
     authedFetch(`${API_BASE}/logs/snapshot/${patientId}`),
     authedFetch(`${API_BASE}/logs/progress/${patientId}`)
   ]);
   
   // Render snapshots
   renderProgressSnapshots(snapshotsData.data || []);
   
   // Render progress logs
   renderProgressLogs(logsData.data || []);
   
   // Show content
   showLoading('progress-loading', false);
   document.getElementById('progress-content').style.display = 'block';
   
 } catch (err) {
   showLoading('progress-loading', false);
   showError('progress-error', err.message);
 }
}

// Render progress snapshots
function renderProgressSnapshots(snapshots) {
 const container = document.getElementById('snapshots-list');
 
 if (!snapshots || snapshots.length === 0) {
   container.innerHTML = '<p style="color: #888; text-align: center;">No progress snapshots available.</p>';
   return;
 }
 
 // Show only the most recent snapshots
 const recentSnapshots = snapshots.slice(0, 10);
 
 container.innerHTML = recentSnapshots.map(snapshot => `
   <div class="snapshot-card">
     <div class="snapshot-header">
       <span class="snapshot-date">${formatDate(snapshot.recorded_at)}</span>
       <span class="snapshot-mood">${getMoodEmoji(snapshot.mood)} ${snapshot.mood || 'N/A'}</span>
     </div>
     <div class="snapshot-metrics">
       <p><strong>Symptom Score:</strong> ${snapshot.symptom_score || 'N/A'}/10</p>
       <p><strong>Mobility Score:</strong> ${snapshot.mobility_score || 'N/A'}/10</p>
       <p><strong>Exercise Completed:</strong> ${snapshot.exercise_completed ? 'Yes' : 'No'}</p>
       <p><strong>Blood Pressure:</strong> ${snapshot.blood_pressure_systolic ? `${snapshot.blood_pressure_systolic}/${snapshot.blood_pressure_diastolic} mmHg` : 'N/A'}</p>
     </div>
     ${snapshot.notes ? `<p><strong>Notes:</strong> ${snapshot.notes}</p>` : ''}
   </div>
 `).join('');
}

// Render progress logs
function renderProgressLogs(progressLogs) {
 const container = document.getElementById('progress-logs-list');
 
 if (!progressLogs || progressLogs.length === 0) {
   container.innerHTML = '<p style="color: #888; text-align: center;">No progress logs available.</p>';
   return;
 }
 
 // Show only the most recent logs
 const recentLogs = progressLogs.slice(0, 10);
 
 container.innerHTML = recentLogs.map(log => `
   <div class="progress-log-card">
     <div class="progress-log-header">
       <span class="progress-log-date">${formatDate(log.created_at)}</span>
       <span class="progress-log-author">${log.author_role === 'medical' ? '🏥 Medical' : '👥 Family'}</span>
     </div>
     <p>${log.log_text}</p>
   </div>
 `).join('');
}

// Helper function to navigate to patient details (placeholder)
function navigateToPatientDetails(patientId) {
 // For now, just alert the patient ID - in a real implementation, this would navigate to a patient details page
 alert(`Navigating to patient details for ID: ${patientId}`);
}

// Helper functions for medications and progress pages
function getAdherenceStatusEmoji(status) {
 const map = {
   taken: '✅',
   missed: '❌',
   delayed: '⏰'
 };
 return map[status] || '❓';
}

function formatAdherenceStatus(status) {
 const map = {
   taken: 'Taken',
   missed: 'Missed',
   delayed: 'Delayed'
 };
 return map[status] || status;
}

function getMoodEmoji(mood) {
 const map = {
   happy: '😊',
   okay: '🙂',
   sad: '😔',
   anxious: '😰',
   tired: '😴'
 };
 return map[mood] || '😐';
}

// Render nutrition profile
function renderNutritionProfile(profile) {
  const container = document.getElementById('nutrition-profile');
  
  if (!profile) {
    container.innerHTML = '<p style="color: #888; text-align: center;">No nutrition profile set yet.</p>';
    return;
  }
  
  container.innerHTML = `
    <div class="info-item">
      <div class="info-label">Calorie Target</div>
      <div class="info-value">${profile.calorie_target_min || 0} - ${profile.calorie_target_max || 0} kcal</div>
    </div>
    <div class="info-item">
      <div class="info-label">Sodium Limit</div>
      <div class="info-value">${profile.sodium_limit_mg || 0} mg</div>
    </div>
    <div class="info-item">
      <div class="info-label">Fiber Target</div>
      <div class="info-value">${profile.fiber_target_g || 0} g</div>
    </div>
    <div class="info-item">
      <div class="info-label">Fluid Limit</div>
      <div class="info-value">${profile.fluid_limit_ml || 0} ml</div>
    </div>
  `;
}


// Render recent meals
function renderRecentMeals(meals) {
  const container = document.getElementById('recent-meals');
  
  if (!meals || meals.length === 0) {
    container.innerHTML = '<p style="color: #888; text-align: center;">No meals logged yet.</p>';
    return;
  }
  
  // Show only last 10 meals
  const recentMeals = meals.slice(0, 10);
  
  container.innerHTML = recentMeals.map(meal => `
    <div class="meal-item">
      <div class="meal-header">
        <div class="meal-time">${getMealTypeEmoji(meal.meal_type)} ${formatMealType(meal.meal_type)}</div>
        <div class="meal-date">${formatDate(meal.logged_for)}</div>
      </div>
      <div class="meal-foods">🍽️ ${meal.foods.join(', ')}</div>
      <div class="meal-nutrition">
        <span>⚡ ${meal.calories} kcal</span>
        <span>🧂 ${meal.sodium_mg} mg Na</span>
        <span>🌾 ${meal.fiber_g} g Fiber</span>
      </div>
      ${meal.feedback && meal.feedback.status === 'warning' ? `
        <div class="meal-feedback">⚠️ ${meal.feedback.notes.join(', ')}</div>
      ` : ''}
    </div>
  `).join('');
}

// Helper functions
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function formatMealType(type) {
  const map = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack'
  };
  return map[type] || type;
}

function getMealTypeEmoji(type) {
  const map = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍪'
  };
  return map[type] || '🍽️';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  
  // Handle browser back/forward buttons
  window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page) {
      navigateTo(event.state.page);
    } else {
      // Default to home if no state
      navigateTo('home');
    }
  });
  
  // Check URL hash on initial load to navigate to the correct page
  const hash = window.location.hash.substring(1);
  if (hash && authToken) {
    // If there's a hash and user is authenticated, navigate to that page
    navigateTo(hash);
  }
});

// Add event listener for page visibility changes to maintain authentication state
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    // Page became visible again, check authentication state
    checkAuth();
  }
});

// Also check authentication state when the page is focused
window.addEventListener('focus', () => {
  checkAuth();
});