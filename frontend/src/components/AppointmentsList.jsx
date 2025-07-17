import { useState, useEffect } from 'react'
import { 
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
  EnvelopeIcon,
  ClockIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'

function AppointmentsList() {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, searchTerm, statusFilter])

  const fetchAppointments = async () => {
    try {
      // Mock data - replace with actual API call
      const mockAppointments = [
        {
          id: 1,
          studentName: 'Rajesh Kumar',
          studentEmail: 'rajesh.kumar@example.com',
          date: '2024-01-20',
          time: '10:00 AM',
          status: 'pending',
          type: 'Academic Counseling',
          notes: 'Career guidance discussion',
          bookedOn: '2024-01-15'
        },
        {
          id: 2,
          studentName: 'Priya Sharma',
          studentEmail: 'priya.sharma@example.com',
          date: '2024-01-18',
          time: '2:00 PM',
          status: 'confirmed',
          type: 'Personal Counseling',
          notes: 'Stress management session',
          bookedOn: '2024-01-12'
        },
        {
          id: 3,
          studentName: 'Amit Patel',
          studentEmail: 'amit.patel@example.com',
          date: '2024-01-16',
          time: '11:30 AM',
          status: 'completed',
          type: 'Career Guidance',
          notes: 'Job interview preparation',
          bookedOn: '2024-01-10',
          remarks: 'Student showed good progress in communication skills'
        },
        {
          id: 4,
          studentName: 'Sneha Reddy',
          studentEmail: 'sneha.reddy@example.com',
          date: '2024-01-22',
          time: '3:30 PM',
          status: 'pending',
          type: 'Academic Support',
          notes: 'Study planning assistance',
          bookedOn: '2024-01-16'
        }
      ]
      
      setAppointments(mockAppointments)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = appointments.filter(appointment => {
      const matchesSearch = 
        appointment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.notes.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter
      
      return matchesSearch && matchesStatus
    })

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`)
      const dateB = new Date(`${b.date} ${b.time}`)
      return dateA - dateB
    })

    setFilteredAppointments(filtered)
  }

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      // API call to confirm appointment
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'confirmed' }
            : apt
        )
      )
      // Send confirmation email
      console.log('Appointment confirmed and email sent')
    } catch (error) {
      console.error('Error confirming appointment:', error)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    try {
      // API call to cancel appointment
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'cancelled' }
            : apt
        )
      )
      console.log('Appointment cancelled')
    } catch (error) {
      console.error('Error cancelling appointment:', error)
    }
  }

  const handleSendEmail = (appointment) => {
    // This would open email modal or send email
    console.log('Send email to:', appointment.studentEmail)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="card">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search appointments..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAppointments.map((appointment) => (
          <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{appointment.studentName}</h3>
                <p className="text-sm text-gray-600">{appointment.studentEmail}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <CalendarDaysIcon className="h-4 w-4 mr-2" />
                {new Date(appointment.date).toLocaleDateString('en-IN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <ClockIcon className="h-4 w-4 mr-2" />
                {appointment.time}
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">Type:</span> {appointment.type}
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">Notes:</span> {appointment.notes}
              </div>
              {appointment.remarks && (
                <div className="text-sm bg-green-50 p-2 rounded">
                  <span className="font-medium text-green-700">Remarks:</span> {appointment.remarks}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              {appointment.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleConfirmAppointment(appointment.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded-md transition-colors flex items-center justify-center"
                  >
                    <CheckIcon className="h-4 w-4 mr-1" />
                    Confirm
                  </button>
                  <button
                    onClick={() => handleCancelAppointment(appointment.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-md transition-colors flex items-center justify-center"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                </>
              )}
              
              <button
                onClick={() => handleSendEmail(appointment)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-md transition-colors flex items-center justify-center"
                title="Send Email"
              >
                <EnvelopeIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2 text-xs text-gray-500">
              Booked on: {new Date(appointment.bookedOn).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No appointments found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

export default AppointmentsList
