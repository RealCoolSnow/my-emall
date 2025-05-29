/**
 * 环境配置管理
 * 统一管理所有环境变量
 */

/**
 * API配置
 */
export const API_CONFIG = {
  // 后端API基础URL
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  
  // 请求超时时间（毫秒）
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  
  // 重试次数
  RETRY_COUNT: parseInt(import.meta.env.VITE_API_RETRY_COUNT || '3'),
} as const;

/**
 * 应用配置
 */
export const APP_CONFIG = {
  // 应用标题
  TITLE: import.meta.env.VITE_APP_TITLE || '电商平台管理后台',
  
  // 应用版本
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // 应用环境
  ENV: import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development',
  
  // 开发端口
  DEV_PORT: parseInt(import.meta.env.VITE_DEV_PORT || '5173'),
} as const;

/**
 * 调试配置
 */
export const DEBUG_CONFIG = {
  // 是否启用调试模式
  ENABLED: import.meta.env.VITE_DEBUG === 'true' || import.meta.env.DEV,
  
  // 日志级别
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
  
  // 是否显示性能信息
  SHOW_PERFORMANCE: import.meta.env.VITE_SHOW_PERFORMANCE === 'true',
} as const;

/**
 * 功能开关配置
 */
export const FEATURE_CONFIG = {
  // 是否启用暗色主题
  ENABLE_DARK_THEME: import.meta.env.VITE_ENABLE_DARK_THEME !== 'false',
  
  // 是否启用国际化
  ENABLE_I18N: import.meta.env.VITE_ENABLE_I18N === 'true',
  
  // 是否启用数据导出
  ENABLE_EXPORT: import.meta.env.VITE_ENABLE_EXPORT !== 'false',
  
  // 是否启用实时通知
  ENABLE_REALTIME: import.meta.env.VITE_ENABLE_REALTIME === 'true',
} as const;

/**
 * 环境检查函数
 */
export const ENV_UTILS = {
  // 是否为开发环境
  isDevelopment: () => import.meta.env.DEV,
  
  // 是否为生产环境
  isProduction: () => import.meta.env.PROD,
  
  // 是否为测试环境
  isTest: () => import.meta.env.MODE === 'test',
  
  // 获取当前环境名称
  getCurrentEnv: () => import.meta.env.MODE,
  
  // 检查是否启用调试
  isDebugEnabled: () => DEBUG_CONFIG.ENABLED,
  
  // 获取完整的环境信息
  getEnvInfo: () => ({
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
    ssr: import.meta.env.SSR,
    baseUrl: import.meta.env.BASE_URL,
  }),
} as const;

/**
 * 日志工具
 */
export const Logger = {
  debug: (message: string, ...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && ['debug', 'info', 'warn', 'error'].includes(DEBUG_CONFIG.LOG_LEVEL)) {
      console.debug(`[Admin Debug] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && ['info', 'warn', 'error'].includes(DEBUG_CONFIG.LOG_LEVEL)) {
      console.info(`[Admin Info] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && ['warn', 'error'].includes(DEBUG_CONFIG.LOG_LEVEL)) {
      console.warn(`[Admin Warn] ${message}`, ...args);
    }
  },
  
  error: (message: string, ...args: any[]) => {
    if (DEBUG_CONFIG.ENABLED && ['error'].includes(DEBUG_CONFIG.LOG_LEVEL)) {
      console.error(`[Admin Error] ${message}`, ...args);
    }
  },
  
  // 性能日志
  performance: (label: string, startTime: number) => {
    if (DEBUG_CONFIG.SHOW_PERFORMANCE) {
      const duration = performance.now() - startTime;
      console.log(`[Admin Performance] ${label}: ${duration.toFixed(2)}ms`);
    }
  },
} as const;

/**
 * 配置验证
 */
export const validateConfig = () => {
  const errors: string[] = [];
  
  // 验证API URL
  if (!API_CONFIG.BASE_URL) {
    errors.push('VITE_API_URL is required');
  }
  
  // 验证API URL格式
  try {
    new URL(API_CONFIG.BASE_URL);
  } catch {
    errors.push('VITE_API_URL must be a valid URL');
  }
  
  // 验证超时时间
  if (API_CONFIG.TIMEOUT < 1000) {
    errors.push('VITE_API_TIMEOUT must be at least 1000ms');
  }
  
  // 验证重试次数
  if (API_CONFIG.RETRY_COUNT < 0 || API_CONFIG.RETRY_COUNT > 10) {
    errors.push('VITE_API_RETRY_COUNT must be between 0 and 10');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
  
  Logger.info('Configuration validation passed', {
    api: API_CONFIG,
    app: APP_CONFIG,
    debug: DEBUG_CONFIG,
    features: FEATURE_CONFIG,
  });
};

// 在开发环境下自动验证配置
if (ENV_UTILS.isDevelopment()) {
  try {
    validateConfig();
  } catch (error) {
    console.error('Configuration Error:', error);
  }
}
