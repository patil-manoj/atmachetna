import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { studentsAPI } from '../utils/api'
import { XMarkIcon, UserIcon, AcademicCapIcon, UsersIcon } from '@heroicons/react/24/outline'

function ProfileSetup({ onComplete, onClose }) {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    
    // Academic Info
    currentClass: '',
    school: '',
    board: '',
    subjects: [],
    interests: [],
    careerGoals: '',
    
    // Parent/Guardian Info
    parentName: '',
    relationship: '',
    parentPhone: '',
    parentEmail: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else if (name === 'subjects' || name === 'interests') {
      const values = value.split(',').map(v => v.trim()).filter(v => v)
      setFormData(prev => ({
        ...prev,
        [name]: values
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return formData.firstName && formData.lastName && formData.phone && 
               formData.dateOfBirth && formData.gender
      case 2:
        return formData.currentClass && formData.school
      case 3:
        return formData.parentName && formData.relationship && formData.parentPhone
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setError('')
      setStep(step + 1)
    } else {
      setError('Please fill in all required fields')
    }
  }

  const handlePrevious = () => {
    setStep(step - 1)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep(3)) {
      setError('Please fill in all required fields')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const profileData = {
        personalInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: user.email, // Keep existing email
          phone: formData.phone,
          dateOfBirth: new Date(formData.dateOfBirth),
          gender: formData.gender,
          address: formData.address
        },
        academicInfo: {
          currentClass: formData.currentClass,
          school: formData.school,
          board: formData.board || 'Other',
          subjects: formData.subjects,
          interests: formData.interests,
          careerGoals: formData.careerGoals
        },
        counselingInfo: {
          parentGuardianInfo: {
            name: formData.parentName,
            relationship: formData.relationship,
            phone: formData.parentPhone,
            email: formData.parentEmail
          }
        }
      }

      const response = await studentsAPI.updateProfile(profileData)
      
      if (response.data.success) {
        onComplete()
      }
    } catch (error) {
      console.error('Profile setup error:', error)
      setError(error.response?.data?.message || 'Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'English', 'Hindi', 'Social Studies', 'Economics', 'Accountancy',
    'Business Studies', 'Psychology', 'Political Science', 'History',
    'Geography', 'Art', 'Music', 'Physical Education'
  ]

  const interests = [
    'Technology', 'Science', 'Arts', 'Music', 'Sports', 'Reading',
    'Writing', 'Photography', 'Dance', 'Drama', 'Coding', 'Gaming',
    'Research', 'Medicine', 'Engineering', 'Teaching', 'Business',
    'Environment', 'Travel', 'Social Work'
  ]

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
              <UserIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Complete Your Profile</h2>
              <p className="text-sm text-gray-600">Help us get to know you better</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            {[
              { number: 1, title: 'Personal Info', icon: UserIcon },
              { number: 2, title: 'Academic Info', icon: AcademicCapIcon },
              { number: 3, title: 'Guardian Info', icon: UsersIcon }
            ].map((stepInfo, index) => (
              <div key={stepInfo.number} className="flex items-center">
                <div className={`flex items-center ${
                  step >= stepInfo.number ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                    step >= stepInfo.number 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-400 border-gray-300'
                  }`}>
                    {step > stepInfo.number ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      stepInfo.number
                    )}
                  </div>
                  <span className="ml-2 text-sm font-medium hidden sm:block">{stepInfo.title}</span>
                </div>
                {index < 2 && (
                  <div className={`w-8 sm:w-16 h-1 mx-2 ${
                    step > stepInfo.number ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.lastName}
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
                    name="phone"
                    required
                    pattern="[0-9]{10}"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="10-digit phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.gender}
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
                    name="address.street"
                    placeholder="Street Address"
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.address.street}
                    onChange={handleChange}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="address.city"
                      placeholder="City"
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.address.city}
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      name="address.state"
                      placeholder="State"
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.address.state}
                      onChange={handleChange}
                    />
                  </div>
                  <input
                    type="text"
                    name="address.pincode"
                    placeholder="Pincode"
                    pattern="[0-9]{6}"
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.address.pincode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Academic Information */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Current Class *
                  </label>
                  <input
                    type="text"
                    name="currentClass"
                    required
                    placeholder="e.g., 10th Grade, 12th Grade, 1st Year College"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.currentClass}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    School/Institution Name *
                  </label>
                  <input
                    type="text"
                    name="school"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.school}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Board
                  </label>
                  <select
                    name="board"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.board}
                    onChange={handleChange}
                  >
                    <option value="">Select Board</option>
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="State Board">State Board</option>
                    <option value="International">International</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Subjects (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="subjects"
                    placeholder="e.g., Mathematics, Physics, Chemistry"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.subjects.join(', ')}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">Common subjects: {subjects.slice(0, 5).join(', ')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Interests (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="interests"
                    placeholder="e.g., Technology, Science, Music"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.interests.join(', ')}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">Examples: {interests.slice(0, 5).join(', ')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Career Goals
                  </label>
                  <textarea
                    name="careerGoals"
                    rows="3"
                    placeholder="What do you want to become in the future?"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.careerGoals}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Parent/Guardian Information */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Parent/Guardian Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Parent/Guardian Name *
                  </label>
                  <input
                    type="text"
                    name="parentName"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.parentName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Relationship *
                  </label>
                  <select
                    name="relationship"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.relationship}
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
                    Parent/Guardian Phone *
                  </label>
                  <input
                    type="tel"
                    name="parentPhone"
                    required
                    pattern="[0-9]{10}"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="10-digit phone number"
                    value={formData.parentPhone}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Parent/Guardian Email
                  </label>
                  <input
                    type="email"
                    name="parentEmail"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.parentEmail}
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

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200 mt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Previous
                </button>
              ) : (
                <div></div>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-6 rounded-md transition-colors"
                >
                  {loading ? 'Saving...' : 'Complete Profile'}
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default ProfileSetup
