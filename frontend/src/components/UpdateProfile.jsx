import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { studentsAPI } from '../utils/api'

function UpdateProfile({ isOpen, onClose, onSuccess }) {
  const [studentData, setStudentData] = useState(null)
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: ''
      }
    },
    academicInfo: {
      currentClass: '',
      school: '',
      board: '',
      subjects: [],
      interests: [],
      careerGoals: ''
    },
    counselingInfo: {
      parentGuardianInfo: {
        name: '',
        relationship: '',
        phone: '',
        email: ''
      }
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('personal')

  useEffect(() => {
    if (isOpen) {
      fetchStudentData()
    }
  }, [isOpen])

  const fetchStudentData = async () => {
    try {
      const response = await studentsAPI.getMe()
      if (response.data.success) {
        const student = response.data.data.student
        setStudentData(student)
        
        // Populate form with existing data
        setFormData({
          personalInfo: {
            firstName: student.personalInfo?.firstName || '',
            lastName: student.personalInfo?.lastName || '',
            phone: student.personalInfo?.phone || '',
            dateOfBirth: student.personalInfo?.dateOfBirth ? 
              new Date(student.personalInfo.dateOfBirth).toISOString().split('T')[0] : '',
            gender: student.personalInfo?.gender || '',
            address: {
              street: student.personalInfo?.address?.street || '',
              city: student.personalInfo?.address?.city || '',
              state: student.personalInfo?.address?.state || '',
              pincode: student.personalInfo?.address?.pincode || ''
            }
          },
          academicInfo: {
            currentClass: student.academicInfo?.currentClass || '',
            school: student.academicInfo?.school || '',
            board: student.academicInfo?.board || '',
            subjects: student.academicInfo?.subjects || [],
            interests: student.academicInfo?.interests || [],
            careerGoals: student.academicInfo?.careerGoals || ''
          },
          counselingInfo: {
            parentGuardianInfo: {
              name: student.counselingInfo?.parentGuardianInfo?.name || '',
              relationship: student.counselingInfo?.parentGuardianInfo?.relationship || '',
              phone: student.counselingInfo?.parentGuardianInfo?.phone || '',
              email: student.counselingInfo?.parentGuardianInfo?.email || ''
            }
          }
        })
      }
    } catch (error) {
      console.error('Error fetching student data:', error)
      setError('Failed to load profile data')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const parts = name.split('.')
      setFormData(prev => {
        const newData = { ...prev }
        let current = newData
        
        for (let i = 0; i < parts.length - 1; i++) {
          current = current[parts[i]]
        }
        
        if (name === 'academicInfo.subjects' || name === 'academicInfo.interests') {
          current[parts[parts.length - 1]] = value.split(',').map(v => v.trim()).filter(v => v)
        } else {
          current[parts[parts.length - 1]] = value
        }
        
        return newData
      })
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await studentsAPI.updateProfile(formData)
      
      if (response.data.success) {
        onSuccess()
        onClose()
      }
    } catch (error) {
      console.error('Profile update error:', error)
      setError(error.response?.data?.message || 'Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'personal', name: 'Personal Info' },
    { id: 'academic', name: 'Academic Info' },
    { id: 'parent', name: 'Parent/Guardian' }
  ]

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Update Profile
              </h3>
              <p className="text-gray-600 mt-1">
                Keep your information up to date
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="personalInfo.firstName"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.personalInfo.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="personalInfo.lastName"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.personalInfo.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="personalInfo.phone"
                    required
                    pattern="[0-9]{10}"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.personalInfo.phone}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="personalInfo.dateOfBirth"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.personalInfo.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Gender *
                  </label>
                  <select
                    name="personalInfo.gender"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.personalInfo.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Address</h4>
                  <input
                    type="text"
                    name="personalInfo.address.street"
                    placeholder="Street Address"
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.personalInfo.address.street}
                    onChange={handleChange}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="personalInfo.address.city"
                      placeholder="City"
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.personalInfo.address.city}
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      name="personalInfo.address.state"
                      placeholder="State"
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.personalInfo.address.state}
                      onChange={handleChange}
                    />
                  </div>
                  <input
                    type="text"
                    name="personalInfo.address.pincode"
                    placeholder="Pincode"
                    pattern="[0-9]{6}"
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.personalInfo.address.pincode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* Academic Information Tab */}
            {activeTab === 'academic' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Current Year *
                  </label>
                  <select
                    name="academicInfo.currentClass"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.academicInfo.currentClass}
                    onChange={handleChange}
                  >
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Engineering Branch *
                  </label>
                  <select
                    name="academicInfo.school"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.academicInfo.school}
                    onChange={handleChange}
                  >
                    <option value="">Select Branch</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                    <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                    <option value="Industrial Engineering & Management">Industrial Engineering & Management</option>
                    <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                    <option value="Bio Technology">Bio Technology</option>
                    <option value="Chemical Engineering">Chemical Engineering</option>
                    <option value="Artificial Intelligence and Machine Learning">Artificial Intelligence and Machine Learning</option>
                    <option value="Computer Science and Engineering (Data Science)">Computer Science and Engineering (Data Science)</option>
                    <option value="Computer Science and Engineering (IoT & Cyber Security)">Computer Science and Engineering (IoT & Cyber Security)</option>
                    <option value="Artificial Intelligence (AI) and Data Science">Artificial Intelligence (AI) and Data Science</option>
                    <option value="Computer Science and Business Systems">Computer Science and Business Systems</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Subjects (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="academicInfo.subjects"
                    placeholder="e.g., Mathematics, Physics, Programming, Data Structures"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.academicInfo.subjects.join(', ')}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Interests (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="academicInfo.interests"
                    placeholder="e.g., Programming, Machine Learning, Robotics, Innovation"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.academicInfo.interests.join(', ')}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Career Goals
                  </label>
                  <textarea
                    name="academicInfo.careerGoals"
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.academicInfo.careerGoals}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* Parent/Guardian Information Tab */}
            {activeTab === 'parent' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Parent/Guardian Name *
                  </label>
                  <input
                    type="text"
                    name="counselingInfo.parentGuardianInfo.name"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.counselingInfo.parentGuardianInfo.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Relationship *
                  </label>
                  <select
                    name="counselingInfo.parentGuardianInfo.relationship"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.counselingInfo.parentGuardianInfo.relationship}
                    onChange={handleChange}
                  >
                    <option value="">Select Relationship</option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="counselingInfo.parentGuardianInfo.phone"
                    required
                    pattern="[0-9]{10}"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.counselingInfo.parentGuardianInfo.phone}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="counselingInfo.parentGuardianInfo.email"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.counselingInfo.parentGuardianInfo.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex space-x-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UpdateProfile
