import express from 'express';
import Appointment from '../models/Appointment.js';
import Student from '../models/Student.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @desc    Get all appointments (admin/counsellor) or student's own appointments
 * @route   GET /api/appointments
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = '',
      type = '',
      priority = '',
      date = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};

    // If user is a student, only show their appointments
    if (req.user.role === 'student') {
      query.student = req.user.id;
    }

    if (status) query.status = status;
    if (type) query['appointmentDetails.type'] = type;
    if (priority) query['appointmentDetails.priority'] = priority;
    
    // Date filtering
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query['appointmentDetails.requestedDate'] = {
        $gte: startDate,
        $lt: endDate
      };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortDirection };

    // Execute query
    const appointments = await Appointment.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('student', 'personalInfo.firstName personalInfo.lastName personalInfo.email personalInfo.phone studentId')
      .populate('counsellor', 'name email')
      .lean();

    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        appointments,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointments'
    });
  }
});

/**
 * @desc    Get single appointment
 * @route   GET /api/appointments/:id
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('student')
      .lean();

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { appointment }
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointment'
    });
  }
});

/**
 * @desc    Create new appointment
 * @route   POST /api/appointments
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const appointmentData = {
      ...req.body,
      createdBy: req.user.id
    };

    const appointment = await Appointment.create(appointmentData);

    // Add appointment to student's appointments array
    await Student.findByIdAndUpdate(
      appointmentData.student,
      { $push: { appointments: appointment._id } }
    );

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('student', 'name email phone studentId');

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: { appointment: populatedAppointment }
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating appointment'
    });
  }
});

/**
 * @desc    Update appointment
 * @route   PUT /api/appointments/:id
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: new Date()
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('student', 'name email phone studentId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: { appointment }
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating appointment'
    });
  }
});

/**
 * @desc    Delete appointment
 * @route   DELETE /api/appointments/:id
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Remove appointment from student's appointments array
    await Student.findByIdAndUpdate(
      appointment.student,
      { $pull: { appointments: appointment._id } }
    );

    await appointment.remove();

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting appointment'
    });
  }
});

/**
 * @desc    Get pending appointments
 * @route   GET /api/appointments/status/pending
 * @access  Private
 */
router.get('/status/pending', protect, async (req, res) => {
  try {
    const pendingAppointments = await Appointment.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .populate('student', 'name email phone studentId')
      .lean();

    res.status(200).json({
      success: true,
      data: { appointments: pendingAppointments }
    });
  } catch (error) {
    console.error('Get pending appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending appointments'
    });
  }
});

/**
 * @desc    Confirm appointment
 * @route   PATCH /api/appointments/:id/confirm
 * @access  Private
 */
router.patch('/:id/confirm', protect, async (req, res) => {
  try {
    const { confirmedDate, confirmedTime, notes } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        status: 'confirmed',
        confirmedDate: confirmedDate || appointment.date,
        confirmedTime: confirmedTime || appointment.time,
        notes: notes || appointment.notes,
        confirmedBy: req.user.id,
        confirmedAt: new Date()
      },
      { new: true }
    ).populate('student', 'name email phone studentId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment confirmed successfully',
      data: { appointment }
    });
  } catch (error) {
    console.error('Confirm appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while confirming appointment'
    });
  }
});

/**
 * @desc    Complete appointment
 * @route   PATCH /api/appointments/:id/complete
 * @access  Private
 */
router.patch('/:id/complete', protect, async (req, res) => {
  try {
    const { remarks, followUpDate, resolution } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        status: 'completed',
        remarks,
        followUpDate,
        resolution,
        completedBy: req.user.id,
        completedAt: new Date()
      },
      { new: true }
    ).populate('student', 'name email phone studentId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment completed successfully',
      data: { appointment }
    });
  } catch (error) {
    console.error('Complete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while completing appointment'
    });
  }
});

/**
 * @desc    Update appointment status
 * @route   PATCH /api/appointments/:id/status
 * @access  Private (Admin/Counsellor only)
 */
router.patch('/:id/status', protect, authorize('admin', 'counsellor'), async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, confirmed, completed, cancelled'
      });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('student', 'personalInfo contactInfo')
      .populate('counsellor', 'name email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    appointment.status = status;
    appointment.lastModified = new Date();

    await appointment.save();

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      data: { appointment }
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating appointment status'
    });
  }
});

export default router;
