'use client';

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Divider,
  Alert,
  message,
  Tabs,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  LoginOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

const { Content } = Layout;
const { Title, Text, Link } = Typography;

export default function LoginPage() {
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, isAuthenticated } = useAuth();

  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect);
    }
  }, [isAuthenticated, router, redirect]);

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoginLoading(true);
    try {
      await login(values.email, values.password);
      message.success('登录成功！');
      router.push(redirect);
    } catch (error: any) {
      message.error(
        error.response?.data?.message || '登录失败，请检查邮箱和密码'
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (values: {
    email: string;
    username: string;
    password: string;
  }) => {
    setRegisterLoading(true);
    try {
      await register(values.email, values.username, values.password);
      message.success('注册成功！');
      router.push(redirect);
    } catch (error: any) {
      message.error(error.response?.data?.message || '注册失败，请重试');
    } finally {
      setRegisterLoading(false);
    }
  };

  // 设置测试账号
  const setTestAccount = () => {
    loginForm.setFieldsValue({
      email: 'zhang.wei@example.com',
      password: 'user123',
    });
  };

  // 页面加载时自动填入普通用户账号
  useEffect(() => {
    setTestAccount();
  }, []);

  if (isAuthenticated) {
    return null;
  }

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Content
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
        }}
      >
        <Card
          style={{
            maxWidth: 450,
            width: '100%',
            borderRadius: 12,
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ padding: '32px' }}>
            {/* 标题 */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: 24,
                }}
              >
                👑
              </div>
              <Title level={2} style={{ color: '#333', marginBottom: 8, fontWeight: 600 }}>
                优选商城
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                品质生活，从这里开始
              </Text>
            </div>

            {/* 测试账号提示 */}
            <Alert
              message="测试账号"
              description={
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <strong>测试用户:</strong> zhang.wei@example.com / user123
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      💡 账号已自动填入，您可以直接点击登录按钮
                    </Text>
                  </div>
                  <Button size="small" onClick={setTestAccount} type="dashed">
                    重新填入账号
                  </Button>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              centered
              items={[
                {
                  key: 'login',
                  label: '登录',
                  children: (
                    <Form
                      form={loginForm}
                      name="login"
                      onFinish={handleLogin}
                      layout="vertical"
                      size="large"
                    >
                      <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[
                          { required: true, message: '请输入邮箱' },
                          { type: 'email', message: '请输入有效的邮箱地址' },
                        ]}
                      >
                        <Input
                          prefix={<MailOutlined />}
                          placeholder="请输入邮箱"
                        />
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
                          loading={loginLoading}
                          block
                          size="large"
                          icon={<LoginOutlined />}
                          style={{
                            height: 48,
                            borderRadius: 8,
                            fontSize: '16px',
                          }}
                        >
                          {loginLoading ? '登录中...' : '登录'}
                        </Button>
                      </Form.Item>
                    </Form>
                  ),
                },
                {
                  key: 'register',
                  label: '注册',
                  children: (
                    <Form
                      form={registerForm}
                      name="register"
                      onFinish={handleRegister}
                      layout="vertical"
                      size="large"
                    >
                      <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[
                          { required: true, message: '请输入邮箱' },
                          { type: 'email', message: '请输入有效的邮箱地址' },
                        ]}
                      >
                        <Input
                          prefix={<MailOutlined />}
                          placeholder="请输入邮箱"
                        />
                      </Form.Item>

                      <Form.Item
                        name="username"
                        label="用户名"
                        rules={[
                          { required: true, message: '请输入用户名' },
                          { min: 3, message: '用户名至少3个字符' },
                        ]}
                      >
                        <Input
                          prefix={<UserOutlined />}
                          placeholder="请输入用户名"
                        />
                      </Form.Item>

                      <Form.Item
                        name="password"
                        label="密码"
                        rules={[
                          { required: true, message: '请输入密码' },
                          { min: 6, message: '密码至少6个字符' },
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined />}
                          placeholder="请输入密码"
                        />
                      </Form.Item>

                      <Form.Item
                        name="confirmPassword"
                        label="确认密码"
                        dependencies={['password']}
                        rules={[
                          { required: true, message: '请确认密码' },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (
                                !value ||
                                getFieldValue('password') === value
                              ) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                new Error('两次输入的密码不一致')
                              );
                            },
                          }),
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined />}
                          placeholder="请再次输入密码"
                        />
                      </Form.Item>

                      <Form.Item style={{ marginBottom: 0 }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={registerLoading}
                          block
                          size="large"
                          icon={<UserAddOutlined />}
                          style={{
                            height: 48,
                            borderRadius: 8,
                            fontSize: '16px',
                          }}
                        >
                          {registerLoading ? '注册中...' : '注册'}
                        </Button>
                      </Form.Item>
                    </Form>
                  ),
                },
              ]}
            />

            <Divider />

            {/* 底部信息 */}
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                电商平台 v1.0.0
              </Text>
              <div>
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  测试环境 - 仅供演示使用
                </Text>
              </div>
            </div>
          </div>
        </Card>
      </Content>
    </Layout>
  );
}
