'use client';

import React, { useEffect } from 'react';
import {
  Layout,
  Typography,
  Space,
  Input,
  Row,
  Col,
  Card,
  Spin,
  Button,
} from 'antd';
import {
  SearchOutlined,
  ShoppingCartOutlined,
  GiftOutlined,
  LoginOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { ProductList } from '../components/ProductList';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

export default function Home() {
  const { searchProducts } = useProducts();
  const { loadCart, itemCount } = useCart();
  const { loadUser, isAuthenticated, user, logout } = useAuth();

  // 初始化数据
  useEffect(() => {
    loadUser();
    if (isAuthenticated) {
      loadCart();
    }
  }, [isAuthenticated, loadUser, loadCart]);

  const handleSearch = (value: string) => {
    searchProducts(value);
  };

  return (
    <Layout>
      <Header
        style={{
          background: '#fff',
          padding: '0 50px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          height: '64px',
          lineHeight: 'normal',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Row
          justify="space-between"
          align="middle"
          style={{ height: '100%', width: '100%' }}
        >
          <Col>
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
              电商平台
            </Title>
          </Col>
          <Col
            flex="auto"
            style={{
              maxWidth: 600,
              margin: '0 50px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search
              placeholder="搜索商品..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col>
            <Space size="large">
              <Button type="text" href="/cart" style={{ padding: '4px 8px' }}>
                <Space>
                  <ShoppingCartOutlined style={{ fontSize: 20 }} />
                  <Text>购物车</Text>
                  {itemCount > 0 && (
                    <span
                      style={{
                        background: '#ff4d4f',
                        color: 'white',
                        borderRadius: '50%',
                        padding: '2px 6px',
                        fontSize: '12px',
                        minWidth: '18px',
                        textAlign: 'center',
                      }}
                    >
                      {itemCount}
                    </span>
                  )}
                </Space>
              </Button>

              {isAuthenticated ? (
                <>
                  <Button
                    type="text"
                    href="/coupons"
                    style={{ padding: '4px 8px' }}
                  >
                    <Space>
                      <GiftOutlined style={{ fontSize: 20 }} />
                      <Text>我的优惠券</Text>
                    </Space>
                  </Button>
                  <Button type="text" href="/orders">
                    我的订单
                  </Button>
                  <Button type="text" href="/profile">
                    <Space>
                      <UserOutlined />
                      <Text>{user?.username || '个人中心'}</Text>
                    </Space>
                  </Button>
                  <Button
                    type="text"
                    onClick={logout}
                    style={{ padding: '4px 8px' }}
                  >
                    <Space>
                      <LogoutOutlined />
                      <Text>退出</Text>
                    </Space>
                  </Button>
                </>
              ) : (
                <Button type="primary" href="/login">
                  <Space>
                    <LoginOutlined />
                    <Text>登录</Text>
                  </Space>
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Header>

      <Content style={{ padding: '50px', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Title level={2}>精选商品</Title>
              <Text type="secondary">发现优质商品，享受购物乐趣</Text>
            </div>

            <ProductList pageSize={12} />
          </Space>
        </div>
      </Content>
    </Layout>
  );
}
