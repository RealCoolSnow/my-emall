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
  Select,
  Button,
  Space,
  Steps,
  message,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  CreditCardOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { CouponSelector } from '../../components/CouponSelector';
import { OrderSummary } from '../../components/OrderSummary';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import orderService from '../../services/orderService';
import orderCalculationService from '../../services/orderCalculationService';
import userCouponService from '../../services/userCouponService';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

export default function CheckoutPage() {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCoupons, setSelectedCoupons] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [calculatedOrder, setCalculatedOrder] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);

  const { items, total, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const handleGoBack = () => {
    // 尝试返回上一页，如果没有历史记录则返回购物车
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/cart');
    }
  };

  // 默认地址信息
  const defaultAddress = {
    street: '中关村大街1号',
    city: '北京市',
    state: '北京市',
    zipCode: '100080',
    country: 'CN',
  };

  // 使用默认地址
  const handleUseDefaultAddress = () => {
    form.setFieldsValue({
      shippingAddress: defaultAddress,
    });
    message.success('已填入默认地址');
  };

  // 获取推荐优惠券
  const loadRecommendedCoupons = async () => {
    // 确保购物车数据已加载
    if (items.length === 0 || total === 0) {
      return;
    }

    try {
      const orderItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const recommendation = await orderCalculationService.getRecommendedCoupons({
        orderItems,
        subtotal: total,
      });

      if (recommendation.recommendedCouponIds.length > 0) {
        // 获取推荐的优惠券详情
        const userCoupons = await userCouponService.getUserCoupons();
        const recommendedCoupons = userCoupons.filter(uc =>
          recommendation.recommendedCouponIds.includes(uc.couponId)
        );

        if (recommendedCoupons.length > 0) {
          // 自动选择第一个推荐的优惠券
          setSelectedCoupons([recommendedCoupons[0].coupon]);
          message.success(`已为您自动选择最优惠券: ${recommendedCoupons[0].coupon.name}`);
        }
      }
    } catch (error) {
      console.error('获取推荐优惠券失败:', error);
    }
  };

  // 计算订单价格
  const calculateOrderPrice = async (couponIds: string[] = []) => {
    setCalculating(true);
    try {
      const orderItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const result = await orderCalculationService.calculateOrder({
        orderItems,
        subtotal: total,
        shippingCost: 10,
        couponIds,
      });

      setCalculatedOrder(result);
    } catch (error) {
      message.error('计算订单价格失败');
      console.error('计算订单价格失败:', error);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      message.warning('购物车为空，请先添加商品');
      router.push('/');
      return;
    }
  }, [isAuthenticated, items, router]);

  // 单独的effect处理推荐优惠券，确保购物车数据已加载
  useEffect(() => {
    if (isAuthenticated && items.length > 0 && total > 0) {
      // 延迟执行，确保所有数据都已加载
      const timer = setTimeout(() => {
        loadRecommendedCoupons();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, items.length, total]);

  // 当选择的优惠券改变时重新计算价格（确保数据已加载）
  useEffect(() => {
    if (items.length > 0 && total > 0) {
      const couponIds = selectedCoupons.map(coupon => coupon.id);
      calculateOrderPrice(couponIds);
    }
  }, [selectedCoupons, items, total]);

  const handleSubmitOrder = async (values: any) => {
    console.log('提交订单开始，表单值:', values);
    console.log('购物车商品:', items);
    console.log('选择的优惠券:', selectedCoupons);
    console.log('当前用户信息:', user);

    setSubmitting(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: values.shippingAddress,
        paymentMethod: values.paymentMethod,
        couponCodes: selectedCoupons.map((coupon) => coupon.code),
        notes: values.notes,
      };

      console.log('发送的订单数据:', orderData);

      const order = await orderService.createOrder(orderData);

      console.log('订单创建成功:', order);
      message.success('订单创建成功！');
      clearCart();
      router.push(`/payment/${order.id}`);
    } catch (error) {
      console.error('创建订单失败:', error);
      message.error('创建订单失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    {
      title: '确认商品',
      icon: <HomeOutlined />,
    },
    {
      title: '填写信息',
      icon: <HomeOutlined />,
    },
    {
      title: '支付订单',
      icon: <CreditCardOutlined />,
    },
  ];

  if (!isAuthenticated || items.length === 0) {
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
            订单结算
          </Title>
        </Space>
      </Header>

      <Content style={{ padding: '50px', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Steps current={currentStep} style={{ marginBottom: 30 }}>
            {steps.map((step, index) => (
              <Step key={index} title={step.title} icon={step.icon} />
            ))}
          </Steps>

          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmitOrder}
                initialValues={{
                  paymentMethod: 'alipay',
                  shippingAddress: defaultAddress,
                }}
              >
                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: '100%' }}
                >
                  {/* 收货地址 */}
                  <Card
                    title="收货地址"
                    extra={
                      <Button
                        type="link"
                        size="small"
                        onClick={handleUseDefaultAddress}
                      >
                        使用默认地址
                      </Button>
                    }
                  >
                    <div style={{ marginBottom: 16 }}>
                      <Text type="secondary" style={{ fontSize: '14px' }}>
                        💡 已为您预填默认地址，您可以直接使用或修改为您的实际地址
                      </Text>
                    </div>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name={['shippingAddress', 'street']}
                          label="详细地址"
                          rules={[
                            { required: true, message: '请输入详细地址' },
                          ]}
                        >
                          <Input placeholder="街道、门牌号等" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name={['shippingAddress', 'city']}
                          label="城市"
                          rules={[{ required: true, message: '请输入城市' }]}
                        >
                          <Input placeholder="城市" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          name={['shippingAddress', 'state']}
                          label="省份"
                          rules={[{ required: true, message: '请输入省份' }]}
                        >
                          <Input placeholder="省份" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name={['shippingAddress', 'zipCode']}
                          label="邮编"
                          rules={[{ required: true, message: '请输入邮编' }]}
                        >
                          <Input placeholder="邮编" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name={['shippingAddress', 'country']}
                          label="国家"
                          rules={[{ required: true, message: '请选择国家' }]}
                        >
                          <Select placeholder="选择国家">
                            <Option value="CN">中国</Option>
                            <Option value="US">美国</Option>
                            <Option value="UK">英国</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>

                  {/* 支付方式 */}
                  <Card title="支付方式">
                    <Form.Item
                      name="paymentMethod"
                      rules={[{ required: true, message: '请选择支付方式' }]}
                    >
                      <Select placeholder="选择支付方式">
                        <Option value="credit_card">信用卡</Option>
                        <Option value="debit_card">借记卡</Option>
                        <Option value="alipay">支付宝</Option>
                        <Option value="wechat_pay">微信支付</Option>
                      </Select>
                    </Form.Item>
                  </Card>

                  {/* 优惠券 */}
                  <CouponSelector
                    orderTotal={total}
                    onCouponsChange={setSelectedCoupons}
                    selectedCoupons={selectedCoupons}
                  />

                  {/* 备注 */}
                  <Card title="订单备注">
                    <Form.Item name="notes">
                      <Input.TextArea
                        placeholder="如有特殊要求，请在此说明..."
                        rows={3}
                      />
                    </Form.Item>
                  </Card>
                </Space>
              </Form>
            </Col>

            <Col xs={24} lg={8}>
              <Space
                direction="vertical"
                size="large"
                style={{ width: '100%' }}
              >
                <OrderSummary
                  showActions={false}
                  selectedCoupons={selectedCoupons}
                  calculatedOrder={calculatedOrder}
                  calculating={calculating}
                />

                <Button
                  type="primary"
                  size="large"
                  block
                  loading={submitting}
                  onClick={() => form.submit()}
                >
                  提交订单
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
}
