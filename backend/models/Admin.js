import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
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
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    default: 'counsellor',
    enum: ['counsellor', 'admin']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  }
}, {
  timestamps: true
});

// Virtual for account lock status
adminSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
adminSchema.methods.comparePassword = async function(candidatePassword) {
  if (this.isLocked) {
    throw new Error('Account is temporarily locked due to too many failed login attempts');
  }
  
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    
    if (isMatch) {
      // Reset login attempts on successful login
      if (this.loginAttempts > 0) {
        this.loginAttempts = 0;
        this.lockUntil = undefined;
        await this.save();
      }
      
      // Update last login
      this.lastLogin = new Date();
      await this.save();
      
      return true;
    } else {
      // Increment login attempts
      this.loginAttempts += 1;
      
      // Lock account after 5 failed attempts for 30 minutes
      if (this.loginAttempts >= 5) {
        this.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
      }
      
      await this.save();
      return false;
    }
  } catch (error) {
    throw error;
  }
};

// Method to unlock account
adminSchema.methods.unlockAccount = function() {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  return this.save();
};

// Remove password from JSON output
adminSchema.methods.toJSON = function() {
  const adminObject = this.toObject();
  delete adminObject.password;
  delete adminObject.loginAttempts;
  delete adminObject.lockUntil;
  return adminObject;
};

export default mongoose.model('Admin', adminSchema);
