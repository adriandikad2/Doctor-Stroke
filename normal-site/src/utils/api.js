/**
 * API Client for Doctor-Stroke (Family/Patient Side)
 */

const API_BASE_URL = '/api'; // Menggunakan Proxy Vite

export const getAuthToken = () => localStorage.getItem('authToken');

const getAuthHeader = () => {
  const token = getAuthToken();
  return token 
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } 
    : { 'Content-Type': 'application/json' };
};

export const apiRequest = async (endpoint, method = 'GET', data = null) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    method,
    headers: getAuthHeader(),
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    
    let responseData;
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/'; 
      }
      throw { 
        status: response.status, 
        message: responseData.message || 'Error Server' 
      };
    }

    return responseData;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// --- OBJECT UTAMA 'api' ---
export const api = {
  get: (endpoint) => apiRequest(endpoint, 'GET'),
  post: (endpoint, data) => apiRequest(endpoint, 'POST', data),
  put: (endpoint, data) => apiRequest(endpoint, 'PUT', data),
  delete: (endpoint) => apiRequest(endpoint, 'DELETE'),
};

// --- ENDPOINTS KHUSUS ---
export const authAPI = {
  login: (email, password) => apiRequest('/auth/login', 'POST', { email, password }),
  register: (userData) => apiRequest('/auth/register', 'POST', userData),
  getMe: () => apiRequest('/auth/me', 'GET'),
};

export const patientAPI = {
  create: (data) => apiRequest('/patients', 'POST', data),
  getMyPatients: () => apiRequest('/patients/my-patients', 'GET'),
};

export const appointmentAPI = {
  getSlotsByDoctor: (doctorId) => apiRequest(`/appointments/slots/${doctorId}`, 'GET'),
  bookSlot: (slotId, patientId, notes) => apiRequest('/appointments/book', 'POST', { slot_id: slotId, patient_id: patientId, notes }),
  getMyAppointments: () => apiRequest('/appointments/me', 'GET'),
};

export const prescriptionAPI = {
  getMyList: () => apiRequest('/prescriptions/my-list', 'GET'),
  logAdherence: (prescriptionId, status, notes) => 
    apiRequest('/logs/adherence', 'POST', { prescription_id: prescriptionId, status, notes }),
};

export const nutritionAPI = {
  getProfile: (patientId) => apiRequest(`/nutrition/${patientId}`, 'GET'),
  logMeal: (data) => apiRequest('/logs/meal', 'POST', data),
  getCatalogs: () => apiRequest('/catalogs/diets', 'GET'),
};

export const progressAPI = {
  createLog: (data) => apiRequest('/logs/progress', 'POST', data),
  getHistory: (patientId) => apiRequest(`/logs/progress/${patientId}`, 'GET'),
};

export const exerciseAPI = {
  getAssignments: (patientId) => apiRequest(`/exercises/assignments/${patientId}`, 'GET'),
  logCompletion: (assignmentId, status) => apiRequest('/logs/exercise', 'POST', { assignment_id: assignmentId, status }),
};

export const insightAPI = {
  getSummary: (patientId) => apiRequest(`/insight/patient/${patientId}/summary`, 'GET'),
};