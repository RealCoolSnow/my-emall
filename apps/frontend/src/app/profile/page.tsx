'use client';

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  Space,
  Avatar,
  Tabs,
  Divider,
  message,
  Spin,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  LockOutlined,
  HistoryOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface UserProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  birthday?: string;
}

export default function ProfilePage() {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadUserInfo = async () => {
      try {
        setLoading(true);
        const userData = await authService.getCurrentUser();
        setUserInfo(userData);

        // 设置表单初始值
        form.setFieldsValue({
          username: userData.username,
          email: userData.email,
          ...userData.profile,
        });
      } catch (error) {
        message.error('加载用户信息失败');
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, [isAuthenticated, router, form]);

  const handleUpdateProfile = async (values: any) => {
    setUpdating(true);
    try {
      const { username, firstName, lastName, phone, address, birthday } =
        values;

      await authService.updateProfile({
        username,
        profile: {
          firstName,
          lastName,
          phone,
          address,
          birthday,
        },
      });

      message.success('个人信息更新成功');

      // 重新加载用户信息
      const userData = await authService.getCurrentUser();
      setUserInfo(userData);
    } catch (error) {
      message.error('更新个人信息失败');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (values: any) => {
    try {
      await authService.changePassword(
        values.currentPassword,
        values.newPassword
      );
      message.success('密码修改成功');
      passwordForm.resetFields();
    } catch (error) {
      message.error('密码修改失败');
    }
  };

  const handleLogout = () => {
    logout();
    message.success('已退出登录');
    router.push('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <Header
        style={{
          background: '#fff',
          padding: '0 50px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Space align="center" style={{ height: '100%' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
          >
            返回
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            个人中心
          </Title>
        </Space>
      </Header>

      <Content style={{ padding: '50px', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Spin spinning={loading}>
            <Row gutter={[24, 24]}>
              {/* 用户信息卡片 */}
              <Col xs={24} lg={8}>
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <Avatar size={80} icon={<UserOutlined />} />
                    <Title level={4} style={{ marginTop: 16 }}>
                      {userInfo?.username || '用户'}
                    </Title>
                    <Text type="secondary">{userInfo?.email}</Text>
                    <Divider />
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text>
                        <strong>角色：</strong>
                        {userInfo?.role === 'CUSTOMER' ? '普通用户' : '管理员'}
                      </Text>
                      <Text>
                        <strong>注册时间：</strong>
                        {userInfo?.createdAt
                          ? new Date(userInfo.createdAt).toLocaleDateString()
                          : '-'}
                      </Text>
                    </Space>
                    <Divider />
                    <Button danger onClick={handleLogout}>
                      退出登录
                    </Button>
                  </div>
                </Card>
              </Col>

              {/* 详细信息 */}
              <Col xs={24} lg={16}>
                <Card>
                  <Tabs defaultActiveKey="profile">
                    <TabPane
                      tab={
                        <span>
                          <EditOutlined />
                          个人信息
                        </span>
                      }
                      key="profile"
                    >
                      <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleUpdateProfile}
                      >
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              name="username"
                              label="用户名"
                              rules={[
                                { required: true, message: '请输入用户名' },
                              ]}
                            >
                              <Input />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="email" label="邮箱">
                              <Input disabled />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item name="firstName" label="姓">
                              <Input placeholder="请输入姓" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="lastName" label="名">
                              <Input placeholder="请输入名" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item name="phone" label="手机号">
                              <Input placeholder="请输入手机号" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="birthday" label="生日">
                              <Input type="date" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item name="address" label="地址">
                          <Input.TextArea
                            placeholder="请输入详细地址"
                            rows={3}
                          />
                        </Form.Item>

                        <Form.Item>
                          <Button
                            type="primary"
                            htmlType="submit"
                            loading={updating}
                          >
                            保存修改
                          </Button>
                        </Form.Item>
                      </Form>
                    </TabPane>

                    <TabPane
                      tab={
                        <span>
                          <LockOutlined />
                          修改密码
                        </span>
                      }
                      key="password"
                    >
                      <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handleChangePassword}
                      >
                        <Form.Item
                          name="currentPassword"
                          label="当前密码"
                          rules={[
                            { required: true, message: '请输入当前密码' },
                          ]}
                        >
                          <Input.Password placeholder="请输入当前密码" />
                        </Form.Item>

                        <Form.Item
                          name="newPassword"
                          label="新密码"
                          rules={[
                            { required: true, message: '请输入新密码' },
                            { min: 8, message: '密码至少8个字符' },
                          ]}
                        >
                          <Input.Password placeholder="请输入新密码" />
                        </Form.Item>

                        <Form.Item
                          name="confirmPassword"
                          label="确认新密码"
                          dependencies={['newPassword']}
                          rules={[
                            { required: true, message: '请确认新密码' },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (
                                  !value ||
                                  getFieldValue('newPassword') === value
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
                          <Input.Password placeholder="请再次输入新密码" />
                        </Form.Item>

                        <Form.Item>
                          <Button type="primary" htmlType="submit">
                            修改密码
                          </Button>
                        </Form.Item>
                      </Form>
                    </TabPane>

                    <TabPane
                      tab={
                        <span>
                          <HistoryOutlined />
                          订单历史
                        </span>
                      }
                      key="orders"
                    >
                      <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Text type="secondary">
                          订单历史功能请前往
                          <Button
                            type="link"
                            onClick={() => router.push('/orders')}
                          >
                            订单管理页面
                          </Button>
                        </Text>
                      </div>
                    </TabPane>
                  </Tabs>
                </Card>
              </Col>
            </Row>
          </Spin>
        </div>
      </Content>
    </Layout>
  );
}
