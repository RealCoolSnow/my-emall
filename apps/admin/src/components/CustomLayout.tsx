import React, { useState, useEffect } from 'react';
import {
  Layout,
  AppBar,
  useSidebarState,
  CheckForApplicationUpdate,
  Error,
  Loading,
  UserMenu,
  useAuthProvider,
  useAuthState,
} from 'react-admin';
import { Avatar, Dropdown, Space } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import CustomSidebar from './CustomSidebar';
import { APP_CONFIG, ENV_UTILS } from '../config/env';

/**
 * 自定义用户菜单组件
 */
const CustomUserMenu = () => {
  const authProvider = useAuthProvider();
  const { identity, isLoading } = useAuthState();
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    if (identity) {
      setUserInfo(identity);
    }
  }, [identity]);

  const handleLogout = async () => {
    try {
      await authProvider.logout({});
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => {
        // 这里可以添加跳转到个人资料页面的逻辑
        console.log('跳转到个人资料');
      },
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => {
        // 这里可以添加跳转到设置页面的逻辑
        console.log('跳转到设置');
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  if (isLoading) {
    return (
      <Space style={{ padding: '0 16px' }}>
        <Avatar size="small" icon={<UserOutlined />} />
        <span style={{ color: '#666', fontSize: '14px' }}>加载中...</span>
      </Space>
    );
  }

  const displayName = userInfo?.username || userInfo?.email || '管理员';
  const roleText =
    userInfo?.role === 'ADMIN'
      ? '管理员'
      : userInfo?.role === 'SUPER_ADMIN'
        ? '超级管理员'
        : '用户';

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement="bottomRight"
      trigger={['click']}
    >
      <div
        style={{
          cursor: 'pointer',
          padding: '8px 16px',
          borderRadius: '8px',
          transition: 'background-color 0.2s ease-in-out',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f5f5f5';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Avatar
          size={32}
          icon={<UserOutlined />}
          style={{
            backgroundColor: '#1976d2',
            border: '2px solid #e3f2fd',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <span
            style={{
              color: '#333',
              fontSize: '14px',
              fontWeight: '500',
              lineHeight: '1.2',
            }}
          >
            {displayName}
          </span>
          <span
            style={{
              color: '#999',
              fontSize: '12px',
              lineHeight: '1.2',
            }}
          >
            {roleText}
          </span>
        </div>
      </div>
    </Dropdown>
  );
};

/**
 * 自定义应用栏
 */
const CustomAppBar = () => {
  const [open] = useSidebarState();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: open ? 240 : 64,
        right: 0,
        height: '64px',
        backgroundColor: '#fff',
        color: '#333',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #f0f0f0',
        transition: 'left 0.2s ease-in-out',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}
    >
      {/* 标题 */}
      <div
        style={{
          fontSize: '1.2rem',
          fontWeight: 'bold',
          color: '#1976d2',
        }}
      >
        🛒 {APP_CONFIG.TITLE}
        {ENV_UTILS.isDevelopment() && (
          <span style={{ fontSize: '0.8rem', marginLeft: '8px', opacity: 0.7 }}>
            (开发环境)
          </span>
        )}
      </div>

      {/* 用户菜单 */}
      <CustomUserMenu />
    </div>
  );
};

/**
 * 简单的错误边界组件
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#fff5f5',
            border: '1px solid #fed7d7',
            borderRadius: '8px',
            margin: '20px',
          }}
        >
          <h2 style={{ color: '#e53e3e', marginBottom: '16px' }}>出现错误</h2>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            {this.state.error?.message || '应用程序遇到了一个错误'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            重新加载
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 自定义布局组件
 */
export const CustomLayout = (props: any) => {
  const [open] = useSidebarState();

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <CustomSidebar />

      {/* 顶部应用栏 */}
      <CustomAppBar />

      {/* 主内容区域 */}
      <div
        style={{
          marginLeft: open ? 240 : 64,
          marginTop: 64,
          transition: 'margin-left 0.2s ease-in-out',
          minHeight: 'calc(100vh - 64px)',
          padding: '24px',
          backgroundColor: '#f5f5f5',
        }}
      >
        <ErrorBoundary>
          <React.Suspense fallback={<Loading />}>
            {props.children}
          </React.Suspense>
        </ErrorBoundary>
      </div>

      {/* 应用更新检查 */}
      <CheckForApplicationUpdate />
    </div>
  );
};

export default CustomLayout;
