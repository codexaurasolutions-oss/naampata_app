import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'user' | 'vendor' | 'admin' | 'superadmin';
  avatarUrl?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  provider?: string;
  country?: string;
  city?: string;
  state?: string;
  isActive?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
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
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (credentials) => {
    console.log('[AUTH] login called with:', credentials.email);
    try {
      set({ isLoading: true, error: null });
      const response = await api.auth.login(credentials);
      console.log('[AUTH] login response keys:', Object.keys(response || {}));
      console.log('[AUTH] login response (truncated):', JSON.stringify(response).substring(0, 300));

      const user = response?.user;
      const accessToken = response?.tokens?.accessToken || response?.token;
      const rToken = response?.tokens?.refreshToken;

      if (!accessToken) {
        const errMsg = 'No token received from server';
        console.error('[AUTH]', errMsg, 'Full response:', response);
        set({ isLoading: false, error: errMsg });
        throw new Error(errMsg);
      }

      await AsyncStorage.setItem('token', accessToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      if (rToken) await AsyncStorage.setItem('refreshToken', rToken);

      set({ user, token: accessToken, refreshToken: rToken || null, isAuthenticated: true, isLoading: false });
      console.log('[AUTH] login success! user:', user?.email, 'role:', user?.role);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Login failed';
      console.error('[AUTH] login error:', msg, 'status:', error?.response?.status);
      set({ isLoading: false, error: msg });
      throw error;
    }
  },

  register: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.auth.register(userData);
      set({ isLoading: false });
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Registration failed';
      set({ isLoading: false, error: msg });
      throw error;
    }
  },

  googleLogin: async (idToken: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.auth.googleLogin({ idToken });
      const user = response?.user;
      const accessToken = response?.tokens?.accessToken || response?.token;
      const rToken = response?.tokens?.refreshToken;
      if (!accessToken) throw new Error('No token received from server');
      await AsyncStorage.setItem('token', accessToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      if (rToken) await AsyncStorage.setItem('refreshToken', rToken);
      set({ user, token: accessToken, refreshToken: rToken || null, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Google login failed';
      set({ isLoading: false, error: msg });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.auth.logout();
    } catch (error: any) {}
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('user');
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
  },

  syncProfile: async () => {
    try {
      const response = await api.users.getProfile();
      if (response) {
        const user = response.user || response;
        if (user && user.id) {
          await AsyncStorage.setItem('user', JSON.stringify(user));
          set({ user });
        }
      }
    } catch (error: any) {
      console.error('Profile sync failed', error);
      if (error?.response?.status === 401) {
        get().logout();
      }
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
        try {
          await get().syncProfile();
        } catch (e) {
          console.error('Profile sync failed during session check', e);
        }
      }
    } catch (e) {
      console.error('Session check failed', e);
    } finally {
      set({ isLoading: false });
    }
  },

  setError: (error: string | null) => set({ error }),
}));
