import React from 'react';
import { Admin, Resource } from 'react-admin';
import { dataProvider, authProvider } from './dataProvider';
import { APP_CONFIG, ENV_UTILS, Logger } from './config/env';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import CustomLayout from './components/CustomLayout';

// 导入各模块组件
import ProductManagement from './components/ProductManagement';
import CouponEditor from './components/CouponEditor';
import OrderManagement from './components/OrderManagement';
import UserManagement from './components/UserManagement';

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
      loginPage={LoginPage}
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
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: '#ffffff',
                color: '#333333',
              },
            },
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
