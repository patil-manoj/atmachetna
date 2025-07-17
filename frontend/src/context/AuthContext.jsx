import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../utils/api'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    if (token) {
      // Verify token with backend
      verifyToken()
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async () => {
    try {
      const response = await authAPI.me()
      setUser(response.data.data.user) // Changed from admin to user
    } catch (error) {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      // Determine user type based on email
      // Admin emails: admin@atmachetna.com, counsellor@atmachetna.com, or any email ending with @atmachetna.com for admin domain
      const adminEmails = ['admin@atmachetna.com', 'counsellor@atmachetna.com'];
      const isAdminEmail = adminEmails.includes(email.toLowerCase()) || email.toLowerCase().endsWith('@atmachetna.com');
      const userType = isAdminEmail ? 'admin' : 'student';
      
      const response = await authAPI.login({ email, password, userType })
      const { token, user } = response.data.data
      localStorage.setItem('token', token)
      setUser(user)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const signup = async (name, email, password) => {
    try {
      // Determine user type based on email (same logic as login)
      const adminEmails = ['admin@atmachetna.com', 'counsellor@atmachetna.com'];
      const isAdminEmail = adminEmails.includes(email.toLowerCase()) || email.toLowerCase().endsWith('@atmachetna.com');
      const userType = isAdminEmail ? 'admin' : 'student';
      
      const response = await authAPI.signup({ name, email, password, userType })
      const { token, user } = response.data.data
      localStorage.setItem('token', token)
      setUser(user)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Signup failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
