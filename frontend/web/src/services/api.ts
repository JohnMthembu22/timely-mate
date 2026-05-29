import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    let token: string | null = null;
    try {
      const authRaw = localStorage.getItem('auth');
      if (authRaw) {
        const parsed = JSON.parse(authRaw) as { token?: string };
        token = parsed.token ?? null;
      }
    } catch {
      /* ignore */
    }
    if (!token) {
      token = localStorage.getItem('timelymate_token');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth');
      window.dispatchEvent(new CustomEvent('timelymate:auth-expired'));
    }
    return Promise.reject(error);
  }
);

// User Profile API functions
export const userProfileApi = {
  async updateProfile(userId: string, profileData: {
    name?: string;
    position?: string;
    department?: string;
    email?: string;
    phone?: string;
    location?: string;
    timeZone?: string;
    avatar?: string;
  }) {
    // For now, simulate an API call
    // In production, this would be: return api.put(`/users/${userId}/profile`, profileData);
    console.log('Updating profile for user:', userId, profileData);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      data: {
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: userId,
          ...profileData,
        },
      },
    };
  },

  async getProfile(userId: string) {
    // For now, simulate an API call
    // In production, this would be: return api.get(`/users/${userId}/profile`);
    console.log('Getting profile for user:', userId);
    
    return {
      data: {
        id: userId,
        name: '',
        position: '',
        department: '',
        email: '',
        phone: '',
        location: '',
        timeZone: '',
        avatar: '',
      },
    };
  },

  async updateNotificationSettings(userId: string, notificationSettings: {
    email?: boolean;
    push?: boolean;
    updates?: boolean;
  }) {
    // For now, simulate an API call
    // In production, this would be: return api.put(`/users/${userId}/notification-settings`, notificationSettings);
    console.log('Updating notification settings for user:', userId, notificationSettings);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: {
        success: true,
        message: 'Notification settings updated successfully',
        settings: notificationSettings,
      },
    };
  },
};

export default api;
