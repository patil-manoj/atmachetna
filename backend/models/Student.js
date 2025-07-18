import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const studentSchema = new mongoose.Schema({
  personalInfo: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['Male', 'Female', 'Other']
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: {
        type: String,
        match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode']
      }
    }
  },
  academicInfo: {
    currentClass: {
      type: String,
      required: [true, 'Current class is required']
    },
    school: {
      type: String,
      required: [true, 'School name is required']
    },
    board: {
      type: String,
      enum: ['CBSE', 'ICSE', 'State Board', 'International', 'Other']
    },
    subjects: [String],
    marks: {
      type: Map,
      of: Number
    },
    interests: [String],
    careerGoals: String
  },
  counselingInfo: {
    totalAppointments: {
      type: Number,
      default: 0
    },
    completedAppointments: {
      type: Number,
      default: 0
    },
    lastAppointmentDate: Date,
    counselingNotes: [{
      date: {
        type: Date,
        default: Date.now
      },
      notes: String,
      counsellor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
      }
    }],
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low'
    },
    specialNeeds: String,
    parentGuardianInfo: {
      name: String,
      relationship: String,
      phone: String,
      email: String
    }
  },
  // Authentication fields for student login
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple documents without studentId
  },
  role: {
    type: String,
    default: 'student'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Graduated', 'Transferred'],
    default: 'Active'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for full name
studentSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Virtual for age calculation
studentSchema.virtual('age').get(function() {
  if (!this.personalInfo.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.personalInfo.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Method to add counseling notes
studentSchema.methods.addCounselingNote = function(note, counsellorId) {
  this.counselingInfo.counselingNotes.push({
    notes: note,
    counsellor: counsellorId,
    date: new Date()
  });
  return this.save();
};

// Method to update appointment count
studentSchema.methods.updateAppointmentCount = function(completed = false) {
  this.counselingInfo.totalAppointments += 1;
  if (completed) {
    this.counselingInfo.completedAppointments += 1;
    this.counselingInfo.lastAppointmentDate = new Date();
  }
  return this.save();
};

// Static method to get students by class
studentSchema.statics.findByClass = function(className) {
  return this.find({ 'academicInfo.currentClass': className, isActive: true });
};

// Static method to get recent registrations
studentSchema.statics.getRecentRegistrations = function(days = 30) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  return this.find({ 
    registrationDate: { $gte: dateThreshold },
    isActive: true 
  }).sort({ registrationDate: -1 });
};

// Ensure virtual fields are serialized
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

// Generate studentId before saving
studentSchema.pre('save', async function(next) {
  // Generate studentId if not provided
  if (this.isNew && !this.studentId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({});
    this.studentId = `STU${year}${String(count + 1).padStart(4, '0')}`;
  }
  
  next();
});

// Hash password before saving
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model('Student', studentSchema);
