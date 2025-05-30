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

  const handleGoBack = () => {
    // 尝试返回上一页，如果没有历史记录则返回首页
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

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
    <Layout style={{ background: '#f5f5f5' }}>
      <Header
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '0 24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          height: '70px',
          lineHeight: 'normal',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Space align="center" style={{ height: '100%' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleGoBack}
            style={{
              color: '#fff',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
            }}
          >
            返回
          </Button>
          <Title level={3} style={{ margin: 0, color: '#fff', fontWeight: 600 }}>
            🛒 购物车
          </Title>
          {items.length > 0 && (
            <span
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                backdropFilter: 'blur(10px)',
              }}
            >
              {items.length} 件商品
            </span>
          )}
        </Space>
      </Header>

      <Content style={{ padding: '24px', minHeight: 'calc(100vh - 70px)' }}>
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
