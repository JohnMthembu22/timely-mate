#!/usr/bin/env ts-node
/**
 * Supabase Setup Script for Timely Mate
 * 
 * This script helps you:
 * 1. Verify Supabase connection
 * 2. Check if database tables exist
 * 3. Provide instructions for setting up tables
 * 4. Test real-time functionality
 */

import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file manually (since Vite uses import.meta.env)
function loadEnvFile(): Record<string, string> {
  const envPath = path.join(__dirname, '../.env');
  const env: Record<string, string> = {};
  
  if (!fs.existsSync(envPath)) {
    return env;
  }
  
  const content = fs.readFileSync(envPath, 'utf-8');
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  }
  
  return env;
}

const env = loadEnvFile();
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

if (!fs.existsSync(path.join(__dirname, '../.env'))) {
  console.error('❌ .env file not found!');
  console.log('Please create a .env file in frontend/web/ with:');
  console.log('VITE_SUPABASE_URL=your-project-url');
  console.log('VITE_SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials not found in .env file!');
  console.log('Please add:');
  console.log('VITE_SUPABASE_URL=your-project-url');
  console.log('VITE_SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface TableInfo {
  name: string;
  exists: boolean;
  hasRealtime: boolean;
}

async function checkTable(tableName: string): Promise<TableInfo> {
  try {
    // Try to query the table (this will fail if it doesn't exist)
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    const exists = !error || error.code !== '42P01'; // 42P01 = relation does not exist
    
    // Check if realtime is enabled (we can't directly check this via API)
    // But we can assume it's enabled if the table exists and queries work
    const hasRealtime = exists && !error;

    return {
      name: tableName,
      exists,
      hasRealtime,
    };
  } catch (error: any) {
    return {
      name: tableName,
      exists: false,
      hasRealtime: false,
    };
  }
}

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  try {
    // Test basic connection by getting auth status
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('⚠️  Auth check warning:', authError.message);
    } else {
      console.log('✅ Supabase connection successful!');
      if (session) {
        console.log(`   Logged in as: ${session.user.email || 'Unknown'}`);
      } else {
        console.log('   No active session (this is OK for setup)');
      }
    }
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }

  return true;
}

async function checkDatabaseTables() {
  console.log('\n📊 Checking database tables...\n');
  
  const requiredTables = [
    'profiles',
    'projects',
    'teams',
    'team_members',
    'time_entries',
    'notifications',
    'messages',
  ];

  const results: TableInfo[] = [];
  
  for (const table of requiredTables) {
    const info = await checkTable(table);
    results.push(info);
    
    if (info.exists) {
      console.log(`✅ ${table} - exists`);
    } else {
      console.log(`❌ ${table} - missing`);
    }
  }

  return results;
}

async function testRealtime() {
  console.log('\n🔄 Testing real-time connection...\n');
  
  try {
    // Subscribe to a test channel
    const channel = supabase.channel('setup-test');
    
    channel
      .on('presence', { event: 'sync' }, () => {
        console.log('✅ Real-time presence working!');
      })
      .on('broadcast', { event: 'test' }, (payload) => {
        console.log('✅ Real-time broadcast working!');
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription active!');
          
          // Send a test broadcast
          channel.send({
            type: 'broadcast',
            event: 'test',
            payload: { message: 'Setup test' },
          });
          
          // Clean up after 2 seconds
          setTimeout(() => {
            channel.unsubscribe();
            console.log('   Test completed');
          }, 2000);
        } else if (status === 'CHANNEL_ERROR') {
          console.log('⚠️  Real-time subscription error (this may be OK if tables are not set up yet)');
        }
      });
  } catch (error: any) {
    console.log('⚠️  Real-time test error:', error.message);
  }
}

async function printSetupInstructions(missingTables: string[]) {
  if (missingTables.length === 0) {
    console.log('\n✅ All required tables exist!');
    return;
  }

  console.log('\n📋 Setup Instructions:\n');
  console.log('1. Go to your Supabase Dashboard:');
  console.log(`   https://supabase.com/dashboard/project/${supabaseUrl.split('//')[1]?.split('.')[0]}`);
  console.log('\n2. Navigate to SQL Editor');
  console.log('\n3. Copy and paste the contents of SUPABASE_DATABASE_SETUP.sql');
  console.log('   (located in the project root)');
  console.log('\n4. Click "Run" to execute the SQL script');
  console.log('\n5. Enable Realtime for tables:');
  console.log('   - Go to Database → Replication');
  console.log('   - Enable replication for:');
  missingTables.forEach(table => console.log(`     - ${table}`));
  console.log('\n   Or run this SQL:');
  console.log('   ALTER PUBLICATION supabase_realtime ADD TABLE <table_name>;');
  console.log('\n6. Run this script again to verify setup');
}

async function main() {
  console.log('🚀 Timely Mate - Supabase Setup\n');
  console.log('='.repeat(50));
  console.log(`Project URL: ${supabaseUrl}`);
  console.log('='.repeat(50));
  
  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.log('\n❌ Cannot proceed without a valid connection.');
    process.exit(1);
  }

  // Check tables
  const tableResults = await checkDatabaseTables();
  const missingTables = tableResults
    .filter(t => !t.exists)
    .map(t => t.name);

  // Test realtime
  await testRealtime();

  // Print instructions
  await printSetupInstructions(missingTables);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Setup Summary:');
  console.log('='.repeat(50));
  console.log(`✅ Connection: ${connected ? 'Working' : 'Failed'}`);
  console.log(`✅ Tables: ${tableResults.length - missingTables.length}/${tableResults.length} exist`);
  console.log(`❌ Missing: ${missingTables.length > 0 ? missingTables.join(', ') : 'None'}`);
  console.log('='.repeat(50));

  if (missingTables.length === 0) {
    console.log('\n🎉 Supabase is fully configured and ready to use!');
  } else {
    console.log('\n⚠️  Please complete the setup steps above.');
  }
}

main().catch(console.error);

