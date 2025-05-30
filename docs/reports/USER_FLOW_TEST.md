# 用户流程测试指南

## 测试环境准备

### 1. 启动服务
```bash
# 启动后端服务
cd apps/backend
pnpm run dev

# 启动前端服务
cd apps/frontend
pnpm run dev
```

### 2. 测试账号
- **管理员账号**: admin@emall.com / admin123
- **普通用户账号**: 
  - zhang.wei@example.com / user123
  - li.ming@example.com / user123
  - wang.fang@example.com / user123
  - chen.jie@example.com / user123

### 3. 测试优惠券代码
- `WELCOME10` - 新用户欢迎券 (10%折扣)
- `SAVE50` - 满减券 (满500减50)
- `FREESHIP` - 免运费券 (满200免运费)
- `SUMMER20` - 夏季大促券 (20%折扣)

## 完整用户流程测试

### 步骤1: 用户登录
1. 访问 `http://localhost:3000`
2. 点击右上角"登录"按钮
3. 进入登录页面 `/login`
4. 可以使用"填入用户"按钮快速填入测试账号
5. 输入邮箱和密码，点击登录
6. 登录成功后自动跳转到首页
7. 验证导航栏显示用户名和"我的优惠券"链接

**预期结果**: 
- 登录成功，页面跳转到首页
- 导航栏显示用户信息和相关链接
- 右上角显示用户名和退出按钮

### 步骤2: 查看用户优惠券
1. 点击导航栏"我的优惠券"
2. 进入优惠券管理页面 `/coupons`
3. 查看统计信息（总计、可用、已使用、已过期）
4. 查看已分配的优惠券列表
5. 尝试领取新的优惠券（输入代码如 `SUMMER20`）

**预期结果**:
- 显示用户已有的3张优惠券
- 统计信息正确显示
- 可以成功领取新的优惠券
- 优惠券信息完整（名称、类型、有效期等）

### 步骤3: 浏览商品并加入购物车
1. 返回首页或直接访问 `http://localhost:3000`
2. 浏览商品列表
3. 验证商品图片居中显示
4. 点击商品的"加入购物车"按钮
5. 观察购物车图标的数量变化
6. 添加多个不同商品到购物车

**预期结果**:
- 商品图片正确居中显示
- 成功添加商品到购物车
- 购物车图标显示正确的商品数量
- 显示"商品已添加到购物车"的成功提示

### 步骤4: 查看和管理购物车
1. 点击导航栏的"购物车"按钮
2. 进入购物车页面 `/cart`
3. 验证商品图片居中显示
4. 修改商品数量
5. 删除某个商品
6. 查看总价计算是否正确

**预期结果**:
- 购物车页面正确显示所有商品
- 商品图片居中显示
- 可以正常修改数量和删除商品
- 总价计算正确
- 操作后有相应的提示信息

### 步骤5: 结算和使用优惠券
1. 在购物车页面点击"去结算"
2. 进入结算页面 `/checkout`
3. 查看订单摘要
4. 选择可用的优惠券
5. 验证折扣计算是否正确
6. 填写收货地址信息
7. 选择支付方式

**预期结果**:
- 结算页面正确显示商品信息
- 可以选择和应用优惠券
- 折扣金额计算正确
- 最终金额正确显示

### 步骤6: 模拟支付
1. 在结算页面点击"提交订单"
2. 创建订单成功
3. 进入支付页面或模拟支付
4. 选择支付方式（支付宝、微信等）
5. 点击"模拟支付成功"或"模拟支付失败"
6. 查看支付结果

**预期结果**:
- 订单创建成功
- 支付流程正常
- 支付成功后订单状态更新
- 使用的优惠券状态更新为已使用

### 步骤7: 查看订单历史
1. 完成支付后，点击"我的订单"
2. 查看订单列表
3. 点击查看订单详情
4. 验证订单信息、优惠券使用情况、支付状态

**预期结果**:
- 订单列表正确显示
- 订单详情信息完整
- 优惠券使用记录正确
- 支付状态正确显示

## API 测试

### 购物车 API 测试
```bash
# 获取购物车
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/cart

# 添加商品到购物车
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <token>" \
  -d '{"productId":"<product_id>","quantity":1}' \
  http://localhost:3001/api/cart

# 更新购物车商品数量
curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer <token>" \
  -d '{"quantity":2}' \
  http://localhost:3001/api/cart/<product_id>

# 删除购物车商品
curl -X DELETE -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/cart/<product_id>
```

### 用户优惠券 API 测试
```bash
# 获取用户优惠券
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/user-coupons

# 获取可用优惠券
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/user-coupons/available

# 领取优惠券
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <token>" \
  -d '{"couponCode":"SUMMER20"}' \
  http://localhost:3001/api/user-coupons/claim

# 获取优惠券统计
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/user-coupons/stats
```

## 常见问题排查

### 1. 登录失败
- 检查后端服务是否正常运行
- 验证数据库连接
- 确认测试账号是否存在

### 2. 购物车功能异常
- 检查购物车API是否正常响应
- 验证用户认证状态
- 查看浏览器控制台错误信息

### 3. 优惠券无法使用
- 确认优惠券是否在有效期内
- 检查订单金额是否满足最低使用条件
- 验证优惠券是否已被使用

### 4. 支付流程问题
- 确认订单创建是否成功
- 检查支付API响应
- 验证订单状态更新

## 性能测试要点

1. **页面加载速度**: 首页、商品列表、购物车页面加载时间
2. **图片加载**: 商品图片加载速度和显示效果
3. **API响应时间**: 购物车操作、优惠券查询等API响应速度
4. **并发测试**: 多用户同时操作购物车和下单

## 浏览器兼容性测试

测试以下浏览器的兼容性：
- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 移动端测试

1. 响应式布局测试
2. 触摸操作测试
3. 移动端性能测试
4. 不同屏幕尺寸适配测试

## 测试完成检查清单

- [ ] 用户登录/注册功能正常
- [ ] 商品图片居中显示正确
- [ ] 购物车增删改查功能正常
- [ ] 优惠券查看、领取、使用功能正常
- [ ] 订单创建和支付流程正常
- [ ] 所有API响应正常
- [ ] 前端错误处理正确
- [ ] 用户体验流畅
- [ ] 数据持久化正常
- [ ] 权限控制正确
