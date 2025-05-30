'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Divider,
  Space,
  List,
  Button,
  Spin,
  message,
} from 'antd';
import { ShoppingCartOutlined, GiftOutlined } from '@ant-design/icons';
import { useCart } from '../hooks/useCart';
import { useCoupons } from '../hooks/useCoupons';
import { CartItem } from '../types';

const { Title, Text } = Typography;

export interface OrderSummaryProps {
  showActions?: boolean;
  onCheckout?: () => void;
  selectedCoupons?: any[];
  calculatedOrder?: any;
  calculating?: boolean;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  showActions = true,
  onCheckout,
  selectedCoupons = [],
  calculatedOrder,
  calculating = false,
}) => {
  const { items, total } = useCart();
  const { calculateDiscount } = useCoupons();

  const [localCalculating, setLocalCalculating] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(total);

  // 使用传入的计算结果或默认值
  const shippingCost = calculatedOrder?.shippingCost || 10;
  const actualDiscount = calculatedOrder?.couponDiscount || discount;
  const actualFinalAmount = calculatedOrder?.finalAmount || finalAmount;
  const isCalculating = calculating || localCalculating;

  // 计算优惠券折扣（仅在没有传入计算结果时使用）
  useEffect(() => {
    if (calculatedOrder) {
      // 如果有传入的计算结果，直接使用
      return;
    }

    const calculateOrderDiscount = async () => {
      if (selectedCoupons.length === 0) {
        setDiscount(0);
        setFinalAmount(total + shippingCost);
        return;
      }

      setLocalCalculating(true);
      try {
        const orderData = {
          orderItems: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
          subtotal: total,
          shippingCost,
          userId: 'current-user-id', // 实际项目中应该从认证状态获取
        };

        const result = await calculateDiscount(orderData);
        setDiscount(result.discount);
        setFinalAmount(result.finalAmount);
      } catch (error) {
        message.error('计算优惠失败');
        setDiscount(0);
        setFinalAmount(total + shippingCost);
      } finally {
        setLocalCalculating(false);
      }
    };

    calculateOrderDiscount();
  }, [selectedCoupons, total, items, calculateDiscount, calculatedOrder]);

  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`;
  };

  return (
    <Card
      title={
        <Space>
          <ShoppingCartOutlined />
          <Title level={4} style={{ margin: 0 }}>
            订单摘要
          </Title>
        </Space>
      }
    >
      <Spin spinning={isCalculating}>
        {/* 商品列表 */}
        <List
          size="small"
          dataSource={items}
          renderItem={(item: CartItem) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <Text ellipsis style={{ maxWidth: 200 }}>
                      {item.product.name}
                    </Text>
                    <Text>x{item.quantity}</Text>
                  </div>
                }
              />
              <Text strong>
                {formatPrice(item.product.price * item.quantity)}
              </Text>
            </List.Item>
          )}
        />

        <Divider />

        {/* 费用明细 */}
        <Space direction="vertical" style={{ width: '100%' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <Text>商品小计:</Text>
            <Text>{formatPrice(total)}</Text>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <Text>运费:</Text>
            <Text>{formatPrice(shippingCost)}</Text>
          </div>

          {selectedCoupons.length > 0 && (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <Space>
                  <GiftOutlined />
                  <Text>优惠券折扣:</Text>
                </Space>
                <Text type="success">-{formatPrice(actualDiscount)}</Text>
              </div>

              {/* 显示使用的优惠券 */}
              <div style={{ marginLeft: 20 }}>
                {selectedCoupons.map((coupon: any) => (
                  <div key={coupon.id}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {coupon.name}
                    </Text>
                  </div>
                ))}
              </div>
            </>
          )}

          <Divider style={{ margin: '12px 0' }} />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <Title level={4} style={{ margin: 0 }}>
              总计:
            </Title>
            <Title level={4} type="danger" style={{ margin: 0 }}>
              {formatPrice(actualFinalAmount)}
            </Title>
          </div>

          {actualDiscount > 0 && (
            <Text type="success" style={{ fontSize: '12px' }}>
              已节省 {formatPrice(actualDiscount)}
            </Text>
          )}
        </Space>

        {showActions && (
          <>
            <Divider />
            <Button
              type="primary"
              size="large"
              block
              disabled={items.length === 0}
              onClick={onCheckout}
            >
              立即结算 ({items.length} 件商品)
            </Button>
          </>
        )}
      </Spin>
    </Card>
  );
};
