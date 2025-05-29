# 电商平台管理后台

基于React Admin构建的现代化电商平台管理后台，提供完整的商品、订单、用户和优惠券管理功能。

## 🚀 功能特性

### 📊 仪表板

- 实时数据统计概览
- 低库存产品警告
- 即将过期优惠券提醒
- 系统状态监控
- 快速操作入口

### 📦 产品管理

- 产品CRUD操作（创建、读取、更新、删除）
- 产品搜索和筛选
- 库存管理和警告
- 产品状态管理
- 批量操作支持

### 📋 订单管理

- 订单列表查看和筛选
- 订单状态更新
- 订单详情查看
- 支付状态管理
- 订单统计分析

### 🎫 优惠券管理

- 多种优惠券类型支持
  - 百分比折扣
  - 固定金额折扣
  - 免运费
  - 买X送Y
- 优惠券有效期管理
- 使用限制设置
- 适用范围配置

### 👥 用户管理

- 用户信息管理
- 角色权限控制
- 用户状态监控
- 用户订单历史
- 用户统计分析

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **UI库**: React Admin + Ant Design
- **构建工具**: Vite
- **状态管理**: React Admin内置
- **HTTP客户端**: Axios
- **样式**: CSS + React Admin主题

## 📁 项目结构

```
apps/admin/
├── src/
│   ├── components/          # 组件目录
│   │   ├── Dashboard.tsx    # 仪表板组件
│   │   ├── ProductManagement.tsx  # 产品管理
│   │   ├── OrderManagement.tsx    # 订单管理
│   │   ├── CouponEditor.tsx       # 优惠券管理
│   │   └── UserManagement.tsx     # 用户管理
│   ├── hooks/              # 自定义Hooks
│   │   └── useAdminData.ts  # 管理后台数据Hook
│   ├── styles/             # 样式文件
│   │   └── globals.css     # 全局样式
│   ├── dataProvider.ts     # 数据提供者
│   ├── App.tsx            # 主应用组件
│   └── main.tsx           # 应用入口
├── public/                # 静态资源
├── package.json          # 依赖配置
└── README.md            # 项目说明
```

## 🚦 快速开始

### 1. 环境配置

```bash
# 复制环境变量配置文件
cp .env.example .env

# 根据实际情况修改配置
vim .env
```

### 2. 安装依赖

```bash
cd apps/admin
pnpm install
```

### 3. 启动开发服务器

```bash
pnpm dev
```

### 4. 构建生产版本

```bash
pnpm build
```

### 5. 预览生产版本

```bash
pnpm preview
```

## 🔐 认证和权限

### 用户角色

- **CUSTOMER**: 普通用户（无管理后台访问权限）
- **ADMIN**: 管理员（可管理产品、订单、优惠券）
- **SUPER_ADMIN**: 超级管理员（拥有所有权限，包括用户管理）

### 登录方式

使用邮箱和密码登录，系统会自动验证用户权限并显示相应的管理功能。

## 📊 数据管理

### 数据提供者

自定义数据提供者适配后端API格式，支持：

- RESTful API调用
- 自动认证头添加
- 错误处理和重试
- 分页和排序
- 筛选和搜索

### 实时数据

- 自动刷新仪表板数据
- 库存警告监控
- 优惠券状态检查
- 实时通知系统

## 🎨 界面特性

### 响应式设计

- 支持桌面、平板、手机多端适配
- 灵活的网格布局
- 自适应组件尺寸

### 主题定制

- 自定义颜色方案
- 统一的设计语言
- 优雅的动画效果
- 现代化的UI组件

### 用户体验

- 直观的操作界面
- 清晰的状态反馈
- 便捷的快捷操作
- 完善的错误提示

## 🔧 配置说明

### 环境变量配置

#### 主要配置项

```env
# API配置
VITE_API_URL=http://localhost:3000/api    # 后端API地址
VITE_API_TIMEOUT=10000                    # 请求超时时间(ms)
VITE_API_RETRY_COUNT=3                    # 重试次数

# 应用配置
VITE_APP_TITLE=电商平台管理后台           # 应用标题
VITE_APP_VERSION=1.0.0                   # 应用版本
VITE_APP_ENV=development                 # 应用环境

# 调试配置
VITE_DEBUG=true                          # 启用调试模式
VITE_LOG_LEVEL=debug                     # 日志级别
VITE_SHOW_PERFORMANCE=false              # 显示性能信息

# 功能开关
VITE_ENABLE_DARK_THEME=true              # 启用暗色主题
VITE_ENABLE_I18N=false                   # 启用国际化
VITE_ENABLE_EXPORT=true                  # 启用数据导出
VITE_ENABLE_REALTIME=false               # 启用实时通知
```

#### 环境特定配置

- `.env` - 默认配置
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置
- `.env.local` - 本地配置（不会被提交到git）

### API配置

在 `src/config/env.ts` 中统一管理所有环境变量配置。

### 主题配置

在 `src/App.tsx` 中自定义React Admin主题。

## 📈 性能优化

- 组件懒加载
- 数据缓存机制
- 虚拟滚动支持
- 图片懒加载
- 代码分割

## 🐛 故障排除

### 常见问题

1. **登录失败**

   - 检查后端API是否正常运行
   - 确认用户角色权限
   - 验证网络连接

2. **数据加载失败**

   - 检查API地址配置
   - 确认认证token有效性
   - 查看浏览器控制台错误

3. **权限不足**
   - 确认用户角色
   - 检查权限配置
   - 联系管理员分配权限

### 调试模式

开发环境下会显示详细的错误信息和调试数据。

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

本项目采用MIT许可证。

## 📞 支持

如有问题或建议，请联系开发团队或提交Issue。

---

**电商平台管理后台** - 让管理更简单，让数据更清晰！
