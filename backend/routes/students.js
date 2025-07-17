import express from 'express';
import Student from '../models/Student.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @desc    Get all students
 * @route   GET /api/students
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status = '',
      priority = ''
    } = req.query;

    // Build query
    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort order
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortDirection };

    // Execute query
    const students = await Student.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('appointments', 'date time status type')
      .lean();

    // Get total count for pagination
    const total = await Student.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        students,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching students'
    });
  }
});

/**
 * @desc    Get single student
 * @route   GET /api/students/:id
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('appointments')
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { student }
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student'
    });
  }
});

/**
 * @desc    Create new student
 * @route   POST /api/students
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const studentData = {
      ...req.body,
      createdBy: req.admin.id
    };

    const student = await Student.create(studentData);

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: { student }
    });
  } catch (error) {
    console.error('Create student error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email or student ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating student'
    });
  }
});

/**
 * @desc    Update student
 * @route   PUT /api/students/:id
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: new Date()
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: { student }
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating student'
    });
  }
});

/**
 * @desc    Delete student
 * @route   DELETE /api/students/:id
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    await student.remove();

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting student'
    });
  }
});

/**
 * @desc    Get students statistics
 * @route   GET /api/students/stats/overview
 * @access  Private
 */
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: 'active' });
    const inactiveStudents = await Student.countDocuments({ status: 'inactive' });
    const highPriorityStudents = await Student.countDocuments({ priority: 'high' });

    res.status(200).json({
      success: true,
      data: {
        total: totalStudents,
        active: activeStudents,
        inactive: inactiveStudents,
        highPriority: highPriorityStudents
      }
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

export default router;
