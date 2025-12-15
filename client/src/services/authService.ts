import api from './api';
import { User } from '../types';

// Demo account for testing without backend
const DEMO_ACCOUNT = {
  email: 'demo@movieflix.com',
  password: 'demo123',
  user: {
    id: 'demo-user-001',
    email: 'demo@movieflix.com',
    name: 'Demo User',
    role: 'user',
    avatar: null,
  },
  token: 'demo-token-movieflix-2024',
};

export const authService = {
  async register(data: { email: string; password: string; name: string }) {
    // Allow demo registration without backend
    if (data.email === DEMO_ACCOUNT.email) {
      throw new Error('This email is reserved for demo account');
    }
    
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      // If backend is not available, create a mock registration
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        const mockUser = {
          id: 'user-' + Date.now(),
          email: data.email,
          name: data.name,
          role: 'user',
          avatar: null,
        };
        const mockToken = 'mock-token-' + Date.now();
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        return { success: true, message: 'Registration successful (offline mode)' };
      }
      throw error;
    }
  },

  async login(data: { email: string; password: string }) {
    // Check for demo account first
    if (data.email === DEMO_ACCOUNT.email && data.password === DEMO_ACCOUNT.password) {
      localStorage.setItem('token', DEMO_ACCOUNT.token);
      localStorage.setItem('user', JSON.stringify(DEMO_ACCOUNT.user));
      return { success: true, token: DEMO_ACCOUNT.token, user: DEMO_ACCOUNT.user };
    }

    try {
      const response = await api.post('/auth/login', data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      // If backend is not available, check localStorage for mock users
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        throw new Error('Backend is offline. Use demo account: demo@movieflix.com / demo123');
      }
      throw error;
    }
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};
