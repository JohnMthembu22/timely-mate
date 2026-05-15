// Environment Configuration
// This file provides runtime environment configuration for the application
// It can be modified during deployment without rebuilding the application

window.ENV = window.ENV || {};

// Default configuration (can be overridden by deployment scripts)
window.ENV.VITE_API_URL = window.ENV.VITE_API_URL || 'http://localhost:3003';
window.ENV.VITE_SOCKET_URL = window.ENV.VITE_SOCKET_URL || 'http://localhost:3003';
window.ENV.VITE_APP_NAME = window.ENV.VITE_APP_NAME || 'Timely Mate';
window.ENV.VITE_ENABLE_REAL_TIME_CHAT = window.ENV.VITE_ENABLE_REAL_TIME_CHAT || 'true';

console.log('Environment configuration loaded:', {
  apiUrl: window.ENV.VITE_API_URL,
  socketUrl: window.ENV.VITE_SOCKET_URL,
  appName: window.ENV.VITE_APP_NAME,
  realTimeChat: window.ENV.VITE_ENABLE_REAL_TIME_CHAT,
}); 