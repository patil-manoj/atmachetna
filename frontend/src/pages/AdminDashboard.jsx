import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import StudentsList from '../components/StudentsList'
import AppointmentsList from '../components/AppointmentsList'
import StatsCards from '../components/StatsCards'
import { Tabs, Tab } from '../components/Tabs'
import { statsAPI } from '../utils/api'

function AdminDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    todaysAppointments: 0,
    highPriorityStudents: 0,
    recentAppointments: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await statsAPI.getDashboard()
      
      if (response.data.success) {
        setStats(response.data.data.overview)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      setError('Failed to load dashboard statistics')
      // Set fallback data to prevent crashes
      setStats({
        totalStudents: 0,
        activeStudents: 0,
        pendingAppointments: 0,
        confirmedAppointments: 0,
        completedAppointments: 0,
        todaysAppointments: 0,
        highPriorityStudents: 0,
        recentAppointments: 0
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'admin' ? 'Admin Dashboard' : 'Counsellor Dashboard'}
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name || 'Admin'}. Here's your overview for today.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={fetchDashboardStats}
                    className="bg-red-100 px-2 py-1 rounded text-sm text-red-800 hover:bg-red-200 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <StatsCards stats={stats} />

        <div className="mt-8">
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tab value="overview" label="Overview" />
            <Tab value="students" label="Students" />
            <Tab value="appointments" label="Appointments" />
            {user?.role === 'admin' && (
              <Tab value="analytics" label="Analytics" />
            )}
          </Tabs>

          <div className="mt-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Today's Appointments</span>
                      <span className="text-lg font-semibold text-blue-600">{stats.todaysAppointments}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Pending Appointments</span>
                      <span className="text-lg font-semibold text-yellow-600">{stats.pendingAppointments}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">High Priority Students</span>
                      <span className="text-lg font-semibold text-red-600">{stats.highPriorityStudents}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Total Students</span>
                      <span className="text-lg font-semibold text-gray-900">{stats.totalStudents}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Active Students</span>
                      <span className="text-lg font-semibold text-green-600">{stats.activeStudents}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">Completed Sessions</span>
                      <span className="text-lg font-semibold text-blue-600">{stats.completedAppointments}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'students' && <StudentsList />}
            {activeTab === 'appointments' && <AppointmentsList />}
            {activeTab === 'analytics' && user?.role === 'admin' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics</h3>
                <p className="text-gray-600">Advanced analytics and reporting features coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
