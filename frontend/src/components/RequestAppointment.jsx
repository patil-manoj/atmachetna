import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { appointmentsAPI } from '../utils/api'

function RequestAppointment({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    type: '',
    requestedDate: '',
    requestedTime: '',
    mode: 'In-person',
    reason: '',
    urgency: 'Medium'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const appointmentData = {
        appointmentDetails: {
          type: formData.type,
          requestedDate: formData.requestedDate,
          requestedTime: formData.requestedTime,
          mode: formData.mode,
          reason: formData.reason,
          urgency: formData.urgency
        }
      }

      const response = await appointmentsAPI.create(appointmentData)
      
      if (response.data.success) {
        onSuccess()
        onClose()
        // Reset form
        setFormData({
          type: '',
          requestedDate: '',
          requestedTime: '',
          mode: 'In-person',
          reason: '',
          urgency: 'Medium'
        })
      }
    } catch (error) {
      console.error('Request appointment error:', error)
      setError(error.response?.data?.message || 'Failed to request appointment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Request New Appointment
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type of Counseling *
              </label>
              <select
                name="type"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="">Select Type</option>
                <option value="Academic">Academic Counseling</option>
                <option value="Career">Career Guidance</option>
                <option value="Personal">Personal Counseling</option>
                <option value="Psychological">Psychological Support</option>
                <option value="Crisis">Crisis Intervention</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  name="requestedDate"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.requestedDate}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Preferred Time *
                </label>
                <select
                  name="requestedTime"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.requestedTime}
                  onChange={handleChange}
                >
                  <option value="">Select Time</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mode *
              </label>
              <select
                name="mode"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.mode}
                onChange={handleChange}
              >
                <option value="In-person">In-person</option>
                <option value="Online">Online</option>
                <option value="Phone">Phone</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Urgency Level
              </label>
              <select
                name="urgency"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.urgency}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Reason for Appointment *
              </label>
              <textarea
                name="reason"
                required
                rows="3"
                placeholder="Please describe what you'd like to discuss..."
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.reason}
                onChange={handleChange}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
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
                {loading ? 'Requesting...' : 'Request Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RequestAppointment
