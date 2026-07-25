import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'vendor' | 'admin' | 'superadmin';
  avatar?: string;
  isOnline?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  syncProfile: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.auth.login(credentials);
      const { user, token } = response.data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.response?.data?.message || 'Login failed' });
      throw error;
    }
  },

  register: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.auth.register(userData);
      const { user, token } = response.data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.response?.data?.message || 'Registration failed' });
      throw error;
    }
  },

  googleLogin: async (idToken: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.auth.googleLogin({ idToken });
      const { user, token } = response.data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.response?.data?.message || 'Google login failed' });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.auth.logout();
    } catch (error: any) {
      console.warn('Backend logout failed', error);
    }
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  syncProfile: async () => {
    try {
      const response = await api.users.getProfile();
      if (response) {
        const user = response.data || response;
        await AsyncStorage.setItem('user', JSON.stringify(user));
        set({ user });
      }
    } catch (error: any) {
      console.error('Profile sync failed', error);
      get().logout();
    }
  },

  checkSession: async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        set({
          token: storedToken,
          user: JSON.parse(storedUser),
          isAuthenticated: true,
        });
        get().syncProfile();
      }
    } catch (e) {
      console.error('Session check failed', e);
    } finally {
      set({ isLoading: false });
    }
  },

  setError: (error: string | null) => set({ error }),
}));