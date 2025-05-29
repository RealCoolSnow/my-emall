import React from 'react';
import {
  Admin,
  Resource,
  Layout,
  AppBar,
  Menu,
  MenuItemLink,
  usePermissions,
} from 'react-admin';
import { dataProvider, authProvider } from './dataProvider';
import { APP_CONFIG, ENV_UTILS, Logger } from './config/env';
import Dashboard from './components/Dashboard';

// 导入各模块组件
import ProductManagement from './components/ProductManagement';
import CouponEditor from './components/CouponEditor';
import OrderManagement from './components/OrderManagement';
import UserManagement from './components/UserManagement';

/**
 * 自定义菜单组件
 * 根据用户权限显示不同的菜单项
 */
const CustomMenu = () => {
  const { permissions } = usePermissions();

  return (
    <Menu>
      <MenuItemLink to="/" primaryText="仪表板" leftIcon="📊" />
      <MenuItemLink to="/products" primaryText="产品管理" leftIcon="📦" />
      <MenuItemLink to="/orders" primaryText="订单管理" leftIcon="📋" />
      <MenuItemLink to="/coupons" primaryText="优惠券管理" leftIcon="🎫" />

      {/* 只有管理员和超级管理员可以看到用户管理 */}
      {(permissions === 'ADMIN' || permissions === 'SUPER_ADMIN') && (
        <MenuItemLink to="/users" primaryText="用户管理" leftIcon="👥" />
      )}
    </Menu>
  );
};

/**
 * 自定义应用栏
 */
const CustomAppBar = () => (
  <AppBar>
    <div
      style={{
        flex: 1,
        textAlign: 'center',
        fontSize: '1.2rem',
        fontWeight: 'bold',
      }}
    >
      🛒 {APP_CONFIG.TITLE}
      {ENV_UTILS.isDevelopment() && (
        <span style={{ fontSize: '0.8rem', marginLeft: '8px', opacity: 0.7 }}>
          (开发环境)
        </span>
      )}
    </div>
  </AppBar>
);

/**
 * 自定义布局
 */
const CustomLayout = (props: any) => (
  <Layout {...props} appBar={CustomAppBar} menu={CustomMenu} />
);

/**
 * 主应用组件
 */
function App() {
  // 在应用启动时记录环境信息
  React.useEffect(() => {
    Logger.info('Application started', {
      title: APP_CONFIG.TITLE,
      version: APP_CONFIG.VERSION,
      env: APP_CONFIG.ENV,
      envInfo: ENV_UTILS.getEnvInfo(),
    });
  }, []);

  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      dashboard={Dashboard}
      layout={CustomLayout}
      title={APP_CONFIG.TITLE}
      theme={{
        palette: {
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
        },
      }}
    >
      {/* 产品管理 */}
      <Resource
        name="products"
        list={ProductManagement.list}
        create={ProductManagement.create}
        edit={ProductManagement.edit}
        show={ProductManagement.show}
        options={{ label: '产品管理' }}
      />

      {/* 订单管理 */}
      <Resource
        name="orders"
        list={OrderManagement.list}
        edit={OrderManagement.edit}
        show={OrderManagement.show}
        options={{ label: '订单管理' }}
      />

      {/* 优惠券管理 */}
      <Resource
        name="coupons"
        list={CouponEditor.list}
        create={CouponEditor.create}
        edit={CouponEditor.edit}
        show={CouponEditor.show}
        options={{ label: '优惠券管理' }}
      />

      {/* 用户管理 - 需要管理员权限 */}
      <Resource
        name="users"
        list={UserManagement.list}
        create={UserManagement.create}
        edit={UserManagement.edit}
        show={UserManagement.show}
        options={{ label: '用户管理' }}
      />
    </Admin>
  );
}

export default App;
