import React from 'react';
import {
  MenuItemLink,
  usePermissions,
  useSidebarState,
} from 'react-admin';
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  GiftOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

/**
 * 菜单项配置
 */
const menuItems = [
  {
    to: '/',
    primaryText: '仪表板',
    icon: <DashboardOutlined />,
    permission: null,
  },
  {
    to: '/products',
    primaryText: '产品管理',
    icon: <ShoppingOutlined />,
    permission: null,
  },
  {
    to: '/orders',
    primaryText: '订单管理',
    icon: <ShoppingCartOutlined />,
    permission: null,
  },
  {
    to: '/coupons',
    primaryText: '优惠券管理',
    icon: <GiftOutlined />,
    permission: null,
  },
  {
    to: '/users',
    primaryText: '用户管理',
    icon: <UserOutlined />,
    permission: ['ADMIN', 'SUPER_ADMIN'],
  },
];

/**
 * 自定义菜单组件
 */
const CustomMenu = () => {
  const { permissions } = usePermissions();
  const [open] = useSidebarState();

  return (
    <div style={{ padding: open ? '8px' : '8px 4px' }}>
      {menuItems.map((item) => {
        // 检查权限
        if (item.permission && !item.permission.includes(permissions)) {
          return null;
        }

        const menuItem = (
          <MenuItemLink
            key={item.to}
            to={item.to}
            primaryText={item.primaryText}
            leftIcon={item.icon}
            style={{
              borderRadius: '8px',
              margin: '4px 0',
              transition: 'all 0.2s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              padding: open ? '12px 16px' : '12px 8px',
              justifyContent: open ? 'flex-start' : 'center',
            }}
          />
        );

        // 如果菜单收缩，使用 Tooltip 显示文字
        if (!open) {
          return (
            <Tooltip
              key={item.to}
              title={item.primaryText}
              placement="right"
              mouseEnterDelay={0.3}
            >
              {menuItem}
            </Tooltip>
          );
        }

        return menuItem;
      })}
    </div>
  );
};

/**
 * 自定义侧边栏组件
 */
export const CustomSidebar = () => {
  const [open, setOpen] = useSidebarState();

  const toggleSidebar = () => {
    setOpen(!open);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: open ? 240 : 64,
        height: '100vh',
        transition: 'width 0.2s ease-in-out',
        backgroundColor: '#fff',
        borderRight: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        zIndex: 1300,
      }}
    >
      {/* 顶部Logo和折叠按钮 */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          minHeight: '64px',
        }}
      >
        {open && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1976d2',
            }}
          >
            🛒 管理后台
          </div>
        )}
        <Button
          type="text"
          icon={open ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          onClick={toggleSidebar}
          style={{
            border: 'none',
            boxShadow: 'none',
            color: '#666',
          }}
        />
      </div>

      {/* 菜单内容 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <CustomMenu />
      </div>

      {/* 底部信息 */}
      {open && (
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid #f0f0f0',
            fontSize: '12px',
            color: '#999',
            textAlign: 'center',
          }}
        >
          <div>电商平台管理系统</div>
          <div>v1.0.0</div>
        </div>
      )}
    </div>
  );
};

export default CustomSidebar;
