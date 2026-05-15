import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { config } from './config.js';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { parse } from 'ini';

async function loadAwsCredentials() {
  try {
    const credentialsPath = join(homedir(), '.aws', 'credentials');
    const credentialsContent = await readFile(credentialsPath, 'utf-8');
    const credentials = parse(credentialsContent);
    return {
      accessKeyId: credentials.default.aws_access_key_id,
      secretAccessKey: credentials.default.aws_secret_access_key,
    };
  } catch (error) {
    console.error('Failed to load AWS credentials:', error);
    throw error;
  }
}

const credentials = await loadAwsCredentials();

const cognitoClient = new CognitoIdentityProviderClient({
  region: config.aws.region,
  credentials: credentials,
});

const testUsers = [
  {
    username: 'employee1@timelymate.com',
    password: 'Test@123456',
    role: 'EMPLOYEE',
    firstName: 'John',
    lastName: 'Doe',
  },
  {
    username: 'employee2@timelymate.com',
    password: 'Test@123456',
    role: 'EMPLOYEE',
    firstName: 'Jane',
    lastName: 'Smith',
  },
  {
    username: 'manager1@timelymate.com',
    password: 'Test@123456',
    role: 'LINE_MANAGER',
    firstName: 'Mike',
    lastName: 'Johnson',
  },
];

const createTestUser = async (user) => {
  try {
    // Create user in Cognito
    await cognitoClient.send(
      new AdminCreateUserCommand({
        UserPoolId: config.aws.cognitoUserPoolId,
        Username: user.username,
        TemporaryPassword: user.password,
        UserAttributes: [
          {
            Name: 'email',
            Value: user.username,
          },
          {
            Name: 'email_verified',
            Value: 'true',
          },
          {
            Name: 'custom:role',
            Value: user.role,
          },
          {
            Name: 'given_name',
            Value: user.firstName,
          },
          {
            Name: 'family_name',
            Value: user.lastName,
          },
        ],
      })
    );

    // Set permanent password
    await cognitoClient.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: config.aws.cognitoUserPoolId,
        Username: user.username,
        Password: user.password,
        Permanent: true,
      })
    );

    console.log(`✅ Created user: ${user.username} (${user.role})`);
  } catch (error) {
    console.error(`❌ Failed to create user ${user.username}:`, error);
  }
};

const setupTestData = async () => {
  console.log('🚀 Setting up test users...');
  
  for (const user of testUsers) {
    await createTestUser(user);
  }

  console.log('\n📝 Test Users Created:');
  console.log('------------------------');
  testUsers.forEach(user => {
    console.log(`
Username: ${user.username}
Password: ${user.password}
Role: ${user.role}
Name: ${user.firstName} ${user.lastName}
------------------------`);
  });
};

setupTestData().catch(console.error); 