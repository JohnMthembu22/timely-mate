// Admin Demo Account Creation Script
// Run this in the browser console at http://localhost:3001

console.log('🚀 Creating Timely Mate Admin Demo Account...');

// Create admin demo user with full access
const adminUser = {
  id: `user-${Date.now()}-admin`,
  email: 'admin@timelymate.com',
  password: 'admin123',
  organizationName: 'Demo Organization',
  role: 'admin',
  permissions: {
    canCreateTasks: true,
    canEditTasks: true,
    canDeleteTasks: true,
    canAssignTasks: true,
    canViewAllTasks: true,
    canManageTeam: true,
    canAccessReports: true,
    canModifySettings: true,
    canManageUsers: true,
  },
  companyProfile: {
    name: 'Demo Organization',
    industry: 'Technology',
    size: 'Small (1-10 employees)',
    location: 'Global',
    website: 'https://demo.timelymate.com',
    description: 'Demo organization for testing Timely Mate features'
  },
  selectedPlan: 'premium',
  registeredAt: new Date().toISOString(),
};

// Get existing users
const existingUsers = JSON.parse(localStorage.getItem('timelymate_registered_users') || '[]');

// Check if admin user already exists
const existingAdminUser = existingUsers.find(user => user.email === 'admin@timelymate.com');

if (existingAdminUser) {
  console.log('✅ Admin demo account already exists!');
} else {
  // Add admin user
  existingUsers.push(adminUser);
  
  // Save to localStorage
  localStorage.setItem('timelymate_registered_users', JSON.stringify(existingUsers));
  
  console.log('✅ Admin demo account created successfully!');
}

// Display credentials
console.log('');
console.log('🔑 Admin Demo Account Credentials:');
console.log('==================================');
console.log('👑 Email: admin@timelymate.com');
console.log('🔑 Password: admin123');
console.log('🏢 Organization: Demo Organization');
console.log('📋 Plan: Premium');
console.log('👤 Role: Admin (Full Access)');
console.log('');
console.log('🎯 Features Available:');
console.log('✅ Dashboard & Time Tracking');
console.log('✅ Calendar Management');
console.log('✅ Task Management');
console.log('✅ Team Management');
console.log('✅ HR & Employee Management');
console.log('✅ Payroll Processing');
console.log('✅ Reports & Analytics');
console.log('✅ Settings & Configuration');
console.log('✅ User Management');
console.log('✅ Chat & Communication');
console.log('✅ Video Meetings');
console.log('✅ Procurement Management');
console.log('✅ Learning Portal');
console.log('');
console.log('🌐 Login URL: http://localhost:3001/login');
console.log('');
console.log('🎉 Ready to explore all features!');



