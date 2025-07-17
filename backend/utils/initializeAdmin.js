import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';

/**
 * Initialize default admin user if none exists
 */
export const initializeAdmin = async () => {
  try {
    // Check if any admin exists
    const adminExists = await Admin.findOne();
    
    if (!adminExists) {
      console.log('🔧 No admin found. Creating default admin...');
      
      // Hash the default password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD || 'admin123',
        saltRounds
      );
      
      // Create default admin
      const defaultAdmin = new Admin({
        name: process.env.ADMIN_NAME || 'Counsellor Admin',
        email: process.env.ADMIN_EMAIL || 'counsellor@atmachethana.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        createdAt: new Date()
      });
      
      await defaultAdmin.save();
      
      console.log('✅ Default admin created successfully');
      console.log(`📧 Email: ${defaultAdmin.email}`);
      console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
      console.log('⚠️  Please change the default password after first login');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error initializing admin:', error);
  }
};
