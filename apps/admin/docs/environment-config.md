# 环境配置管理文档

## 📋 概述

本文档详细说明了电商平台管理后台的环境配置管理系统，包括环境变量的使用、配置文件的组织和最佳实践。

## 🗂️ 配置文件结构

```
apps/admin/
├── .env                    # 默认环境配置
├── .env.development        # 开发环境配置
├── .env.production         # 生产环境配置
├── .env.example           # 配置示例文件
├── .env.local             # 本地配置（git忽略）
├── src/
│   ├── config/
│   │   └── env.ts         # 环境配置管理
│   └── types/
│       └── env.d.ts       # 环境变量类型定义
└── .gitignore             # Git忽略配置
```

## 🔧 配置分类

### 1. API配置
```env
# 后端API基础URL
VITE_API_URL=http://localhost:3000/api

# API请求超时时间（毫秒）
VITE_API_TIMEOUT=10000

# API请求重试次数
VITE_API_RETRY_COUNT=3
```

### 2. 应用配置
```env
# 应用标题
VITE_APP_TITLE=电商平台管理后台

# 应用版本
VITE_APP_VERSION=1.0.0

# 应用环境
VITE_APP_ENV=development

# 开发服务器端口
VITE_DEV_PORT=5173
```

### 3. 调试配置
```env
# 是否启用调试模式
VITE_DEBUG=true

# 日志级别 (debug/info/warn/error)
VITE_LOG_LEVEL=debug

# 是否显示性能信息
VITE_SHOW_PERFORMANCE=false
```

### 4. 功能开关
```env
# 是否启用暗色主题
VITE_ENABLE_DARK_THEME=true

# 是否启用国际化
VITE_ENABLE_I18N=false

# 是否启用数据导出
VITE_ENABLE_EXPORT=true

# 是否启用实时通知
VITE_ENABLE_REALTIME=false
```

## 🏗️ 配置管理架构

### 配置对象结构
```typescript
// src/config/env.ts
export const API_CONFIG = {
  BASE_URL: string,
  TIMEOUT: number,
  RETRY_COUNT: number,
};

export const APP_CONFIG = {
  TITLE: string,
  VERSION: string,
  ENV: string,
  DEV_PORT: number,
};

export const DEBUG_CONFIG = {
  ENABLED: boolean,
  LOG_LEVEL: string,
  SHOW_PERFORMANCE: boolean,
};

export const FEATURE_CONFIG = {
  ENABLE_DARK_THEME: boolean,
  ENABLE_I18N: boolean,
  ENABLE_EXPORT: boolean,
  ENABLE_REALTIME: boolean,
};
```

### 工具函数
```typescript
export const ENV_UTILS = {
  isDevelopment: () => boolean,
  isProduction: () => boolean,
  isTest: () => boolean,
  getCurrentEnv: () => string,
  isDebugEnabled: () => boolean,
  getEnvInfo: () => object,
};

export const Logger = {
  debug: (message: string, ...args: any[]) => void,
  info: (message: string, ...args: any[]) => void,
  warn: (message: string, ...args: any[]) => void,
  error: (message: string, ...args: any[]) => void,
  performance: (label: string, startTime: number) => void,
};
```

## 🔍 配置验证

### 自动验证
系统在启动时会自动验证配置的有效性：

```typescript
export const validateConfig = () => {
  // 验证API URL
  // 验证超时时间
  // 验证重试次数
  // 抛出错误或记录成功
};
```

### 验证规则
- **API_URL**: 必须是有效的URL格式
- **TIMEOUT**: 必须大于等于1000毫秒
- **RETRY_COUNT**: 必须在0-10之间
- **LOG_LEVEL**: 必须是有效的日志级别

## 🌍 环境特定配置

### 开发环境 (.env.development)
```env
VITE_API_URL=http://localhost:3000/api
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

### 生产环境 (.env.production)
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_DEBUG=false
VITE_LOG_LEVEL=error
```

