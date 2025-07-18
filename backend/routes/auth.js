import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @desc    Login admin or student
 * @route   POST /api/auth/login
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, userType = 'admin' } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    let user;
    
    if (userType === 'student') {
      user = await Student.findOne({ 'personalInfo.email': email }).select('+password');
    } else {
      user = await Admin.findOne({ email }).select('+password');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password exists (for students who might not have passwords set)
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Account not set up for login. Please contact administrator.'
      });
    }

    // Check if password matches
    let isMatch;
    if (userType === 'student') {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Use Admin model's comparePassword method for better security
      try {
        isMatch = await user.comparePassword(password);
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create token payload
    const payload = {
      id: user._id,
      email: userType === 'student' ? user.personalInfo.email : user.email,
      role: user.role || userType
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    // Update last login (only for students, admin is handled in comparePassword)
    if (userType === 'student') {
      user.lastLogin = new Date();
      await user.save();
    }

    // Prepare user data based on type
    let userData;
    if (userType === 'student') {
      userData = {
        id: user._id,
        name: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`,
        email: user.personalInfo.email,
        role: 'student',
        studentId: user.studentId,
        lastLogin: user.lastLogin
      };
    } else {
      userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin
      };
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userData,
        userType
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

/**
 * @desc    Register new admin/counselor or student
 * @route   POST /api/auth/signup
 * @access  Public (but should be restricted in production)
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, userType = 'admin' } = req.body;

    // Validation - for students, only email and password are required
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // For admin/counsellor, name is still required
    if (userType !== 'student' && !name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    let user;
    let userData;

    if (userType === 'student') {
      // Check if student already exists
      const existingStudent = await Student.findOne({ 'personalInfo.email': email });

      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Parse name into first and last name (if provided, otherwise use email prefix)
      let firstName, lastName;
      if (name && name.trim()) {
        const nameParts = name.trim().split(' ');
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ') || '';
      } else {
        firstName = email.split('@')[0];
        lastName = '';
      }

      // Create new student with minimal data - profile setup will happen later
      user = await Student.create({
        personalInfo: {
          firstName,
          lastName: lastName || 'Student',
          email,
          phone: '0000000000', // Placeholder - will be updated in profile setup
          dateOfBirth: new Date('2000-01-01'), // Placeholder - will be updated in profile setup
          gender: 'Other' // Placeholder - will be updated in profile setup
        },
        academicInfo: {
          currentClass: 'Not specified',
          school: 'Not specified'
        },
        password,
        role: 'student',
        isVerified: false,
        status: 'Active'
      });

      userData = {
        id: user._id,
        name: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`,
        email: user.personalInfo.email,
        role: 'student',
        studentId: user.studentId,
        lastLogin: null,
        profileComplete: false // Flag to indicate profile needs completion
      };
    } else {
      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ email });

      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Create new admin
      user = await Admin.create({
        name,
        email,
        password, // Password will be hashed by the pre-save middleware
        role: 'counsellor',
        isActive: true
      });

      userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: null
      };
    }

    // Create token
    const payload = {
      id: user._id,
      email: userType === 'student' ? user.personalInfo.email : user.email,
      role: user.role || userType
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user: userData,
        userType
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during signup'
    });
  }
});

/**
 * @desc    Get current logged in user (admin or student)
 * @route   GET /api/auth/me
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  try {
    let user;
    let userData;

    if (req.user.role === 'student') {
      user = await Student.findById(req.user.id);
      if (user) {
        userData = {
          id: user._id,
          name: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`,
          email: user.personalInfo.email,
          role: 'student',
          studentId: user.studentId,
          lastLogin: user.lastLogin
        };
      }
    } else {
      user = await Admin.findById(req.user.id);
      if (user) {
        userData = {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin
        };
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: userData
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @desc    Logout admin
 * @route   POST /api/auth/logout
 * @access  Private
 */
router.post('/logout', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password based on role
    let user;
    if (req.user.role === 'student') {
      user = await Student.findById(req.user.id).select('+password');
    } else {
      user = await Admin.findById(req.user.id).select('+password');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    let isMatch;
    if (req.user.role === 'student') {
      isMatch = await bcrypt.compare(currentPassword, user.password);
    } else {
      isMatch = await user.comparePassword(currentPassword);
    }

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
