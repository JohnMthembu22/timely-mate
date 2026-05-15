import { Client } from 'pg';
import config from '../config/database';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env as keyof typeof config];

async function testConnection() {
  const client = new Client({
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.username,
    password: dbConfig.password,
  });

  try {
    console.log('Attempting to connect to database...');
    await client.connect();
    console.log('Successfully connected to database!');
    
    const result = await client.query('SELECT version()');
    console.log('PostgreSQL version:', result.rows[0].version);
    
    await client.end();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
}

testConnection(); 