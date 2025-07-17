import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API functions
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (data) => api.post('/auth/signup', data), // For future implementation
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  changePassword: (data) => api.put('/auth/change-password', data),
}

export const studentsAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  getMe: () => api.get('/students/me'), // For student to get their own profile
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getStats: () => api.get('/students/stats/overview'),
}

export const appointmentsAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
  confirm: (id, data) => api.patch(`/appointments/${id}/confirm`, data),
  complete: (id, data) => api.patch(`/appointments/${id}/complete`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
  getPending: () => api.get('/appointments/status/pending'),
}

export const emailAPI = {
  sendConfirmation: (data) => api.post('/email/appointment-confirmation', data),
  sendFollowUp: (data) => api.post('/email/follow-up', data),
  testEmail: () => api.post('/email/test'),
}

export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard'),
  getStudents: () => api.get('/stats/students'),
  getAppointments: () => api.get('/stats/appointments'),
  getCalendar: (params) => api.get('/stats/calendar', { params }),
}

export default api
