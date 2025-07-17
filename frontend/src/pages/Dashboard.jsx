import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import StudentsList from '../components/StudentsList'
import AppointmentsList from '../components/AppointmentsList'
import StatsCards from '../components/StatsCards'
import { Tabs, Tab } from '../components/Tabs'

function Dashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('students')
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    todayAppointments: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // This would be replaced with actual API call
      setStats({
        totalStudents: 156,
        pendingAppointments: 8,
        completedAppointments: 234,
        todayAppointments: 3
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name || 'Counsellor'}
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your students today.
          </p>
        </div>

        <StatsCards stats={stats} />

        <div className="mt-8">
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tab value="students" label="Students" />
            <Tab value="appointments" label="Appointments" />
          </Tabs>

          <div className="mt-6">
            {activeTab === 'students' && <StudentsList />}
            {activeTab === 'appointments' && <AppointmentsList />}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
