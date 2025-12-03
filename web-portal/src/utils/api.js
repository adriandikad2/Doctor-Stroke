/**
 * API Client for Doctor-Stroke Backend
 * Handles all API calls with authentication, error handling, and interceptors
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Helper function to get auth token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Helper function to get authorization header
 */
const getAuthHeader = () => {
  const token = getAuthToken();
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
  return {
    'Content-Type': 'application/json',
  };
};

/**
 * Generic API request function
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} data - Request body data (for POST, PUT)
 * @param {object} options - Additional options (headers, params, etc)
 * @returns {Promise<object>} - API response data
 */
const apiRequest = async (endpoint, method = 'GET', data = null, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getAuthHeader();
  
  const config = {
    method,
    headers,
    ...options,
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    config.body = JSON.stringify(data);
  }

  try {
    console.log(`[API] ${method} ${url}`, data ? data : '');
    console.log(`[API Headers]`, headers);
    
    const response = await fetch(url, config);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    let responseData;

    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // Log response
    console.log(`[API Response] ${response.status} ${method} ${endpoint}`, responseData);

    // Handle error responses
    if (!response.ok) {
      const errorMessage = responseData?.message || responseData?.error || `HTTP ${response.status}: API request failed`;
      console.error(`[API Error] ${response.status} - ${errorMessage}`);
      
      // Handle 401/403 - Clear auth and redirect
      if (response.status === 401 || response.status === 403) {
        clearAuth();
        window.location.href = '/';
      }
      
      throw {
        success: false,
        status: response.status,
        message: errorMessage,
        data: responseData,
      };
    }

    // If response is JSON from backend, return it directly (don't double-wrap)
    // Backend returns: { success: true/false, message, data }
    // We should return that as-is, not wrap it again
    return responseData;
  } catch (error) {
    console.error(`[API Catch Error] ${method} ${endpoint}:`, error);
    
    // Network error
    if (error instanceof TypeError) {
      throw {
        success: false,
        status: 0,
        message: `Network error: ${error.message}. Make sure backend is running at ${API_BASE_URL}`,
      };
    }
    
    // API error
    if (error.status || error.success === false) {
      throw error;
    }
    
    throw {
      success: false,
      status: -1,
      message: error.message || 'Unknown error occurred'
    };
  }
};

// =========================================================
// AUTH ENDPOINTS
// =========================================================

export const authAPI = {
  /**
   * Register a new user (doctor/therapist)
   */
  register: async (userData) => {
    return apiRequest('/auth/register', 'POST', userData);
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    return apiRequest('/auth/login', 'POST', { email, password });
  },

  /**
   * Google OAuth login
   */
  googleLogin: async (googleToken) => {
    return apiRequest('/auth/google', 'POST', { token: googleToken });
  },

  /**
   * Apple OAuth login
   */
  appleLogin: async (appleToken) => {
    return apiRequest('/auth/apple', 'POST', { token: appleToken });
  },
};

// =========================================================
// PATIENT ENDPOINTS (Doctor/Therapist View)
// =========================================================

export const patientAPI = {
  /**
   * Get all patients linked to current user (doctor/therapist)
   */
  getMyPatients: async () => {
    return apiRequest('/patients/me', 'GET');
  },

  /**
   * Get specific patient by ID
   */
  getPatientById: async (patientId) => {
    return apiRequest(`/patients/${patientId}`, 'GET');
  },

  /**
   * Link/connect a patient using unique code (doctor/therapist workflow)
   */
  linkPatient: async (uniqueCode) => {
    return apiRequest('/patients/link', 'POST', { unique_code: uniqueCode });
  },

  /**
   * Get all patients (admin only)
   */
  getAllPatients: async () => {
    return apiRequest('/patients/all', 'GET');
  },
};

// =========================================================
// APPOINTMENT ENDPOINTS
// =========================================================

