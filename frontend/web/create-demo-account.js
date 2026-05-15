// Script to create a demo account with admin privileges
// This will be executed in the browser console

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

// Get existing users or create empty array
const existingUsers = JSON.parse(localStorage.getItem('timelymate_registered_users') || '[]');

// Check if demo user already exists
const existingDemoUser = existingUsers.find(user => user.email === 'demo@timelymate.com');

if (existingDemoUser) {
  console.log('Demo user already exists!');
  console.log('Email: demo@timelymate.com');
  console.log('Password: demo123');
} else {
  // Add demo user to the list
  existingUsers.push(demoUser);
  
  // Save back to localStorage
  localStorage.setItem('timelymate_registered_users', JSON.stringify(existingUsers));
  
  console.log('✅ Demo account created successfully!');
  console.log('📧 Email: demo@timelymate.com');
  console.log('🔑 Password: demo123');
  console.log('👑 Role: Admin (Full Access)');
  console.log('🏢 Organization: Demo Organization');
  console.log('');
  console.log('You can now login with these credentials to access all features!');
}

// Also create some additional demo users for testing different roles
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

// Add additional users if they don't exist
additionalUsers.forEach(user => {
  const existingUser = existingUsers.find(u => u.email === user.email);
  if (!existingUser) {
    existingUsers.push(user);
  }
});

// Save updated users list
localStorage.setItem('timelymate_registered_users', JSON.stringify(existingUsers));

console.log('');
console.log('🎭 Additional Demo Accounts Created:');
console.log('📧 manager@timelymate.com (Team Leader)');
console.log('📧 employee@timelymate.com (Employee)');
console.log('🔑 Password for both: demo123');
console.log('');
console.log('🚀 Ready to test! Visit: http://localhost:3001/login');



