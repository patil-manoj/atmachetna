import { useState, useEffect } from 'react'
import { 
  MagnifyingGlassIcon, 
  EnvelopeIcon,
  PhoneIcon,
  EyeIcon,
  PencilIcon,
  UserIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import { studentsAPI, emailAPI } from '../utils/api'

function StudentsList() {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    filterAndSortStudents()
  }, [students, searchTerm, sortBy])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await studentsAPI.getAll()
      
      if (response.data.success) {
        setStudents(response.data.data.students || [])
      } else {
        setError('Failed to fetch students')
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      setError('Failed to load students. Please try again.')
      // Set empty array to prevent crashes
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortStudents = () => {
    let filtered = students.filter(student => {
      const personalInfo = student.personalInfo || {}
      const academicInfo = student.academicInfo || {}
      
      const matchesSearch = 
        (personalInfo.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (personalInfo.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (personalInfo.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (personalInfo.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (academicInfo.currentClass || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (academicInfo.school || '').toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesSearch
    })

    // Sort students
    filtered.sort((a, b) => {
      const aPersonal = a.personalInfo || {}
      const bPersonal = b.personalInfo || {}
      const aAcademic = a.academicInfo || {}
      const bAcademic = b.academicInfo || {}
      
      switch (sortBy) {
        case 'name':
          const aName = `${aPersonal.firstName || ''} ${aPersonal.lastName || ''}`.trim()
          const bName = `${bPersonal.firstName || ''} ${bPersonal.lastName || ''}`.trim()
          return aName.localeCompare(bName)
        case 'email':
          return (aPersonal.email || '').localeCompare(bPersonal.email || '')
        case 'class':
          return (aAcademic.currentClass || '').localeCompare(bAcademic.currentClass || '')
        case 'date':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        default:
          return 0
      }
    })

    setFilteredStudents(filtered)
  }

  const handleSendEmail = async (student) => {
    try {
      setActionLoading(prev => ({ ...prev, [student._id]: 'emailing' }))
      
      const response = await emailAPI.sendFollowUp({
        studentId: student._id,
        subject: 'Follow-up from Counselling Session',
        message: `Dear ${student.personalInfo?.firstName}, we hope you are doing well. Please feel free to reach out if you need any assistance.`
      })
      
      if (response.data.success) {
        alert('Email sent successfully!')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Failed to send email. Please try again.')
    } finally {
      setActionLoading(prev => ({ ...prev, [student._id]: null }))
    }
  }

  const handleViewProfile = (student) => {
    // TODO: Implement view profile functionality
    console.log('View profile for:', student)
    alert('View profile functionality will be implemented soon.')
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'inactive':
        return 'text-red-700 bg-red-50 border-red-200'
      case 'graduated':
        return 'text-blue-700 bg-blue-50 border-blue-200'
      case 'transferred':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-medium text-gray-900 mb-4 sm:mb-0">
            Students Management
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search students..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
              <option value="class">Sort by Class</option>
              <option value="date">Sort by Registration Date</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={fetchStudents}
                    className="bg-red-100 px-2 py-1 rounded text-sm text-red-800 hover:bg-red-200 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No students</h3>
            <p className="mt-1 text-sm text-gray-500">
              {students.length === 0 
                ? "No students have been registered yet." 
                : "No students match your search criteria."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStudents.map((student) => {
              const personalInfo = student.personalInfo || {}
              const academicInfo = student.academicInfo || {}
              const counselingInfo = student.counselingInfo || {}
              const isLoading = actionLoading[student._id]
              
              return (
                <div
                  key={student._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserIcon className="h-7 w-7 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-medium text-gray-900">
                              {`${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim() || 'Unknown Student'}
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}>
                              {student.status?.charAt(0).toUpperCase() + student.status?.slice(1) || 'Unknown'}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <EnvelopeIcon className="h-4 w-4 mr-1" />
                            <span>{personalInfo.email || 'No email'}</span>
                            {personalInfo.phone && (
                              <>
                                <span className="mx-2">•</span>
                                <PhoneIcon className="h-4 w-4 mr-1" />
                                <span>{personalInfo.phone}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <AcademicCapIcon className="h-4 w-4 mr-2" />
                          <span>{academicInfo.currentClass || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          <span>{academicInfo.school || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          <span>Sessions: {counselingInfo.totalAppointments || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                          <span>Registered: {formatDate(student.createdAt)}</span>
                        </div>
                      </div>

                      {counselingInfo.lastAppointmentDate && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Last session:</span> {formatDate(counselingInfo.lastAppointmentDate)}
                        </div>
                      )}

                      {counselingInfo.riskLevel && counselingInfo.riskLevel !== 'Low' && (
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            counselingInfo.riskLevel === 'High' 
                              ? 'text-red-700 bg-red-100' 
                              : 'text-yellow-700 bg-yellow-100'
                          }`}>
                            Risk Level: {counselingInfo.riskLevel}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 lg:mt-0 lg:ml-4 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleViewProfile(student)}
                        className="btn-secondary text-sm px-3 py-1.5"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </button>

                      <button
                        onClick={() => handleSendEmail(student)}
                        disabled={isLoading === 'emailing'}
                        className="btn-primary text-sm px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading === 'emailing' ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                            Sending...
                          </div>
                        ) : (
                          <>
                            <EnvelopeIcon className="h-4 w-4 mr-1" />
                            Email
                          </>
                        )}
                      </button>

                      <button
                        className="btn-secondary text-sm px-3 py-1.5"
                        onClick={() => alert('Edit functionality will be implemented soon.')}
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentsList
