// FINAL Admin Account Creation Script
// Copy and paste this entire script into browser console at http://localhost:3001

(function() {
  console.log('🚀 Creating Timely Mate Admin Account (Final Method)...');
  
  // Use the exact same localStorage key as the app
  const USERS_KEY = 'timelymate_registered_users';
  
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

  // Get existing users using the exact same method as userStorageService.getAllUsers()
  let existingUsers = [];
  try {
    const usersStr = localStorage.getItem(USERS_KEY);
    if (usersStr) {
      existingUsers = JSON.parse(usersStr);
    }
  } catch (e) {
    console.log('No existing users found, starting fresh...');
    existingUsers = [];
  }

  // Check if admin user already exists using the exact same method as userStorageService.userExists()
  const existingAdminUser = existingUsers.find(user => user.email.toLowerCase() === 'admin@timelymate.com'.toLowerCase());

  if (existingAdminUser) {
    console.log('✅ Admin account already exists!');
  } else {
    // Add admin user
    existingUsers.push(adminUser);
    
    // Save to localStorage using the exact same key
    localStorage.setItem(USERS_KEY, JSON.stringify(existingUsers));
    
    console.log('✅ Admin account created successfully!');
  }

  // Verify the account was created using the exact same method
  const verifyUsersStr = localStorage.getItem(USERS_KEY);
  let verifyUsers = [];
  if (verifyUsersStr) {
    try {
      verifyUsers = JSON.parse(verifyUsersStr);
    } catch (e) {
      verifyUsers = [];
    }
  }
  
  const adminExists = verifyUsers.find(user => user.email.toLowerCase() === 'admin@timelymate.com'.toLowerCase());
  
  if (adminExists) {
    console.log('');
    console.log('🎉 SUCCESS! Admin account is ready to use:');
    console.log('==========================================');
    console.log('👑 Email: admin@timelymate.com');
    console.log('🔑 Password: admin123');
    console.log('🆔 User ID:', adminExists.id);
    console.log('🏢 Organization: Demo Organization');
    console.log('📋 Plan: Premium');
    console.log('👤 Role: Admin (Full Access)');
    console.log('');
    console.log('🌐 Go to: http://localhost:3001/login');
    console.log('');
    
    // Test the validation function
    const testValidation = verifyUsers.find(user => user.email.toLowerCase() === 'admin@timelymate.com'.toLowerCase());
    if (testValidation && testValidation.password === 'admin123') {
      console.log('✅ Validation test passed - login should work!');
    } else {
      console.error('❌ Validation test failed');
    }
    
    console.log('🎯 You now have access to ALL features!');
  } else {
    console.error('❌ Failed to create admin account');
  }
})();



