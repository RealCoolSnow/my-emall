import React, { useState } from 'react';
import { useLogin, useNotify } from 'react-admin';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Space,
  Divider,
} from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { APP_CONFIG, ENV_UTILS } from '../config/env';

const { Title, Text } = Typography;

/**
 * 自定义登录页面组件
 * 预填默认管理员账号密码
 */
export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const login = useLogin();
  const notify = useNotify();
  const [form] = Form.useForm();

  // 设置默认值
  React.useEffect(() => {
    form.setFieldsValue({
      username: 'admin@emall.com',
      password: 'admin123',
    });
  }, [form]);

  const handleSubmit = async (values: {
    username: string;
    password: string;
  }) => {
    setLoading(true);

    try {
      await login(values);
    } catch (error) {
      notify('登录失败，请检查用户名和密码', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <Card
        style={{
          maxWidth: 400,
          width: '100%',
          borderRadius: 12,
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ padding: '32px' }}>
          {/* 标题 */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2} style={{ color: '#1976d2', marginBottom: 8 }}>
              🛒 {APP_CONFIG.TITLE}
            </Title>
            <Text type="secondary">
              管理员登录
              {ENV_UTILS.isDevelopment() && (
                <span style={{ color: '#ff9800', marginLeft: 8 }}>
                  (开发环境)
                </span>
              )}
            </Text>
          </div>

          {/* 开发环境提示 */}
          {ENV_UTILS.isDevelopment() && (
            <Alert
              message="默认管理员账号"
              description={
                <div>
                  <strong>邮箱:</strong> admin@emall.com
                  <br />
                  <strong>密码:</strong> admin123
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          {/* 登录表单 */}
          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="请输入邮箱" />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                icon={<LoginOutlined />}
                style={{
                  height: 48,
                  borderRadius: 8,
                  fontSize: '16px',
                  background:
                    'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  border: 'none',
                }}
              >
                {loading ? '登录中...' : '登录'}
              </Button>
            </Form.Item>
          </Form>

          <Divider />

          {/* 底部信息 */}
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              版本 {APP_CONFIG.VERSION}
            </Text>
            {ENV_UTILS.isDevelopment() && (
              <div>
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  开发环境 - 仅供测试使用
                </Text>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
