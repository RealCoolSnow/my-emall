'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  List,
  Tag,
  Typography,
  Space,
  message,
  Divider,
  Empty,
  Spin,
} from 'antd';
import { PlusOutlined, DeleteOutlined, GiftOutlined } from '@ant-design/icons';
import { Coupon } from 'coupons/types';
import { useCoupons } from '../hooks/useCoupons';
import { CouponSelectorProps } from '../types';

const { Title, Text } = Typography;

export const CouponSelector: React.FC<CouponSelectorProps> = ({
  orderTotal,
  onCouponsChange,
  selectedCoupons = [],
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [addingCoupon, setAddingCoupon] = useState(false);

  const {
    availableCoupons,
    loading,
    error,
    addCoupon,
    removeCoupon,
    calculateDiscount,
  } = useCoupons();

  // 当选中的优惠券改变时，通知父组件
  useEffect(() => {
    onCouponsChange(selectedCoupons);
  }, [selectedCoupons, onCouponsChange]);

  const handleAddCoupon = async () => {
    if (!couponCode.trim()) {
      message.warning('请输入优惠券代码');
      return;
    }

    setAddingCoupon(true);
    try {
      const result = await addCoupon(couponCode, {
        subtotal: orderTotal,
        items: [], // 这里应该传入实际的订单项目
      });

      if (result.success) {
        message.success('优惠券添加成功');
        setCouponCode('');
      } else {
        message.error(result.error || '添加优惠券失败');
      }
    } catch (error) {
      message.error('添加优惠券失败');
    } finally {
      setAddingCoupon(false);
    }
  };

  const handleRemoveCoupon = (couponId: string) => {
    removeCoupon(couponId);
    message.success('优惠券已移除');
  };

  const formatCouponValue = (coupon: Coupon) => {
    switch (coupon.type) {
      case 'FIXED_AMOUNT':
        return `¥${coupon.value}`;
      case 'PERCENTAGE':
        return `${coupon.value}%`;
      case 'FREE_SHIPPING':
        return '免运费';
      default:
        return `¥${coupon.value}`;
    }
  };

  const getCouponTypeTag = (type: string) => {
    const typeMap = {
      FIXED_AMOUNT: { color: 'red', text: '满减' },
      PERCENTAGE: { color: 'orange', text: '折扣' },
      FREE_SHIPPING: { color: 'blue', text: '包邮' },
    };
    const typeInfo = typeMap[type as keyof typeof typeMap] || typeMap.FIXED_AMOUNT;
    return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
  };

  const isExpired = (endDate: Date) => {
    return new Date(endDate) < new Date();
  };

  const isMinAmountMet = (coupon: Coupon) => {
    return !coupon.minAmount || orderTotal >= coupon.minAmount;
  };

  return (
    <Card
      title={
        <Space>
          <GiftOutlined />
          <Title level={4} style={{ margin: 0 }}>
            优惠券
          </Title>
        </Space>
      }
    >
      {/* 添加优惠券 */}
      <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
        <Input
          placeholder="输入优惠券代码"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          onPressEnter={handleAddCoupon}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          loading={addingCoupon}
          onClick={handleAddCoupon}
        >
          添加
        </Button>
      </Space.Compact>

      {/* 已选择的优惠券 */}
      {selectedCoupons.length > 0 && (
        <>
          <Title level={5}>已选择的优惠券</Title>
          <List
            size="small"
            dataSource={selectedCoupons}
            renderItem={(coupon: Coupon) => (
              <List.Item
                actions={[
                  <Button
                    key="remove"
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveCoupon(coupon.id)}
                  >
                    移除
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      {getCouponTypeTag(coupon.type)}
                      <Text strong>{coupon.name}</Text>
                      <Text type="danger">{formatCouponValue(coupon)}</Text>
                    </Space>
                  }
                  description={coupon.description}
                />
              </List.Item>
            )}
          />
          <Divider />
        </>
      )}

      {/* 可用优惠券列表 */}
      <Title level={5}>可用优惠券</Title>
      <Spin spinning={loading}>
        {error ? (
          <Text type="danger">{error}</Text>
        ) : availableCoupons.length === 0 ? (
          <Empty description="暂无可用优惠券" />
        ) : (
          <List
            size="small"
            dataSource={availableCoupons.filter(
              coupon => !selectedCoupons.some(selected => selected.id === coupon.id)
            )}
            renderItem={(coupon: Coupon) => {
              const expired = isExpired(coupon.endDate);
              const minAmountMet = isMinAmountMet(coupon);
              const canUse = !expired && minAmountMet && coupon.isActive;

              return (
                <List.Item
                  actions={[
                    <Button
                      key="add"
                      type="link"
                      size="small"
                      disabled={!canUse}
                      onClick={() => setCouponCode(coupon.code)}
                    >
                      使用
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        {getCouponTypeTag(coupon.type)}
                        <Text strong={canUse} disabled={!canUse}>
                          {coupon.name}
                        </Text>
                        <Text type="danger">{formatCouponValue(coupon)}</Text>
                        {expired && <Tag color="red">已过期</Tag>}
                        {!minAmountMet && (
                          <Tag color="orange">
                            满¥{coupon.minAmount}可用
                          </Tag>
                        )}
                      </Space>
                    }
                    description={
                      <Text type="secondary" disabled={!canUse}>
                        {coupon.description}
                        {coupon.minAmount && (
                          <span> · 满¥{coupon.minAmount}可用</span>
                        )}
                        <span> · 有效期至{new Date(coupon.endDate).toLocaleDateString()}</span>
                      </Text>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Spin>
    </Card>
  );
};