export const appointmentAPI = {
  /**
   * Create availability slot (doctor/therapist only)
   */
  createSlot: async (slotData) => {
    return apiRequest('/appointments/slots', 'POST', slotData);
  },

  /**
   * Get all available slots for current user (doctor/therapist)
   */
  getMySlots: async () => {
    return apiRequest('/appointments/my-slots', 'GET');
  },

  /**
   * Get available slots for a specific medical user
   */
  getAvailableSlots: async (medicalUserId) => {
    return apiRequest(`/appointments/slots/${medicalUserId}`, 'GET');
  },

  /**
   * Get appointments for a specific patient
   */
  getAppointmentsByPatient: async (patientId) => {
    return apiRequest(`/appointments/patient/${patientId}`, 'GET');
  },

  /**
   * Get all appointments booked by current user
   */
  getMyAppointments: async () => {
    return apiRequest('/appointments/me', 'GET');
  },

  /**
   * Get all appointments (admin only)
   */
  getAllAppointments: async () => {
    return apiRequest('/appointments/all', 'GET');
  },

  /**
   * Get all slots (admin only)
   */
  getAllSlots: async () => {
    return apiRequest('/appointments/slots/all', 'GET');
  },
};

// =========================================================
// PRESCRIPTION ENDPOINTS
// =========================================================

export const prescriptionAPI = {
  /**
   * Create a new prescription (doctor only)
   */
  create: async (prescriptionData) => {
    return apiRequest('/prescriptions/', 'POST', prescriptionData);
  },

  /**
   * Get all prescriptions for a patient
   */
  getByPatientId: async (patientId) => {
    return apiRequest(`/prescriptions/${patientId}`, 'GET');
  },

  /**
   * Update a prescription (doctor only)
   */
  update: async (prescriptionId, prescriptionData) => {
    return apiRequest(`/prescriptions/${prescriptionId}`, 'PUT', prescriptionData);
  },

  /**
   * Delete a prescription (doctor only)
   */
  delete: async (prescriptionId) => {
    return apiRequest(`/prescriptions/${prescriptionId}`, 'DELETE');
  },

  /**
   * Get all prescriptions (admin only)
   */
  getAll: async () => {
    return apiRequest('/prescriptions/all', 'GET');
  },
};

// =========================================================
// NUTRITION ENDPOINTS
// =========================================================

export const nutritionAPI = {
  /**
   * Get nutrition profile for a patient
   */
  getProfile: async (patientId) => {
    return apiRequest(`/nutrition/${patientId}`, 'GET');
  },

  /**
   * Update nutrition profile (doctor/therapist only)
   */
  updateProfile: async (patientId, profileData) => {
    return apiRequest(`/nutrition/${patientId}`, 'PUT', profileData);
  },

  /**
   * Get meal feedback for today (family only)
   */
  getMealFeedback: async (patientId) => {
    return apiRequest(`/nutrition/${patientId}/feedback`, 'GET');
  },

  /**
   * Get all nutrition profiles (admin only)
   */
  getAll: async () => {
    return apiRequest('/nutrition/all', 'GET');
  },
};

// =========================================================
// LOG ENDPOINTS (Progress, Meal, Adherence, Snapshot)
// =========================================================

