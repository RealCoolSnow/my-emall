'use client';

import React, { useEffect } from 'react';
import { Layout, Typography, Row, Col, Button, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Cart } from '../../components/Cart';
import { OrderSummary } from '../../components/OrderSummary';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function CartPage() {
  const { loadCart, items } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    }
  }, [isAuthenticated, loadCart]);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }
    router.push('/checkout');
  };

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
            购物车
          </Title>
        </Space>
      </Header>

      <Content style={{ padding: '50px', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Cart />
            </Col>
            <Col xs={24} lg={8}>
              <OrderSummary showActions={true} onCheckout={handleCheckout} />
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
}
