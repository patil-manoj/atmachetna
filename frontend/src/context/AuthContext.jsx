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
      // Determine user type based on email domain
      const isAdminEmail = email.toLowerCase().endsWith('@atmachetna.com');
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

  const signup = async (email, password) => {
    try {
      // Determine user type based on email domain
      const isAdminEmail = email.toLowerCase().endsWith('@atmachetna.com');
      const userType = isAdminEmail ? 'admin' : 'student';
      
      console.log('Signup attempt:', { email, userType });
      
      // Prepare signup data - for students, we only send email and password
      const signupData = { email, password, userType };
      
      // For admin/counsellor, include name
      if (isAdminEmail) {
        signupData.name = 'Admin User';
      }
      
      const response = await authAPI.signup(signupData)
      console.log('Signup response:', response.data);
      
      const { token, user } = response.data.data
      localStorage.setItem('token', token)
      setUser(user)
      return { success: true }
    } catch (error) {
      console.error('Signup error:', error);
      console.error('Error response:', error.response?.data);
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
