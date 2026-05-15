// Demo Account Creation Script
// Run this in the browser console at http://localhost:3001

console.log('🚀 Creating Timely Mate Demo Account...');

// Demo user data
const demoUser = {
  id: `user-${Date.now()}-demo`,
  email: 'demo@timelymate.com',
  password: 'demo123',
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

// Additional demo users
const additionalUsers = [
  {
    id: `user-${Date.now()}-manager`,
    email: 'manager@timelymate.com',
    password: 'demo123',
    organizationName: 'Demo Organization',
    role: 'team_leader',
    permissions: {
      canCreateTasks: true,
      canEditTasks: true,
      canDeleteTasks: true,
      canAssignTasks: true,
      canViewAllTasks: true,
      canManageTeam: true,
      canAccessReports: true,
      canModifySettings: false,
      canManageUsers: false,
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
  },
  {
    id: `user-${Date.now()}-employee`,
    email: 'employee@timelymate.com',
    password: 'demo123',
    organizationName: 'Demo Organization',
    role: 'employee',
    permissions: {
      canCreateTasks: false,
      canEditTasks: false,
      canDeleteTasks: false,
      canAssignTasks: false,
      canViewAllTasks: false,
      canManageTeam: false,
      canAccessReports: false,
      canModifySettings: false,
      canManageUsers: false,
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
  }
];

// Get existing users
const existingUsers = JSON.parse(localStorage.getItem('timelymate_registered_users') || '[]');

// Check if demo user already exists
const existingDemoUser = existingUsers.find(user => user.email === 'demo@timelymate.com');

if (existingDemoUser) {
  console.log('✅ Demo account already exists!');
  console.log('📧 Email: demo@timelymate.com');
  console.log('🔑 Password: demo123');
} else {
  // Add all users
  existingUsers.push(demoUser);
  additionalUsers.forEach(user => {
    const existingUser = existingUsers.find(u => u.email === user.email);
    if (!existingUser) {
      existingUsers.push(user);
    }
  });
  
  // Save to localStorage
  localStorage.setItem('timelymate_registered_users', JSON.stringify(existingUsers));
  
  console.log('✅ Demo accounts created successfully!');
}

// Display credentials
console.log('');
console.log('🔑 Demo Account Credentials:');
console.log('============================');
console.log('👑 Admin Account (Full Access):');
console.log('   📧 Email: demo@timelymate.com');
console.log('   🔑 Password: demo123');
console.log('');
console.log('👥 Team Leader Account:');
console.log('   📧 Email: manager@timelymate.com');
console.log('   🔑 Password: demo123');
console.log('');
console.log('👤 Employee Account:');
console.log('   📧 Email: employee@timelymate.com');
console.log('   🔑 Password: demo123');
console.log('');
console.log('🌐 Login URL: http://localhost:3001/login');
console.log('');
console.log('🎯 Ready to test! Use the admin account to access all features.');



