import { DataProvider, fetchUtils } from 'react-admin';
import { API_CONFIG, Logger } from './config/env';

/**
 * 格式化数据中的日期字段
 */
const formatDatesInData = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const result = { ...data };

  // 需要格式化的日期字段
  const dateFields = ['startDate', 'endDate', 'createdAt', 'updatedAt'];

  dateFields.forEach(field => {
    if (result[field]) {
      const date = new Date(result[field]);
      if (!isNaN(date.getTime())) {
        result[field] = date.toISOString();
      }
    }
  });

  return result;
};

/**
 * 自定义HTTP客户端
 * 添加认证头和错误处理
 */
const httpClient = (url: string, options: any = {}) => {
  // 从localStorage获取认证token
  const token = localStorage.getItem('auth_token');

  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }

  // 添加认证头
  if (token) {
    options.headers.set('Authorization', `Bearer ${token}`);
  }

  // 添加Content-Type头
  if (options.body && typeof options.body === 'string') {
    options.headers.set('Content-Type', 'application/json');
  }

  return fetchUtils.fetchJson(url, options);
};

/**
 * API基础URL - 从配置获取
 */
const API_URL = API_CONFIG.BASE_URL;

/**
 * 自定义数据提供者
 * 适配后端API格式
 */
export const dataProvider: DataProvider = {
  /**
   * 获取列表数据
   */
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      page: page,
      limit: perPage,
      sortBy: field,
      sortOrder: order.toLowerCase(),
      ...params.filter,
    };

    // 处理管理后台特殊路由
    let url = `${API_URL}/${resource}`;
    if (resource === 'users') {
      url = `${API_URL}/admin/users`;
    } else if (resource.startsWith('admin/')) {
      url = `${API_URL}/${resource}`;
    }

    url += `?${new URLSearchParams(query).toString()}`;
    Logger.debug(`Fetching list for ${resource}`, { url, params });

    try {
      const { json } = await httpClient(url);
      Logger.debug(`Successfully fetched ${resource} list`, json);

      return {
        data: json.data.data || json.data,
        total: json.data.pagination?.total || json.data.length,
      };
    } catch (error) {
      Logger.error(`Error fetching ${resource}`, error);
      throw error;
    }
  },

  /**
   * 获取单个资源
   */
  getOne: async (resource, params) => {
    let url = `${API_URL}/${resource}/${params.id}`;

    // 处理管理后台特殊路由
    if (resource === 'users') {
      url = `${API_URL}/admin/users/${params.id}`;
    } else if (resource.startsWith('admin/')) {
      url = `${API_URL}/${resource}/${params.id}`;
    }

    try {
      const { json } = await httpClient(url);
      return { data: json.data };
    } catch (error) {
      console.error(`Error fetching ${resource} ${params.id}:`, error);
      throw error;
    }
  },

  /**
   * 获取多个资源
   */
  getMany: async (resource, params) => {
    const query = {
      ids: params.ids.join(','),
    };
    const url = `${API_URL}/${resource}?${new URLSearchParams(query).toString()}`;

    try {
      const { json } = await httpClient(url);
      return { data: json.data };
    } catch (error) {
      console.error(`Error fetching multiple ${resource}:`, error);
      throw error;
    }
  },

  /**
   * 获取引用的多个资源
   */
  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      page: page,
      limit: perPage,
      sortBy: field,
      sortOrder: order.toLowerCase(),
      [params.target]: params.id,
      ...params.filter,
    };

    const url = `${API_URL}/${resource}?${new URLSearchParams(query).toString()}`;

    try {
      const { json } = await httpClient(url);
      return {
        data: json.data.data || json.data,
        total: json.data.pagination?.total || json.data.length,
      };
    } catch (error) {
      console.error(`Error fetching ${resource} references:`, error);
      throw error;
    }
  },

  /**
   * 创建资源
   */
  create: async (resource, params) => {
    let url = `${API_URL}/${resource}`;

    // 处理管理后台特殊路由
    if (resource === 'users') {
      url = `${API_URL}/admin/users`;
    } else if (resource.startsWith('admin/')) {
      url = `${API_URL}/${resource}`;
    }

    try {
      const formattedData = formatDatesInData(params.data);
      const { json } = await httpClient(url, {
        method: 'POST',
        body: JSON.stringify(formattedData),
      });
      return { data: json.data };
    } catch (error) {
      console.error(`Error creating ${resource}:`, error);
      throw error;
    }
  },

  /**
   * 更新资源
   */
  update: async (resource, params) => {
    let url = `${API_URL}/${resource}/${params.id}`;

    // 处理管理后台特殊路由
    if (resource === 'users') {
      url = `${API_URL}/admin/users/${params.id}`;
    } else if (resource.startsWith('admin/')) {
      url = `${API_URL}/${resource}/${params.id}`;
    }

    try {
      const formattedData = formatDatesInData(params.data);
      const { json } = await httpClient(url, {
        method: 'PUT',
        body: JSON.stringify(formattedData),
      });
      return { data: json.data };
    } catch (error) {
      console.error(`Error updating ${resource} ${params.id}:`, error);
      throw error;
    }
  },

  /**
   * 更新多个资源
   */
  updateMany: async (resource, params) => {
    const formattedData = formatDatesInData(params.data);
    const promises = params.ids.map((id) =>
      httpClient(`${API_URL}/${resource}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(formattedData),
      })
    );

    try {
      await Promise.all(promises);
      return { data: params.ids };
    } catch (error) {
      console.error(`Error updating multiple ${resource}:`, error);
      throw error;
    }
  },

  /**
   * 删除资源
   */
  delete: async (resource, params) => {
    let url = `${API_URL}/${resource}/${params.id}`;

    // 处理管理后台特殊路由
    if (resource === 'users') {
      url = `${API_URL}/admin/users/${params.id}`;
    } else if (resource.startsWith('admin/')) {
      url = `${API_URL}/${resource}/${params.id}`;
    }

    try {
      const { json } = await httpClient(url, {
        method: 'DELETE',
      });
      return { data: json.data };
    } catch (error) {
      console.error(`Error deleting ${resource} ${params.id}:`, error);
      throw error;
    }
  },

  /**
   * 删除多个资源
   */
  deleteMany: async (resource, params) => {
    const promises = params.ids.map((id) =>
      httpClient(`${API_URL}/${resource}/${id}`, {
        method: 'DELETE',
      })
    );

    try {
      await Promise.all(promises);
      return { data: params.ids };
    } catch (error) {
      console.error(`Error deleting multiple ${resource}:`, error);
      throw error;
    }
  },
};

/**
 * 认证提供者
 * 处理登录、登出、权限检查等
 */
export const authProvider = {
  /**
   * 登录
   */
  login: async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    try {
      const { json } = await httpClient(`${API_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email: username, password }),
      });

      if (json.success && json.data.token) {
        localStorage.setItem('auth_token', json.data.token);
        localStorage.setItem('user_info', JSON.stringify(json.data.user));
        return Promise.resolve();
      } else {
        return Promise.reject(new Error('登录失败'));
      }
    } catch (error) {
      console.error('Login error:', error);
      return Promise.reject(new Error('登录失败'));
    }
  },

  /**
   * 登出
   */
  logout: async () => {
    try {
      // 调用后端登出接口
      await httpClient(`${API_URL}/auth/logout`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 清除本地存储
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      return Promise.resolve();
    }
  },

  /**
   * 检查认证状态
   */
  checkAuth: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return Promise.reject();
    }

    try {
      // 验证token是否有效
      await httpClient(`${API_URL}/auth/me`);
      return Promise.resolve();
    } catch (error) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      return Promise.reject();
    }
  },

  /**
   * 检查错误
   */
  checkError: (error: any) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  /**
   * 获取权限
   */
  getPermissions: async () => {
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      return Promise.resolve(user.role);
    }
    return Promise.reject();
  },

  /**
   * 获取用户身份
   */
  getIdentity: async () => {
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      return Promise.resolve({
        id: user.id,
        fullName: user.username,
        avatar: user.avatar,
      });
    }
    return Promise.reject();
  },
};

export default dataProvider;
