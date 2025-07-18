import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student reference is required']
  },
  counsellor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false // Allow null initially, will be assigned by admin
  },
  appointmentDetails: {
    requestedDate: {
      type: Date,
      required: [true, 'Requested appointment date is required']
    },
    requestedTime: {
      type: String,
      required: [true, 'Requested appointment time is required']
    },
    confirmedDate: Date,
    confirmedTime: String,
    duration: {
      type: Number,
      default: 60, // minutes
      min: [30, 'Appointment duration must be at least 30 minutes'],
      max: [180, 'Appointment duration cannot exceed 180 minutes']
    },
    type: {
      type: String,
      required: [true, 'Appointment type is required'],
      enum: [
        'Academic Counseling',
        'Career Guidance',
        'Personal Counseling',
        'Stress Management',
        'Study Skills',
        'College Preparation',
        'Behavioral Issues',
        'Follow-up Session',
        'Other'
      ]
    },
    mode: {
      type: String,
      required: [true, 'Appointment mode is required'],
      enum: ['In-Person', 'Video Call', 'Phone Call'],
      default: 'In-Person'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    }
  },
  reason: {
    type: String,
    required: [true, 'Reason for appointment is required'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  studentConcerns: {
    type: String,
    maxlength: [1000, 'Student concerns cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: [
      'Pending',      // Initial state when appointment is requested
      'Confirmed',    // Counsellor has confirmed the appointment
      'In-Progress',  // Appointment is currently happening
      'Completed',    // Appointment finished successfully
      'Cancelled',    // Cancelled by student or counsellor
      'No-Show',      // Student didn't show up
      'Rescheduled'   // Appointment was rescheduled
    ],
    default: 'Pending'
  },
  sessionNotes: {
    preSessionNotes: String,
    sessionSummary: String,
    actionItems: [String],
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDate: Date,
    recommendations: String,
    nextSteps: String
  },
  communication: {
    emailSent: {
      type: Boolean,
      default: false
    },
    emailSentDate: Date,
    reminderSent: {
      type: Boolean,
      default: false
    },
    reminderSentDate: Date,
    confirmationSent: {
      type: Boolean,
      default: false
    },
    confirmationSentDate: Date
  },
  feedback: {
    studentRating: {
      type: Number,
      min: 1,
      max: 5
    },
    studentComments: String,
    counsellorRating: {
      type: Number,
      min: 1,
      max: 5
    },
    counsellorComments: String
  },
  metadata: {
    requestedBy: {
      type: String,
      enum: ['Student', 'Parent', 'Teacher', 'Counsellor'],
      default: 'Student'
    },
    urgencyLevel: {
      type: String,
      enum: ['Normal', 'Urgent', 'Emergency'],
      default: 'Normal'
    },
    relatedAppointments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    }],
    tags: [String],
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringPattern: {
      frequency: String, // 'Weekly', 'Bi-weekly', 'Monthly'
      endDate: Date,
      remainingSessions: Number
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
appointmentSchema.index({ student: 1 });
appointmentSchema.index({ counsellor: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ 'appointmentDetails.requestedDate': 1 });
appointmentSchema.index({ 'appointmentDetails.confirmedDate': 1 });
appointmentSchema.index({ 'appointmentDetails.type': 1 });
appointmentSchema.index({ createdAt: -1 });

// Compound indexes
appointmentSchema.index({ student: 1, status: 1 });
appointmentSchema.index({ counsellor: 1, status: 1 });
appointmentSchema.index({ status: 1, 'appointmentDetails.confirmedDate': 1 });

// Virtual for appointment date/time display
appointmentSchema.virtual('displayDateTime').get(function() {
  const date = this.appointmentDetails.confirmedDate || this.appointmentDetails.requestedDate;
  const time = this.appointmentDetails.confirmedTime || this.appointmentDetails.requestedTime;
  
  if (!date || !time) return null;
  
  return {
    date: date.toLocaleDateString('en-IN'),
    time: time,
    fullDateTime: `${date.toLocaleDateString('en-IN')} at ${time}`
  };
});

// Virtual for duration display
appointmentSchema.virtual('durationDisplay').get(function() {
  const duration = this.appointmentDetails.duration;
  if (duration < 60) {
    return `${duration} minutes`;
  } else {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
});

// Method to confirm appointment
appointmentSchema.methods.confirm = function(confirmedDate, confirmedTime) {
  this.appointmentDetails.confirmedDate = confirmedDate;
  this.appointmentDetails.confirmedTime = confirmedTime;
  this.status = 'Confirmed';
  this.communication.confirmationSent = true;
  this.communication.confirmationSentDate = new Date();
  return this.save();
};

// Method to complete appointment
appointmentSchema.methods.complete = function(sessionData = {}) {
  this.status = 'Completed';
  
  // Update session notes if provided
  if (sessionData.sessionSummary) {
    this.sessionNotes.sessionSummary = sessionData.sessionSummary;
  }
  if (sessionData.actionItems) {
    this.sessionNotes.actionItems = sessionData.actionItems;
  }
  if (sessionData.recommendations) {
    this.sessionNotes.recommendations = sessionData.recommendations;
  }
  if (sessionData.followUpRequired !== undefined) {
    this.sessionNotes.followUpRequired = sessionData.followUpRequired;
  }
  if (sessionData.followUpDate) {
    this.sessionNotes.followUpDate = sessionData.followUpDate;
  }
  
  return this.save();
};

// Method to cancel appointment
appointmentSchema.methods.cancel = function(reason) {
  this.status = 'Cancelled';
  this.sessionNotes.preSessionNotes = reason || 'Appointment cancelled';
  return this.save();
};

// Method to reschedule appointment
appointmentSchema.methods.reschedule = function(newDate, newTime) {
  this.appointmentDetails.requestedDate = newDate;
  this.appointmentDetails.requestedTime = newTime;
  this.appointmentDetails.confirmedDate = undefined;
  this.appointmentDetails.confirmedTime = undefined;
  this.status = 'Rescheduled';
  return this.save();
};

// Static method to get pending appointments
appointmentSchema.statics.getPendingAppointments = function() {
  return this.find({ status: 'Pending' })
    .populate('student', 'personalInfo.firstName personalInfo.lastName personalInfo.email personalInfo.phone')
    .populate('counsellor', 'name email')
    .sort({ 'appointmentDetails.requestedDate': 1 });
};

// Static method to get today's appointments
appointmentSchema.statics.getTodaysAppointments = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    'appointmentDetails.confirmedDate': {
      $gte: today,
      $lt: tomorrow
    },
    status: { $in: ['Confirmed', 'In-Progress'] }
  })
    .populate('student', 'personalInfo.firstName personalInfo.lastName personalInfo.email personalInfo.phone')
    .populate('counsellor', 'name email')
    .sort({ 'appointmentDetails.confirmedTime': 1 });
};

// Static method to get upcoming appointments
appointmentSchema.statics.getUpcomingAppointments = function(days = 7) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    'appointmentDetails.confirmedDate': {
      $gte: today,
      $lte: futureDate
    },
    status: { $in: ['Confirmed'] }
  })
    .populate('student', 'personalInfo.firstName personalInfo.lastName personalInfo.email personalInfo.phone')
    .populate('counsellor', 'name email')
    .sort({ 'appointmentDetails.confirmedDate': 1, 'appointmentDetails.confirmedTime': 1 });
};

// Ensure virtual fields are serialized
appointmentSchema.set('toJSON', { virtuals: true });
appointmentSchema.set('toObject', { virtuals: true });

export default mongoose.model('Appointment', appointmentSchema);
