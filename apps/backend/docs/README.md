# Backend Documentation

本目录包含电商平台后端API的相关文档。

## 文档列表

### 📚 [API接口文档](./api-documentation.md)

完整的REST API接口文档，包括：

- 所有API端点的详细说明
- 请求/响应格式
- 认证和权限要求
- 错误代码参考
- 使用示例

### 🧪 [测试报告](./test-report.md)

Jest测试执行报告，包括：

- 测试结果总结
- 已通过的测试用例
- 需要修复的问题
- 代码覆盖率统计
- 修复建议和优先级

## 快速导航

### API模块

- **认证模块**: 用户注册、登录、权限验证
- **产品模块**: 产品CRUD、搜索、分类
- **订单模块**: 订单管理、状态跟踪
- **优惠券模块**: 优惠券创建、应用、验证

### 开发相关

- **测试配置**: Jest + TypeScript
- **数据库**: SQLite + Prisma ORM
- **认证方式**: JWT Bearer Token
- **API格式**: RESTful JSON API

## 使用说明

1. **查看API文档**: 阅读 `api-documentation.md` 了解所有可用的API端点
2. **运行测试**: 查看 `test-report.md` 了解当前测试状态
3. **开发调试**: 使用文档中的示例进行API调用测试

## 更新说明

文档会随着代码更新而同步更新。如发现文档与实际API不符，请及时反馈。

## 联系方式

如有问题或建议，请联系开发团队。