export const logAPI = {
  // --- PROGRESS LOGS ---
  progress: {
    /**
     * Create a new progress log
     */
    create: async (logData) => {
      return apiRequest('/logs/progress', 'POST', logData);
    },

    /**
     * Get all progress logs for a patient
     */
    getByPatientId: async (patientId) => {
      return apiRequest(`/logs/progress/${patientId}`, 'GET');
    },

    /**
     * Update a progress log
     */
    update: async (logId, logData) => {
      return apiRequest(`/logs/progress/${logId}`, 'PUT', logData);
    },

    /**
     * Delete a progress log
     */
    delete: async (logId) => {
      return apiRequest(`/logs/progress/${logId}`, 'DELETE');
    },

    /**
     * Get all progress logs (admin only)
     */
    getAll: async () => {
      return apiRequest('/logs/progress/all', 'GET');
    },
  },

  // --- MEAL LOGS ---
  meal: {
    /**
     * Create a new meal log
     */
    create: async (logData) => {
      return apiRequest('/logs/meal', 'POST', logData);
    },

    /**
     * Get all meal logs for a patient
     */
    getByPatientId: async (patientId) => {
      return apiRequest(`/logs/meal/${patientId}`, 'GET');
    },

    /**
     * Update a meal log
     */
    update: async (logId, logData) => {
      return apiRequest(`/logs/meal/${logId}`, 'PUT', logData);
    },

    /**
     * Delete a meal log
     */
    delete: async (logId) => {
      return apiRequest(`/logs/meal/${logId}`, 'DELETE');
    },

    /**
     * Get all meal logs (admin only)
     */
    getAll: async () => {
      return apiRequest('/logs/meal/all', 'GET');
    },
  },

  // --- ADHERENCE LOGS ---
  adherence: {
    /**
     * Create a new adherence log
     */
    create: async (logData) => {
      return apiRequest('/logs/adherence', 'POST', logData);
    },

    /**
     * Get all adherence logs for a patient
     */
    getByPatientId: async (patientId) => {
      return apiRequest(`/logs/adherence/${patientId}`, 'GET');
    },

    /**
     * Update an adherence log
     */
    update: async (logId, logData) => {
      return apiRequest(`/logs/adherence/${logId}`, 'PUT', logData);
    },

    /**
     * Delete an adherence log
     */
    delete: async (logId) => {
      return apiRequest(`/logs/adherence/${logId}`, 'DELETE');
    },

    /**
     * Get all adherence logs (admin only)
     */
    getAll: async () => {
      return apiRequest('/logs/adherence/all', 'GET');
    },
  },

  // --- SNAPSHOT LOGS ---
  snapshot: {
    /**
     * Create a new snapshot
     */
    create: async (snapshotData) => {
      return apiRequest('/logs/snapshot', 'POST', snapshotData);
    },

    /**
     * Get all snapshots for a patient
     */
    getByPatientId: async (patientId) => {
      return apiRequest(`/logs/snapshot/${patientId}`, 'GET');
    },

    /**
     * Update a snapshot
     */
    update: async (snapshotId, snapshotData) => {
      return apiRequest(`/logs/snapshot/${snapshotId}`, 'PUT', snapshotData);
    },

    /**
     * Delete a snapshot
     */
    delete: async (snapshotId) => {
      return apiRequest(`/logs/snapshot/${snapshotId}`, 'DELETE');
    },

    /**
     * Get all snapshots (admin only)
     */
    getAll: async () => {
      return apiRequest('/logs/snapshot/all', 'GET');
    },
  },
};

// =========================================================
// CARE TEAM ENDPOINTS
// =========================================================

export const careTeamAPI = {
  /**
   * Get care team for a patient
   */
  getTeam: async (patientId) => {
    return apiRequest(`/care-team/${patientId}`, 'GET');
  },

  /**
   * Remove a member from care team
   */
  removeMember: async (linkId) => {
    return apiRequest(`/care-team/${linkId}`, 'DELETE');
  },

  /**
   * Get all care team links (admin only)
   */
  getAll: async () => {
    return apiRequest('/care-team/all', 'GET');
  },
};

// =========================================================
// UTILITY FUNCTIONS
// =========================================================

/**
 * Clear authentication data from localStorage
 */
export const clearAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

/**
 * Save authentication data to localStorage
 */
export const saveAuth = (token, user) => {
  if (token) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user || {}));
  } else {
    console.error('Attempting to save null/undefined token');
  }
};

/**
 * Get saved user data from localStorage
 */
export const getSavedUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Get current auth token
 */
export const getToken = () => {
  return getAuthToken();
};
