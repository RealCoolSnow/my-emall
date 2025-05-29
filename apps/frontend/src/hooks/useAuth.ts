import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';
import { AuthState } from '../types';

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const authData = await authService.login({ email, password });
          set({
            user: authData.user,
            token: authData.token,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Login failed:', error);
          throw error;
        }
      },

      register: async (email: string, username: string, password: string) => {
        try {
          const authData = await authService.register({ email, username, password });
          set({
            user: authData.user,
            token: authData.token,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Registration failed:', error);
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      loadUser: async () => {
        try {
          if (authService.isAuthenticated()) {
            const user = await authService.getCurrentUser();
            set({
              user,
              token: authService.getStoredToken(),
              isAuthenticated: true,
            });
          }
        } catch (error) {
          console.error('Load user failed:', error);
          // 如果获取用户信息失败，清除认证状态
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
