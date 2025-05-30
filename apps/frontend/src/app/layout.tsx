'use client';

import React, { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useAuth } from '../hooks/useAuth';
import './globals.css';

// 认证初始化组件
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { loadUser } = useAuth();

  useEffect(() => {
    // 应用启动时初始化认证状态
    loadUser();
  }, [loadUser]);

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <ConfigProvider
          locale={zhCN}
          theme={{
            token: {
              colorPrimary: '#1890ff',
              borderRadius: 6,
            },
          }}
        >
          <AuthInitializer>{children}</AuthInitializer>
        </ConfigProvider>
      </body>
    </html>
  );
}
