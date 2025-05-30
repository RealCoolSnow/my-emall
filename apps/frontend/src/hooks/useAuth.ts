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
      isLoading: true, // 添加加载状态

      login: async (email: string, password: string) => {
        try {
          const authData = await authService.login({ email, password });
          set({
            user: authData.user,
            token: authData.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Login failed:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, username: string, password: string) => {
        try {
          const authData = await authService.register({
            email,
            username,
            password,
          });
          set({
            user: authData.user,
            token: authData.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Registration failed:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
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
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Load user failed:', error);
          // 如果获取用户信息失败，清除认证状态
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        // 不持久化 isLoading，每次启动时都应该是 true
      }),
      onRehydrateStorage: () => (state) => {
        // 数据恢复后，设置 isLoading 为 false
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);
