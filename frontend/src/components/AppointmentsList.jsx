import { useState, useEffect } from 'react'
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { appointmentsAPI } from '../utils/api'

function AppointmentsList() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await appointmentsAPI.getAll()
      
      if (response.data.success) {
        setAppointments(response.data.data.appointments || [])
      } else {
        setError('Failed to load appointments')
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setError('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const response = await appointmentsAPI.updateStatus(appointmentId, newStatus)
      if (response.data.success) {
        setAppointments(prev => 
          prev.map(apt => 
            apt._id === appointmentId 
              ? { ...apt, status: newStatus }
              : apt
          )
        )
      }
    } catch (error) {
      console.error('Error updating appointment status:', error)
      setError('Failed to update appointment status')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
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

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'low':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const filteredAppointments = (appointments || []).filter(appointment => {
    const matchesSearch = 
      appointment.student?.personalInfo?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.student?.personalInfo?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.student?.personalInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.appointmentDetails?.type?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h3 className="text-lg font-medium text-gray-900">Appointments</h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <input
              type="text"
              placeholder="Search appointments..."
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={fetchAppointments}
                    className="bg-red-100 px-2 py-1 rounded text-sm text-red-800 hover:bg-red-200 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {filteredAppointments.length === 0 ? (
          <div className="text-center py-8">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'No appointments match your current filters.' 
                : 'Get started by scheduling your first appointment.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {appointment.student?.personalInfo?.firstName} {appointment.student?.personalInfo?.lastName}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.status)}`}>
                        {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
                      </span>
                      {appointment.counsellingInfo?.priority && (
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(appointment.counsellingInfo.priority)}`}>
                          {appointment.counsellingInfo.priority} Priority
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(appointment.appointmentDetails?.requestedDate)}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {appointment.appointmentDetails?.requestedTime}
                      </div>
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {appointment.counsellor?.name || 'Unassigned'}
                      </div>
                      <div className="flex items-center">
                        <PencilIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {appointment.appointmentDetails?.type || 'General Counseling'}
                      </div>
                    </div>

                    {appointment.appointmentDetails?.reason && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          <strong>Reason:</strong> {appointment.appointmentDetails.reason}
                        </p>
                      </div>
                    )}

                    <div className="mt-2 text-xs text-gray-500">
                      Mode: {appointment.appointmentDetails?.mode || 'In-person'} • 
                      Email: {appointment.student?.personalInfo?.email}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1 ml-4">
                    {appointment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                          className="flex items-center px-2 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors"
                        >
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Confirm
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                          className="flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors"
                        >
                          <XCircleIcon className="h-3 w-3 mr-1" />
                          Cancel
                        </button>
                      </>
                    )}
                    {appointment.status === 'confirmed' && (
                      <button
                        onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                        className="flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                      >
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AppointmentsList
