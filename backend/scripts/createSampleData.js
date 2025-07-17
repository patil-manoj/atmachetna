import mongoose from 'mongoose';
import Student from '../models/Student.js';
import Admin from '../models/Admin.js';
import Appointment from '../models/Appointment.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for sample data creation');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Sample data creation
const createSampleData = async () => {
  try {
    console.log('Creating sample data...');

    // Clear existing data
    await Student.deleteMany({});
    await Appointment.deleteMany({});
    
    // Don't clear admins, but ensure we have at least one
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({
        name: 'Admin User',
        email: 'admin@atmachetna.com',
        password: 'admin123', // Plain text - will be hashed by pre-save middleware
        role: 'admin'
      });
      console.log('Created default admin user');
    }

    // Get an admin for counsellor reference
    const admin = await Admin.findOne();

    // Create sample students
    const sampleStudents = [
      {
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@student.com',
          phone: '9876543210',
          dateOfBirth: new Date('2005-05-15'),
          gender: 'Male',
          address: {
            street: '123 Main St',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560001'
          }
        },
        academicInfo: {
          currentClass: '12th Grade',
          school: 'BMSCE',
          board: 'CBSE',
          subjects: ['Mathematics', 'Physics', 'Chemistry', 'English'],
          interests: ['Technology', 'Science', 'Sports'],
          careerGoals: 'Engineering'
        },
        counselingInfo: {
          riskLevel: 'Low',
          specialNeeds: 'None',
          parentGuardianInfo: {
            name: 'Jane Doe',
            relationship: 'Mother',
            phone: '9876543211',
            email: 'jane.doe@parent.com'
          }
        },
        password: 'student123', // Plain text - will be hashed by pre-save middleware
        studentId: 'STU001',
        role: 'student',
        status: 'Active'
      },
      {
        personalInfo: {
          firstName: 'Alice',
          lastName: 'Smith',
          email: 'alice.smith@student.com',
          phone: '9876543212',
          dateOfBirth: new Date('2006-03-22'),
          gender: 'Female',
          address: {
            street: '456 Oak Ave',
            city: 'Mysore',
            state: 'Karnataka',
            pincode: '570001'
          }
        },
        academicInfo: {
          currentClass: '11th Grade',
          school: 'Mount Carmel College',
          board: 'State Board',
          subjects: ['Biology', 'Chemistry', 'Physics', 'English'],
          interests: ['Medicine', 'Research', 'Reading'],
          careerGoals: 'Doctor'
        },
        counselingInfo: {
          riskLevel: 'Medium',
          specialNeeds: 'Study anxiety',
          parentGuardianInfo: {
            name: 'Robert Smith',
            relationship: 'Father',
            phone: '9876543213',
            email: 'robert.smith@parent.com'
          }
        },
        password: 'student123', // Plain text - will be hashed by pre-save middleware
        studentId: 'STU002',
        role: 'student',
        status: 'Active'
      },
      {
        personalInfo: {
          firstName: 'Michael',
          lastName: 'Johnson',
          email: 'michael.johnson@student.com',
          phone: '9876543214',
          dateOfBirth: new Date('2004-11-08'),
          gender: 'Male',
          address: {
            street: '789 Pine St',
            city: 'Hubli',
            state: 'Karnataka',
            pincode: '580020'
          }
        },
        academicInfo: {
          currentClass: '12th Grade',
          school: 'Delhi Public School',
          board: 'CBSE',
          subjects: ['Computer Science', 'Mathematics', 'Physics', 'English'],
          interests: ['Programming', 'Gaming', 'Technology'],
          careerGoals: 'Software Engineer'
        },
        counselingInfo: {
          riskLevel: 'High',
          specialNeeds: 'Social anxiety',
          parentGuardianInfo: {
            name: 'Sarah Johnson',
            relationship: 'Mother',
            phone: '9876543215',
            email: 'sarah.johnson@parent.com'
          }
        },
        password: 'student123', // Plain text - will be hashed by pre-save middleware
        studentId: 'STU003',
        role: 'student',
        status: 'Active'
      }
    ];

    // Create students
    const createdStudents = await Student.create(sampleStudents);
    console.log(`Created ${createdStudents.length} sample students`);

    // Create sample appointments
    const sampleAppointments = [
      {
        student: createdStudents[0]._id,
        counsellor: admin._id,
        appointmentDetails: {
          requestedDate: new Date(Date.now() + 86400000), // Tomorrow
          requestedTime: '10:00 AM',
          confirmedDate: new Date(Date.now() + 86400000),
          confirmedTime: '10:00 AM',
          duration: 60,
          type: 'Academic Counseling',
          mode: 'In-Person',
          priority: 'Medium'
        },
        reason: 'Need guidance on course selection for engineering',
        studentConcerns: 'Confused about which engineering branch to choose',
        status: 'Confirmed'
      },
      {
        student: createdStudents[1]._id,
        counsellor: admin._id,
        appointmentDetails: {
          requestedDate: new Date(Date.now() - 86400000 * 3), // 3 days ago
          requestedTime: '2:00 PM',
          confirmedDate: new Date(Date.now() - 86400000 * 3),
          confirmedTime: '2:00 PM',
          duration: 45,
          type: 'Stress Management',
          mode: 'Video Call',
          priority: 'High'
        },
        reason: 'Experiencing study-related stress and anxiety',
        studentConcerns: 'Finding it difficult to cope with exam pressure',
        status: 'Completed',
        sessionNotes: {
          sessionSummary: 'Discussed stress management techniques and study schedule optimization',
          actionItems: ['Practice breathing exercises', 'Create structured study plan', 'Regular breaks'],
          followUpRequired: true,
          followUpDate: new Date(Date.now() + 86400000 * 7),
          recommendations: 'Continue practicing mindfulness and maintain regular sleep schedule'
        }
      },
      {
        student: createdStudents[2]._id,
        counsellor: admin._id,
        appointmentDetails: {
          requestedDate: new Date(Date.now() + 86400000 * 2), // Day after tomorrow
          requestedTime: '11:30 AM',
          duration: 60,
          type: 'Personal Counseling',
          mode: 'In-Person',
          priority: 'High'
        },
        reason: 'Social anxiety affecting academic performance',
        studentConcerns: 'Difficulty interacting with peers and participating in group activities',
        status: 'Pending'
      },
      {
        student: createdStudents[0]._id,
        counsellor: admin._id,
        appointmentDetails: {
          requestedDate: new Date(Date.now() - 86400000 * 10), // 10 days ago
          requestedTime: '3:00 PM',
          confirmedDate: new Date(Date.now() - 86400000 * 10),
          confirmedTime: '3:00 PM',
          duration: 45,
          type: 'Career Guidance',
          mode: 'Video Call',
          priority: 'Medium'
        },
        reason: 'Career exploration and college selection guidance',
        studentConcerns: 'Want to understand different career paths in engineering',
        status: 'Completed',
        sessionNotes: {
          sessionSummary: 'Explored various engineering disciplines and career opportunities',
          actionItems: ['Research specific colleges', 'Take aptitude tests', 'Shadow professionals'],
          followUpRequired: false,
          recommendations: 'Focus on computer science and electronics based on interests'
        }
      }
    ];

    // Create appointments
    const createdAppointments = await Appointment.create(sampleAppointments);
    console.log(`Created ${createdAppointments.length} sample appointments`);

    // Update student appointment counts
    for (const student of createdStudents) {
      const studentAppointments = createdAppointments.filter(
        apt => apt.student.toString() === student._id.toString()
      );
      const completedCount = studentAppointments.filter(apt => apt.status === 'Completed').length;
      
      await Student.findByIdAndUpdate(student._id, {
        'counselingInfo.totalAppointments': studentAppointments.length,
        'counselingInfo.completedAppointments': completedCount,
        'counselingInfo.lastAppointmentDate': completedCount > 0 ? 
          Math.max(...studentAppointments
            .filter(apt => apt.status === 'Completed')
            .map(apt => apt.appointmentDetails.confirmedDate || apt.appointmentDetails.requestedDate)
          ) : null
      });
    }

    console.log('Sample data created successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@atmachetna.com / admin123');
    console.log('Students:');
    console.log('  john.doe@student.com / student123');
    console.log('  alice.smith@student.com / student123');
    console.log('  michael.johnson@student.com / student123');

  } catch (error) {
    console.error('Error creating sample data:', error);
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await createSampleData();
  await mongoose.disconnect();
  console.log('\nDatabase disconnected. Sample data creation complete!');
  process.exit(0);
};

run().catch(error => {
  console.error('Script error:', error);
  process.exit(1);
});
