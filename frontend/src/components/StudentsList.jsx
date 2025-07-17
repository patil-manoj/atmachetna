import { useState, useEffect } from 'react'
import { 
  MagnifyingGlassIcon, 
  EnvelopeIcon,
  PhoneIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

function StudentsList() {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    filterAndSortStudents()
  }, [students, searchTerm, sortBy])

  const fetchStudents = async () => {
    try {
      // Mock data - replace with actual API call
      const mockStudents = [
        {
          id: 1,
          name: 'Rajesh Kumar',
          email: 'rajesh.kumar@example.com',
          phone: '+91 98765 43210',
          course: 'Computer Science',
          year: '3rd Year',
          lastAppointment: '2024-01-15',
          status: 'Active',
          appointmentCount: 5
        },
        {
          id: 2,
          name: 'Priya Sharma',
          email: 'priya.sharma@example.com',
          phone: '+91 87654 32109',
          course: 'Psychology',
          year: '2nd Year',
          lastAppointment: '2024-01-10',
          status: 'Active',
          appointmentCount: 3
        },
        {
          id: 3,
          name: 'Amit Patel',
          email: 'amit.patel@example.com',
          phone: '+91 76543 21098',
          course: 'Engineering',
          year: '4th Year',
          lastAppointment: '2024-01-08',
          status: 'Inactive',
          appointmentCount: 8
        },
        {
          id: 4,
          name: 'Sneha Reddy',
          email: 'sneha.reddy@example.com',
          phone: '+91 65432 10987',
          course: 'Medicine',
          year: '1st Year',
          lastAppointment: '2024-01-12',
          status: 'Active',
          appointmentCount: 2
        }
      ]
      
      setStudents(mockStudents)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching students:', error)
      setLoading(false)
    }
  }

  const filterAndSortStudents = () => {
    let filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase())
    )

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'course':
          return a.course.localeCompare(b.course)
        case 'lastAppointment':
          return new Date(b.lastAppointment) - new Date(a.lastAppointment)
        case 'appointmentCount':
          return b.appointmentCount - a.appointmentCount
        default:
          return 0
      }
    })

    setFilteredStudents(filtered)
  }

  const handleSendEmail = (student) => {
    // This would open email modal or redirect to email functionality
    console.log('Send email to:', student.email)
  }

  const handleViewProfile = (student) => {
    // This would open student profile modal
    console.log('View profile:', student)
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
            placeholder="Search students..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field w-auto"
          >
            <option value="name">Sort by Name</option>
            <option value="course">Sort by Course</option>
            <option value="lastAppointment">Sort by Last Appointment</option>
            <option value="appointmentCount">Sort by Appointment Count</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course & Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Appointment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    <div className="text-sm text-gray-500">{student.appointmentCount} appointments</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{student.course}</div>
                  <div className="text-sm text-gray-500">{student.year}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{student.email}</div>
                  <div className="text-sm text-gray-500">{student.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(student.lastAppointment).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    student.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewProfile(student)}
                      className="text-primary-600 hover:text-primary-900"
                      title="View Profile"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleSendEmail(student)}
                      className="text-green-600 hover:text-green-900"
                      title="Send Email"
                    >
                      <EnvelopeIcon className="h-4 w-4" />
                    </button>
                    <a
                      href={`tel:${student.phone}`}
                      className="text-blue-600 hover:text-blue-900"
                      title="Call"
                    >
                      <PhoneIcon className="h-4 w-4" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No students found matching your search.</p>
        </div>
      )}
    </div>
  )
}

export default StudentsList
