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
      
      // Create default admin - password will be hashed by pre-save middleware
      const defaultAdmin = new Admin({
        name: process.env.ADMIN_NAME || 'Counsellor Admin',
        email: process.env.ADMIN_EMAIL || 'counsellor@atmachetna.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
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
