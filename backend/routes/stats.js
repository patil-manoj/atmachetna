import express from 'express';
import Student from '../models/Student.js';
import Appointment from '../models/Appointment.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/stats/dashboard
 * @access  Private
 */
router.get('/dashboard', protect, async (req, res) => {
  try {
    // Total students
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: 'active' });
    
    // Total appointments
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    
    // Today's appointments
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaysAppointments = await Appointment.countDocuments({
      date: {
        $gte: today.setHours(0, 0, 0, 0),
        $lt: tomorrow.setHours(0, 0, 0, 0)
      }
    });

    // High priority students
    const highPriorityStudents = await Student.countDocuments({ priority: 'high' });

    // Recent appointments (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentAppointments = await Appointment.countDocuments({
      createdAt: { $gte: weekAgo }
    });

    // Appointment types distribution
    const appointmentTypes = await Appointment.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly appointments trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalStudents,
          activeStudents,
          totalAppointments,
          pendingAppointments,
          confirmedAppointments,
          completedAppointments,
          todaysAppointments,
          highPriorityStudents,
          recentAppointments
        },
        appointmentTypes,
        monthlyTrend
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics'
    });
  }
});

/**
 * @desc    Get student statistics
 * @route   GET /api/stats/students
 * @access  Private
 */
router.get('/students', protect, async (req, res) => {
  try {
    // Status distribution
    const statusStats = await Student.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Priority distribution
    const priorityStats = await Student.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Department distribution (if department field exists)
    const departmentStats = await Student.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      {
        $match: { _id: { $ne: null } }
      }
    ]);

    // Year-wise distribution (if year field exists)
    const yearStats = await Student.aggregate([
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 }
        }
      },
      {
        $match: { _id: { $ne: null } }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRegistrations = await Student.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        statusStats,
        priorityStats,
        departmentStats,
        yearStats,
        recentRegistrations,
        total: await Student.countDocuments()
      }
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student statistics'
    });
  }
});

/**
 * @desc    Get appointment statistics
 * @route   GET /api/stats/appointments
 * @access  Private
 */
router.get('/appointments', protect, async (req, res) => {
  try {
    // Status distribution
    const statusStats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Type distribution
    const typeStats = await Appointment.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Priority distribution
    const priorityStats = await Appointment.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Weekly appointments for the current month
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const weeklyStats = await Appointment.aggregate([
      {
        $match: {
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth
          }
        }
      },
      {
        $group: {
          _id: {
            week: { $week: '$date' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.week': 1 }
      }
    ]);

    // Completion rate
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        statusStats,
        typeStats,
        priorityStats,
        weeklyStats,
        completionRate,
        total: totalAppointments
      }
    });
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointment statistics'
    });
  }
});

/**
 * @desc    Get daily appointments for calendar view
 * @route   GET /api/stats/calendar
 * @access  Private
 */
router.get('/calendar', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // If no month/year provided, use current
    const currentDate = new Date();
    const targetYear = parseInt(year) || currentDate.getFullYear();
    const targetMonth = parseInt(month) || currentDate.getMonth() + 1;

    // Get start and end dates for the month
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);

    const dailyAppointments = await Appointment.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$date' },
            month: { $month: '$date' },
            year: { $year: '$date' }
          },
          appointments: {
            $push: {
              id: '$_id',
              time: '$time',
              status: '$status',
              type: '$type',
              student: '$student'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.day': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        month: targetMonth,
        year: targetYear,
        dailyAppointments
      }
    });
  } catch (error) {
    console.error('Get calendar stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching calendar data'
    });
  }
});

export default router;
