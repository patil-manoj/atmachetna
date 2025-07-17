import express from 'express';
import nodemailer from 'nodemailer';
import Student from '../models/Student.js';
import Appointment from '../models/Appointment.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Create transporter for email
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * @desc    Send appointment confirmation email
 * @route   POST /api/email/appointment-confirmation
 * @access  Private
 */
router.post('/appointment-confirmation', protect, async (req, res) => {
  try {
    const { appointmentId, customMessage } = req.body;

    // Get appointment details
    const appointment = await Appointment.findById(appointmentId)
      .populate('student', 'name email phone');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const student = appointment.student;
    
    // Create email content
    const emailSubject = `Appointment Confirmation - ${process.env.APP_NAME}`;
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">${process.env.APP_NAME}</h1>
          <p style="color: #666; margin: 5px 0;">Counseling & Wellness Center</p>
        </div>
        
        <h2 style="color: #1f2937; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Appointment Confirmation</h2>
        
        <p>Dear <strong>${student.name}</strong>,</p>
        
        <p>We are pleased to confirm your counseling appointment with us. Here are the details:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Appointment Date:</td>
              <td style="padding: 8px 0; color: #1f2937;">${new Date(appointment.confirmedDate || appointment.date).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Time:</td>
              <td style="padding: 8px 0; color: #1f2937;">${appointment.confirmedTime || appointment.time}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Type:</td>
              <td style="padding: 8px 0; color: #1f2937;">${appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)} Counseling</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Status:</td>
              <td style="padding: 8px 0; color: #059669; font-weight: bold;">Confirmed</td>
            </tr>
          </table>
        </div>
        
        ${customMessage ? `
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #92400e;">Special Note from Counselor:</h4>
            <p style="margin: 0; color: #78350f;">${customMessage}</p>
          </div>
        ` : ''}
        
        <div style="background-color: #dbeafe; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #1e40af;">Important Instructions:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #1e3a8a;">
            <li>Please arrive 10 minutes before your scheduled time</li>
            <li>Bring any relevant documents or reports</li>
            <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
            <li>Maintain confidentiality about your session</li>
          </ul>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center;">
          <p style="color: #6b7280; margin: 10px 0;">For any queries or to reschedule, please contact us:</p>
          <p style="color: #1f2937; font-weight: bold; margin: 5px 0;">📧 ${process.env.EMAIL_FROM || 'counselor@atmachethana.com'}</p>
          <p style="color: #1f2937; font-weight: bold; margin: 5px 0;">📞 +91-XXXXXXXXXX</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center;">
          <p style="color: #6b7280; margin: 0; font-size: 14px;">This email was sent from ${process.env.APP_NAME} - Counseling & Wellness Center</p>
          <p style="color: #6b7280; margin: 5px 0; font-size: 12px;">© ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    `;

    // Send email
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || process.env.APP_NAME}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: student.email,
      subject: emailSubject,
      html: emailBody
    };

    await transporter.sendMail(mailOptions);

    // Update appointment to mark email sent
    await Appointment.findByIdAndUpdate(appointmentId, {
      emailSent: true,
      emailSentAt: new Date(),
      emailSentBy: req.user.id
    });

    res.status(200).json({
      success: true,
      message: 'Appointment confirmation email sent successfully',
      data: {
        sentTo: student.email,
        sentAt: new Date()
      }
    });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send confirmation email',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Email service error'
    });
  }
});

/**
 * @desc    Send follow-up email
 * @route   POST /api/email/follow-up
 * @access  Private
 */
router.post('/follow-up', protect, async (req, res) => {
  try {
    const { studentId, subject, message, appointmentId } = req.body;

    // Get student details
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Create email content
    const emailSubject = subject || `Follow-up from ${process.env.APP_NAME}`;
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">${process.env.APP_NAME}</h1>
          <p style="color: #666; margin: 5px 0;">Counseling & Wellness Center</p>
        </div>
        
        <h2 style="color: #1f2937; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Follow-up Message</h2>
        
        <p>Dear <strong>${student.name}</strong>,</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${message.split('\n').map(paragraph => `<p style="margin: 0 0 15px 0; color: #1f2937; line-height: 1.6;">${paragraph}</p>`).join('')}
        </div>
        
        <div style="background-color: #dbeafe; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #1e3a8a;">If you have any questions or concerns, please don't hesitate to reach out to us.</p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center;">
          <p style="color: #6b7280; margin: 10px 0;">For any queries, please contact us:</p>
          <p style="color: #1f2937; font-weight: bold; margin: 5px 0;">📧 ${process.env.EMAIL_FROM || 'counselor@atmachethana.com'}</p>
          <p style="color: #1f2937; font-weight: bold; margin: 5px 0;">📞 +91-XXXXXXXXXX</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center;">
          <p style="color: #6b7280; margin: 0; font-size: 14px;">This email was sent from ${process.env.APP_NAME} - Counseling & Wellness Center</p>
          <p style="color: #6b7280; margin: 5px 0; font-size: 12px;">© ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    `;

    // Send email
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || process.env.APP_NAME}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: student.email,
      subject: emailSubject,
      html: emailBody
    };

    await transporter.sendMail(mailOptions);

    // If related to an appointment, update the appointment
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        $push: {
          followUpEmails: {
            subject: emailSubject,
            message,
            sentAt: new Date(),
            sentBy: req.user.id
          }
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Follow-up email sent successfully',
      data: {
        sentTo: student.email,
        subject: emailSubject,
        sentAt: new Date()
      }
    });
  } catch (error) {
    console.error('Send follow-up email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send follow-up email',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Email service error'
    });
  }
});

/**
 * @desc    Test email configuration
 * @route   POST /api/email/test
 * @access  Private
 */
router.post('/test', protect, async (req, res) => {
  try {
    const transporter = createTransporter();
    
    // Verify connection
    await transporter.verify();

    res.status(200).json({
      success: true,
      message: 'Email configuration is working correctly'
    });
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({
      success: false,
      message: 'Email configuration test failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Email service error'
    });
  }
});

export default router;