### 本地配置 (.env.local)
```env
# 开发者个人配置
VITE_API_URL=http://192.168.1.100:3000/api
VITE_DEBUG=true
```

## 📝 使用示例

### 在组件中使用配置
```typescript
import { API_CONFIG, APP_CONFIG, Logger } from '../config/env';

function MyComponent() {
  useEffect(() => {
    Logger.info('Component mounted', { title: APP_CONFIG.TITLE });
    
    // 使用API配置
    fetch(`${API_CONFIG.BASE_URL}/data`)
      .then(response => response.json())
      .then(data => Logger.debug('Data fetched', data));
  }, []);
  
  return <div>{APP_CONFIG.TITLE}</div>;
}
```

### 在数据提供者中使用
```typescript
import { API_CONFIG, Logger } from './config/env';

const dataProvider = {
  getList: async (resource, params) => {
    const url = `${API_CONFIG.BASE_URL}/${resource}`;
    Logger.debug(`Fetching ${resource}`, { url, params });
    
    // API调用逻辑
  },
};
```

## 🔒 安全考虑

### 敏感信息处理
- 不要在环境变量中存储密钥或密码
- 使用 `.env.local` 存储本地敏感配置
- 确保 `.env.local` 在 `.gitignore` 中

### 生产环境安全
- 在生产环境中禁用调试模式
- 设置适当的日志级别
- 验证所有外部URL的安全性

## 🚀 部署配置

### Docker部署
```dockerfile
# 构建时传入环境变量
ARG VITE_API_URL
ARG VITE_APP_ENV=production

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_ENV=$VITE_APP_ENV

RUN npm run build
```

### CI/CD配置
```yaml
# GitHub Actions示例
env:
  VITE_API_URL: ${{ secrets.API_URL }}
  VITE_APP_ENV: production
  VITE_DEBUG: false
```

## 🛠️ 开发工具

### TypeScript支持
完整的类型定义确保配置的类型安全：

```typescript
// src/types/env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_DEBUG: string;
  // ... 其他环境变量
}
```

### 开发时验证
```bash
# 检查配置
npm run dev

# 查看控制台输出
[Admin Info] Configuration validation passed
[Admin Info] Application started
```

## 📊 监控和调试

### 日志系统
```typescript
// 不同级别的日志
Logger.debug('详细调试信息');
Logger.info('一般信息');
Logger.warn('警告信息');
Logger.error('错误信息');

// 性能监控
const startTime = performance.now();
// ... 执行操作
Logger.performance('操作名称', startTime);
```

### 环境信息查看
```typescript
// 获取完整环境信息
const envInfo = ENV_UTILS.getEnvInfo();
console.log('Environment Info:', envInfo);
```

## 🔄 配置更新流程

1. **修改配置文件**: 更新相应的 `.env` 文件
2. **重启开发服务器**: Vite会自动检测并重启
3. **验证配置**: 检查控制台输出确认配置生效
4. **测试功能**: 验证相关功能是否正常工作

## 📚 最佳实践

### 配置命名
- 使用 `VITE_` 前缀
- 使用大写字母和下划线
- 名称要具有描述性

### 配置组织
- 按功能分组配置
- 提供默认值
- 添加详细注释

### 版本控制
- 提交 `.env.example`
- 忽略 `.env.local`
- 文档化所有配置项

## 🎯 总结

通过完善的环境配置管理系统，我们实现了：

- ✅ **统一配置管理**: 所有配置集中管理
- ✅ **类型安全**: 完整的TypeScript类型支持
- ✅ **环境隔离**: 不同环境使用不同配置
- ✅ **自动验证**: 启动时自动验证配置有效性
- ✅ **调试支持**: 完善的日志和调试功能
- ✅ **安全性**: 敏感信息的安全处理

这套配置系统为应用的开发、测试和部署提供了强大而灵活的支持。
