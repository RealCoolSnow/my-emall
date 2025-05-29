/// <reference types="vite/client" />

/**
 * 环境变量类型定义
 */
interface ImportMetaEnv {
  // API配置
  readonly VITE_API_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_API_RETRY_COUNT: string;

  // 应用配置
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_ENV: string;
  readonly VITE_DEV_PORT: string;

  // 调试配置
  readonly VITE_DEBUG: string;
  readonly VITE_LOG_LEVEL: string;
  readonly VITE_SHOW_PERFORMANCE: string;

  // 功能开关
  readonly VITE_ENABLE_DARK_THEME: string;
  readonly VITE_ENABLE_I18N: string;
  readonly VITE_ENABLE_EXPORT: string;
  readonly VITE_ENABLE_REALTIME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
