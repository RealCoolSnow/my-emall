import api, { handleApiResponse } from '../lib/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
  token: string;
  refreshToken: string;
}

class AuthService {
  /**
   * 用户登录
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    const authData = handleApiResponse<AuthResponse>(response);

    // 保存到本地存储
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData.user));
    }

    return authData;
  }

  /**
   * 用户注册
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    const authData = handleApiResponse<AuthResponse>(response);

    // 保存到本地存储
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData.user));
    }

    return authData;
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<any> {
    const response = await api.get('/auth/me');
    return handleApiResponse(response);
  }

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 清除本地存储
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }

  /**
   * 修改密码
   */
  async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const response = await api.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
    return handleApiResponse(response);
  }

  /**
   * 更新用户资料
   */
  async updateProfile(data: any): Promise<any> {
    const response = await api.put('/auth/profile', data);
    return handleApiResponse(response);
  }

  /**
   * 检查是否已登录
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  }

  /**
   * 获取本地存储的用户信息
   */
  getStoredUser(): any | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * 获取本地存储的token
   */
  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }
}

export const authService = new AuthService();
export default authService;
