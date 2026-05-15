// Direct Admin Account Creation - Copy and paste this entire script into browser console

(function() {
  console.log('🚀 Creating Timely Mate Admin Account...');
  
  // Create admin user with full access
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
  let existingUsers = [];
  try {
    const usersStr = localStorage.getItem('timelymate_registered_users');
    if (usersStr) {
      existingUsers = JSON.parse(usersStr);
    }
  } catch (e) {
    console.log('No existing users found, starting fresh...');
  }

  // Check if admin user already exists
  const existingAdminUser = existingUsers.find(user => user.email === 'admin@timelymate.com');

  if (existingAdminUser) {
    console.log('✅ Admin account already exists!');
    console.log('📧 Email: admin@timelymate.com');
    console.log('🔑 Password: admin123');
  } else {
    // Add admin user
    existingUsers.push(adminUser);
    
    // Save to localStorage
    localStorage.setItem('timelymate_registered_users', JSON.stringify(existingUsers));
    
    console.log('✅ Admin account created successfully!');
    console.log('📧 Email: admin@timelymate.com');
    console.log('🔑 Password: admin123');
  }

  // Verify the account was created
  const verifyUsers = JSON.parse(localStorage.getItem('timelymate_registered_users') || '[]');
  const adminExists = verifyUsers.find(user => user.email === 'admin@timelymate.com');
  
  if (adminExists) {
    console.log('');
    console.log('🎉 SUCCESS! Admin account is ready to use:');
    console.log('==========================================');
    console.log('👑 Email: admin@timelymate.com');
    console.log('🔑 Password: admin123');
    console.log('🏢 Organization: Demo Organization');
    console.log('📋 Plan: Premium');
    console.log('👤 Role: Admin (Full Access)');
    console.log('');
    console.log('🌐 Go to: http://localhost:3001/login');
    console.log('');
    console.log('🎯 You now have access to ALL features!');
  } else {
    console.error('❌ Failed to create admin account');
  }
})();
