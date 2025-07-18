import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  CheckCircleIcon,
  UserIcon,
  BookOpenIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { appointmentsAPI, studentsAPI, statsAPI } from '../utils/api'
import ProfileSetup from '../components/ProfileSetup'
import RequestAppointment from '../components/RequestAppointment'
import Resources from '../components/Resources'
import UpdateProfile from '../components/UpdateProfile'

function StudentDashboard() {
  const { user, logout } = useAuth()
  const [studentData, setStudentData] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    upcomingAppointments: 0,
    lastAppointment: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [showRequestAppointment, setShowRequestAppointment] = useState(false)
  const [showResources, setShowResources] = useState(false)
  const [showUpdateProfile, setShowUpdateProfile] = useState(false)

  useEffect(() => {
    fetchStudentData()
    fetchAppointments()
    fetchStats()
  }, [])

  // Check if profile setup is needed after student data is loaded
  useEffect(() => {
    if (studentData) {
      const needsProfileSetup = (
        !studentData.personalInfo?.phone || 
        studentData.personalInfo?.phone === '0000000000' ||
        !studentData.personalInfo?.dateOfBirth ||
        studentData.personalInfo?.dateOfBirth === '2000-01-01T00:00:00.000Z' ||
        !studentData.academicInfo?.currentClass ||
        studentData.academicInfo?.currentClass === 'Not specified' ||
        !studentData.academicInfo?.school ||
        studentData.academicInfo?.school === 'Not specified'
      )
      
      if (needsProfileSetup) {
        setShowProfileSetup(true)
      }
    }
  }, [studentData])

  const fetchStudentData = async () => {
    try {
      const response = await studentsAPI.getMe()
      if (response.data.success) {
        setStudentData(response.data.data.student)
      }
    } catch (error) {
      console.error('Error fetching student data:', error)
      setError('Failed to load student information')
    }
  }

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await appointmentsAPI.getAll()
      
      if (response.data.success) {
        const appointmentsData = response.data.data.appointments || []
        setAppointments(appointmentsData)
        
        // Calculate stats from fetched appointments
        const completed = appointmentsData.filter(apt => apt.status === 'Completed').length
        const upcoming = appointmentsData.filter(apt => 
          apt.status === 'Confirmed' && new Date(apt.appointmentDetails.requestedDate) > new Date()
        ).length
        
        setStats({
          totalAppointments: appointmentsData.length,
          completedAppointments: completed,
          upcomingAppointments: upcoming,
          lastAppointment: appointmentsData
            .filter(apt => apt.status === 'Completed')
            .sort((a, b) => new Date(b.appointmentDetails.requestedDate) - new Date(a.appointmentDetails.requestedDate))[0]
        })
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setError('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await statsAPI.getDashboard()
      if (response.data.success) {
        setStats(response.data.data.overview)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Don't set error here as it's not critical
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'completed':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  // Event handlers for quick actions
  const handleRequestAppointment = () => {
    setShowRequestAppointment(true)
  }

  const handleViewResources = () => {
    setShowResources(true)
  }

  const handleUpdateProfile = () => {
    setShowUpdateProfile(true)
  }

  const handleProfileSetupComplete = (updatedData) => {
    setStudentData(updatedData)
    setShowProfileSetup(false)
    // Refresh data after profile update
    fetchStudentData()
  }

  const handleAppointmentSuccess = () => {
    setShowRequestAppointment(false)
    // Refresh appointments after successful request
    fetchAppointments()
  }

  const handleProfileUpdateSuccess = (updatedData) => {
    setStudentData(updatedData)
    setShowUpdateProfile(false)
    // Refresh data after profile update
    fetchStudentData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img 
                  className="h-8 w-8" 
                  src="/images/logo.png" 
                  alt="Atma Chethana"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'block'
                  }}
                />
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{display: 'none'}}>
                  AC
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">Student Portal</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {studentData?.personalInfo?.firstName || user?.name}</span>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {studentData?.personalInfo?.firstName || user?.name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your personal dashboard with your counseling journey.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-50">
                <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-50">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completedAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-50">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.upcomingAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-50">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-2xl font-semibold text-gray-900">Good</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Your Appointments</h3>
            </div>
            <div className="p-6">
              {appointments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No appointments scheduled</p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {appointment.appointmentDetails.type}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.status)}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="flex items-center">
                          <CalendarDaysIcon className="h-4 w-4 mr-2" />
                          {formatDate(appointment.appointmentDetails.requestedDate)}
                        </p>
                        <p className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          {appointment.appointmentDetails.requestedTime}
                        </p>
                        <p className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-2" />
                          {appointment.counsellor?.name || 'Counsellor'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Mode: {appointment.appointmentDetails.mode}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Student Info & Quick Actions */}
          <div className="space-y-6">
            {/* Student Profile */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Your Profile</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-gray-900">
                    {studentData?.personalInfo?.firstName} {studentData?.personalInfo?.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{studentData?.personalInfo?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Class</label>
                  <p className="text-gray-900">{studentData?.academicInfo?.currentClass}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Institution</label>
                  <p className="text-gray-900">{studentData?.academicInfo?.school}</p>
                </div>
                {studentData?.usn && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">USN</label>
                    <p className="text-gray-900">{studentData.usn}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <button 
                  onClick={handleRequestAppointment}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <CalendarDaysIcon className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium">Request New Appointment</span>
                  </div>
                </button>
                <button 
                  onClick={handleViewResources}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <BookOpenIcon className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium">View Resources</span>
                  </div>
                </button>
                <button 
                  onClick={handleUpdateProfile}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-sm font-medium">Update Profile</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Modal Components */}
      {showProfileSetup && (
        <ProfileSetup 
          onClose={() => setShowProfileSetup(false)}
          onComplete={handleProfileSetupComplete}
          student={studentData}
        />
      )}
      
      {showRequestAppointment && (
        <RequestAppointment 
          isOpen={showRequestAppointment}
          onClose={() => setShowRequestAppointment(false)}
          onSuccess={handleAppointmentSuccess}
          student={studentData}
        />
      )}
      
      {showResources && (
        <Resources 
          isOpen={showResources}
          onClose={() => setShowResources(false)}
        />
      )}
      
      {showUpdateProfile && (
        <UpdateProfile 
          isOpen={showUpdateProfile}
          onClose={() => setShowUpdateProfile(false)}
          onSuccess={handleProfileUpdateSuccess}
          student={studentData}
        />
      )}
    </div>
  )
}

export default StudentDashboard
