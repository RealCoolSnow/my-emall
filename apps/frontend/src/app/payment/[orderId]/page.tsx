'use client';

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Card,
  Button,
  Space,
  Steps,
  Result,
  Spin,
  Radio,
  Form,
  Input,
  Row,
  Col,
  Divider,
  message,
  Progress,
} from 'antd';
import {
  ArrowLeftOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import orderService from '../../../services/orderService';
import paymentService from '../../../services/paymentService';
import { Order } from 'shared/types';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Step } = Steps;

export default function PaymentPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('alipay');
  const [paymentStep, setPaymentStep] = useState(0); // 0: 选择支付方式, 1: 支付中, 2: 支付结果
  const [paymentResult, setPaymentResult] = useState<
    'success' | 'failed' | null
  >(null);
  const [countdown, setCountdown] = useState(0);

  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();

  const orderId = params.orderId as string;

  const handleGoBack = () => {
    // 尝试返回上一页，如果没有历史记录则返回订单列表
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/orders');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadOrder = async () => {
      try {
        console.log('开始加载订单，订单ID:', orderId);
        setLoading(true);
        const orderData = await orderService.getOrder(orderId);
        console.log('订单数据加载成功:', orderData);
        setOrder(orderData);

        // 如果订单已支付，直接显示成功页面
        if (orderData.paymentStatus === 'PAID') {
          setPaymentStep(2);
          setPaymentResult('success');
        }
      } catch (error) {
        console.error('加载订单信息失败:', error);
        message.error('加载订单信息失败');
        router.push('/orders');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadOrder();
    }
  }, [orderId, isAuthenticated, router]);

  // 处理支付
  const handlePayment = async (mockResult?: 'success' | 'failed') => {
    if (!order) return;

    console.log('开始支付处理，订单ID:', order.id, '模拟结果:', mockResult);
    setPaymentStep(1);
    setCountdown(5);

    try {
      // 显示倒计时
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // 调用支付API
      const result = await paymentService.processPayment({
        orderId: order.id,
        paymentMethod: paymentMethod as any,
        amount: order.totalAmount,
        mockResult,
      });

      clearInterval(timer);
      setPaymentResult('success');
      setPaymentStep(2);
      message.success('支付成功！');

      console.log('支付成功，结果:', result);
      // 更新本地订单状态
      setOrder(result.order);
    } catch (error) {
      console.error('支付失败:', error);
      setPaymentResult('failed');
      setPaymentStep(2);
      message.error('支付失败，请重试');
    }
  };

  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`;
  };

  const paymentMethods = [
    { value: 'alipay', label: '支付宝', icon: '💰' },
    { value: 'wechat', label: '微信支付', icon: '💚' },
    { value: 'credit_card', label: '信用卡', icon: '💳' },
    { value: 'bank_card', label: '银行卡', icon: '🏦' },
  ];

  if (loading) {
    return (
      <Layout>
        <Content style={{ padding: '50px', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center', paddingTop: '100px' }}>
            <Spin size="large" />
          </div>
        </Content>
      </Layout>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <Layout>
      <Header
        style={{
          background: '#fff',
          padding: '0 50px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          height: '64px',
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
          >
            返回
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            订单支付
          </Title>
        </Space>
      </Header>

      <Content style={{ padding: '50px', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Steps current={paymentStep} style={{ marginBottom: 32 }}>
            <Step title="选择支付方式" icon={<CreditCardOutlined />} />
            <Step
              title="支付处理中"
              icon={paymentStep === 1 ? <LoadingOutlined /> : undefined}
            />
            <Step
              title="支付完成"
              icon={
                paymentResult === 'success' ? (
                  <CheckCircleOutlined />
                ) : paymentResult === 'failed' ? (
                  <CloseCircleOutlined />
                ) : undefined
              }
            />
          </Steps>

          {paymentStep === 0 && (
            <Row gutter={[24, 24]}>
              {/* 订单信息 */}
              <Col xs={24} md={12}>
                <Card title="订单信息">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>订单号：</Text>
                      <Text>{order.id}</Text>
                    </div>
                    <div>
                      <Text strong>订单金额：</Text>
                      <Title level={3} type="danger" style={{ margin: 0 }}>
                        {formatPrice(order.totalAmount)}
                      </Title>
                    </div>
                    <Divider />
                    <div>
                      <Text strong>商品清单：</Text>
                      {(order as any).orderItems?.map(
                        (item: any, index: number) => (
                          <div key={index} style={{ marginTop: 8 }}>
                            <Text>
                              {item.product?.name || '商品'} x {item.quantity}
                            </Text>
                          </div>
                        )
                      )}
                    </div>
                  </Space>
                </Card>
              </Col>

              {/* 支付方式选择 */}
              <Col xs={24} md={12}>
                <Card title="选择支付方式">
                  <Radio.Group
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {paymentMethods.map((method) => (
                        <Radio key={method.value} value={method.value}>
                          <Space>
                            <span style={{ fontSize: '20px' }}>
                              {method.icon}
                            </span>
                            <Text>{method.label}</Text>
                          </Space>
                        </Radio>
                      ))}
                    </Space>
                  </Radio.Group>

                  {paymentMethod === 'credit_card' && (
                    <Form layout="vertical" style={{ marginTop: 24 }}>
                      <Form.Item label="卡号">
                        <Input placeholder="请输入信用卡号" />
                      </Form.Item>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label="有效期">
                            <Input placeholder="MM/YY" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="CVV">
                            <Input placeholder="CVV" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form>
                  )}

                  <Button
                    type="primary"
                    size="large"
                    block
                    style={{ marginTop: 24 }}
                    onClick={() => handlePayment()}
                  >
                    确认支付 {formatPrice(order.totalAmount)}
                  </Button>

                  {/* 模拟支付按钮 - 仅用于测试 */}
                  <div style={{ marginTop: 16 }}>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: '12px',
                        display: 'block',
                        marginBottom: 8,
                      }}
                    >
                      🧪 测试模式：
                    </Text>
                    <Space>
                      <Button
                        size="small"
                        type="dashed"
                        onClick={() => handlePayment('success')}
                        style={{ color: '#52c41a', borderColor: '#52c41a' }}
                      >
                        模拟支付成功
                      </Button>
                      <Button
                        size="small"
                        type="dashed"
                        onClick={() => handlePayment('failed')}
                        style={{ color: '#ff4d4f', borderColor: '#ff4d4f' }}
                      >
                        模拟支付失败
                      </Button>
                    </Space>
                  </div>
                </Card>
              </Col>
            </Row>
          )}

          {paymentStep === 1 && (
            <Card style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
              <Title level={3} style={{ marginTop: 24 }}>
                支付处理中...
              </Title>
              <Text type="secondary">请稍候，正在处理您的支付请求</Text>
              <div
                style={{ marginTop: 24, maxWidth: 300, margin: '24px auto 0' }}
              >
                <Progress
                  percent={((5 - countdown) / 5) * 100}
                  status="active"
                  showInfo={false}
                />
                <Text>预计还需 {countdown} 秒</Text>
              </div>
            </Card>
          )}

          {paymentStep === 2 && (
            <Card>
              {paymentResult === 'success' ? (
                <Result
                  status="success"
                  title="支付成功！"
                  subTitle={`订单 ${order.id} 已成功支付 ${formatPrice(order.totalAmount)}`}
                  extra={[
                    <Button
                      type="primary"
                      key="orders"
                      onClick={() => router.push('/orders')}
                    >
                      查看订单
                    </Button>,
                    <Button key="home" onClick={() => router.push('/')}>
                      返回首页
                    </Button>,
                  ]}
                />
              ) : (
                <Result
                  status="error"
                  title="支付失败"
                  subTitle="很抱歉，您的支付未能成功处理，请重试或选择其他支付方式。"
                  extra={[
                    <Button
                      type="primary"
                      key="retry"
                      onClick={() => setPaymentStep(0)}
                    >
                      重新支付
                    </Button>,
                    <Button key="orders" onClick={() => router.push('/orders')}>
                      查看订单
                    </Button>,
                  ]}
                />
              )}
            </Card>
          )}
        </div>
      </Content>
    </Layout>
  );
}
