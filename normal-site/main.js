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

// Helper: Authenticated fetch
async function authedFetch(url, options = {}) {
  if (!authToken) {
    throw new Error('Not authenticated');
  }

  const headers = new Headers(options.headers || {});
  headers.append('Authorization', `Bearer ${authToken}`);
  headers.append('Content-Type', 'application/json');

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const err = await res.json();
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
    if (link.dataset.page === pageName) {
      link.classList.add('active');
    }
  });

  currentPage = pageName;

  // Load page data
  if (pageName === 'diet' && authToken) {
    loadDietPage();
  }
}

// Check authentication on load
function checkAuth() {
  authToken = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');
  
  if (authToken && userStr) {
    currentUser = JSON.parse(userStr);
    console.log('✅ Logged in as:', currentUser.email);
    
    // Hide signup/login forms, show diet navigation
    document.getElementById('home-page').style.display = 'none';
    navigateTo('diet');
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
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role: 'caregiver' })
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
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('user', JSON.stringify(currentUser));
      
      showMessage('login-msg', 'Signed in successfully!', 'success');
      
      // Navigate to diet page
      setTimeout(() => {
        document.getElementById('home-page').style.display = 'none';
        navigateTo('diet');
      }, 1000);
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
  link.addEventListener('click', () => {
    const page = link.dataset.page;
    
    if (!authToken && page !== 'home') {
      alert('Please sign in first');
      return;
    }
    
    navigateTo(page);
  });
});

// Diet Page Functions
async function loadDietPage() {
  try {
    showLoading('diet-loading', true);
    hideError('diet-error');
    
    // Fetch patients
    const data = await authedFetch(`${API_BASE}/patients`);
    patients = data.patients || [];
    
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
    const [profileData, planData, mealsData] = await Promise.all([
      authedFetch(`${API_BASE}/nutrition/patient/${patientId}/profile`),
      authedFetch(`${API_BASE}/nutrition/patient/${patientId}/plan?days=7`),
      authedFetch(`${API_BASE}/nutrition/patient/${patientId}/meals`)
    ]);
    
    // Render nutrition profile
    renderNutritionProfile(profileData.profile);
    
    // Render meal plan
    renderMealPlan(planData.plan || []);
    
    // Render recent meals
    renderRecentMeals(mealsData.meals || []);
    
    // Show content
    showLoading('diet-loading', false);
    document.getElementById('diet-content').style.display = 'block';
    
  } catch (err) {
    showLoading('diet-loading', false);
    showError('diet-error', err.message);
  }
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

// Render meal plan
function renderMealPlan(plan) {
  const container = document.getElementById('meal-plan');
  
  if (!plan || plan.length === 0) {
    container.innerHTML = '<p style="color: #888; text-align: center;">No meal plan available.</p>';
    return;
  }
  
  container.innerHTML = plan.map(day => `
    <div class="meal-day">
      <div class="meal-day-header">📅 ${formatDate(day.day)}</div>
      <div class="meal-type">
        <span class="meal-type-label">🌅 Breakfast:</span>
        <span class="meal-type-value">${day.meals.breakfast.title}</span>
      </div>
      <div class="meal-type">
        <span class="meal-type-label">☀️ Lunch:</span>
        <span class="meal-type-value">${day.meals.lunch.title}</span>
      </div>
      <div class="meal-type">
        <span class="meal-type-label">🌙 Dinner:</span>
        <span class="meal-type-value">${day.meals.dinner.title}</span>
      </div>
      <div class="meal-type">
        <span class="meal-type-label">🍪 Snack:</span>
        <span class="meal-type-value">${day.meals.snack.title}</span>
      </div>
    </div>
  `).join('');
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
});