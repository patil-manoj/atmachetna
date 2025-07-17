import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { EyeIcon, EyeSlashIcon, UserIcon, LockClosedIcon } from '@heroicons/react/24/outline'

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { user, login } = useAuth()

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(formData.email, formData.password)
    
    if (!result.success) {
      setError(result.error)
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Illustration */}
        <div className="hidden lg:flex flex-col items-center justify-center space-y-8 animate-fade-in">
          <div className="relative">
            <img 
              src="/images/login.png" 
              alt="Counseling Session Illustration" 
              className="w-full max-w-lg h-auto object-contain animate-bounce-subtle"
              onError={(e) => {
                // Fallback to login1.png if login.png doesn't exist
                e.target.src = '/images/login1.png'
                e.target.onerror = () => {
                  // If neither image exists, hide the image
                  e.target.style.display = 'none'
                }
              }}
            />
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-16 h-16 bg-accent-200 rounded-full opacity-50 animate-pulse"></div>
            <div className="absolute bottom-8 left-8 w-12 h-12 bg-primary-200 rounded-full opacity-40 animate-pulse delay-100"></div>
            <div className="absolute top-1/2 left-4 w-8 h-8 bg-secondary-200 rounded-full opacity-30 animate-pulse delay-200"></div>
          </div>
          
          <div className="text-center space-y-4 animate-slide-up">
            <h1 className="text-4xl font-bold text-gray-800">
              Welcome to <span className="text-accent-600">{import.meta.env.VITE_APP_NAME || 'Atma-Chethana'}</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-md">
              Empowering minds, nurturing wellness. Your trusted partner in mental health and counseling services.
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex flex-col items-center justify-center animate-slide-up">
          <div className="w-full max-w-md">
            {/* Header for mobile */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <img 
                  src="/images/logo.png" 
                  alt={import.meta.env.VITE_APP_NAME} 
                  className="h-12 w-auto"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {import.meta.env.VITE_APP_NAME || 'Atma-Chethana'}
              </h2>
            </div>

            {/* Login Card */}
            <div className="glass-card p-8 space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">SIGN In</h3>
                <p className="text-gray-600">login to {import.meta.env.VITE_APP_NAME || 'Atma Chethana'}</p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="input-field pl-10"
                      placeholder="counsellor@bmsce.ac.in"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="input-field pl-10 pr-10"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-accent-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-accent-600 hover:text-accent-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-fade-in">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                Authorized personnel only
              </p>
              <p className="text-xs text-gray-400 mt-2">
                © 2025 {import.meta.env.VITE_APP_NAME || 'Atma-Chethana'} V1.0.0
              </p>
              <p className="text-xs text-gray-400 mt-1">
                DEVELOPED BY <span className="font-semibold text-accent-600">BMSCE</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
