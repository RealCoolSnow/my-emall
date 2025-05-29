import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse } from 'shared/types';

// 前端特定的分页响应类型
export interface FrontendPaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 创建 axios 实例
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  (error) => {
    // 处理认证错误
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    // 处理其他错误
    const errorMessage = error.response?.data?.message || '请求失败';
    console.error('API Error:', errorMessage);

    return Promise.reject(error);
  }
);

export default api;

// 通用 API 响应处理函数
export const handleApiResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (response.data.success) {
    return response.data.data as T;
  } else {
    throw new Error(response.data.message || '请求失败');
  }
};

// 分页响应处理函数
export const handlePaginatedResponse = <T>(
  response: AxiosResponse<ApiResponse<FrontendPaginatedResponse<T>>>
): FrontendPaginatedResponse<T> => {
  if (response.data.success) {
    return response.data.data as FrontendPaginatedResponse<T>;
  } else {
    throw new Error(response.data.message || '请求失败');
  }
};
