'use client';

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Row,
  Col,
  Card,
  List,
  Tag,
  Button,
  Space,
  Input,
  message,
  Tabs,
  Empty,
  Spin,
  Statistic,
} from 'antd';
import {
  GiftOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import userCouponService, {
  UserCoupon,
  UserCouponStats,
} from '../../services/userCouponService';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function CouponsPage() {
  const [userCoupons, setUserCoupons] = useState<UserCoupon[]>([]);
  const [stats, setStats] = useState<UserCouponStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [activeTab, setActiveTab] = useState('available');

  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleGoBack = () => {
    // 尝试返回上一页，如果没有历史记录则返回首页
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/coupons');
      return;
    }
    loadData();
  }, [isAuthenticated, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [couponsData, statsData] = await Promise.all([
        userCouponService.getUserCoupons(true), // 包含已使用的
        userCouponService.getUserCouponStats(),
      ]);
      setUserCoupons(couponsData);
      setStats(statsData);
    } catch (error) {
      message.error('加载优惠券数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimCoupon = async () => {
    if (!couponCode.trim()) {
      message.warning('请输入优惠券代码');
      return;
    }

    setClaimLoading(true);
    try {
      await userCouponService.claimCoupon(couponCode);
      message.success('优惠券领取成功！');
      setCouponCode('');
      loadData(); // 重新加载数据
    } catch (error: any) {
      message.error(error.response?.data?.message || '领取优惠券失败');
    } finally {
      setClaimLoading(false);
    }
  };

  const formatCouponValue = (coupon: UserCoupon['coupon']) => {
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
    const typeInfo =
      typeMap[type as keyof typeof typeMap] || typeMap.FIXED_AMOUNT;
    return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const getFilteredCoupons = () => {
    const now = new Date();
    switch (activeTab) {
      case 'available':
        return userCoupons.filter(
          (uc) =>
            !uc.isUsed && !isExpired(uc.coupon.endDate) && uc.coupon.isActive
        );
      case 'used':
        return userCoupons.filter((uc) => uc.isUsed);
      case 'expired':
        return userCoupons.filter(
          (uc) => !uc.isUsed && isExpired(uc.coupon.endDate)
        );
      default:
        return userCoupons;
    }
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
            我的优惠券
          </Title>
        </Space>
      </Header>

      <Content style={{ padding: '50px', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Spin spinning={loading}>
            {/* 统计信息 */}
            {stats && (
              <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                <Col xs={12} sm={6}>
                  <Card>
                    <Statistic
                      title="总计"
                      value={stats.total}
                      prefix={<GiftOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card>
                    <Statistic
                      title="可用"
                      value={stats.available}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card>
                    <Statistic
                      title="已使用"
                      value={stats.used}
                      prefix={<ClockCircleOutlined />}
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card>
                    <Statistic
                      title="已过期"
                      value={stats.expired}
                      prefix={<ExclamationCircleOutlined />}
                      valueStyle={{ color: '#d46b08' }}
                    />
                  </Card>
                </Col>
              </Row>
            )}

            {/* 领取优惠券 */}
            <Card style={{ marginBottom: 24 }}>
              <Title level={4}>领取优惠券</Title>
              <Space.Compact style={{ width: '100%', maxWidth: 400 }}>
                <Input
                  placeholder="输入优惠券代码"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  onPressEnter={handleClaimCoupon}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  loading={claimLoading}
                  onClick={handleClaimCoupon}
                >
                  领取
                </Button>
              </Space.Compact>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  可用代码: WELCOME10, SAVE50, FREESHIP, SUMMER20
                </Text>
              </div>
            </Card>

            {/* 优惠券列表 */}
            <Card>
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                  {
                    key: 'available',
                    label: `可用 (${stats?.available || 0})`,
                    children: (
                      <List
                        dataSource={getFilteredCoupons()}
                        renderItem={(userCoupon) => (
                          <CouponItem userCoupon={userCoupon} />
                        )}
                        locale={{
                          emptyText: <Empty description="暂无可用优惠券" />,
                        }}
                      />
                    ),
                  },
                  {
                    key: 'used',
                    label: `已使用 (${stats?.used || 0})`,
                    children: (
                      <List
                        dataSource={getFilteredCoupons()}
                        renderItem={(userCoupon) => (
                          <CouponItem userCoupon={userCoupon} />
                        )}
                        locale={{
                          emptyText: <Empty description="暂无已使用优惠券" />,
                        }}
                      />
                    ),
                  },
                  {
                    key: 'expired',
                    label: `已过期 (${stats?.expired || 0})`,
                    children: (
                      <List
                        dataSource={getFilteredCoupons()}
                        renderItem={(userCoupon) => (
                          <CouponItem userCoupon={userCoupon} />
                        )}
                        locale={{
                          emptyText: <Empty description="暂无过期优惠券" />,
                        }}
                      />
                    ),
                  },
                ]}
              />
            </Card>
          </Spin>
        </div>
      </Content>
    </Layout>
  );
}

// 优惠券项组件
const CouponItem: React.FC<{ userCoupon: UserCoupon }> = ({ userCoupon }) => {
  const { coupon, isUsed, usedAt, obtainedAt } = userCoupon;

  const formatCouponValue = (coupon: UserCoupon['coupon']) => {
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
    const typeInfo =
      typeMap[type as keyof typeof typeMap] || typeMap.FIXED_AMOUNT;
    return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
  };

  const isExpired = new Date(coupon.endDate) < new Date();

  return (
    <List.Item>
      <List.Item.Meta
        title={
          <Space>
            {getCouponTypeTag(coupon.type)}
            <Text strong={!isUsed && !isExpired} disabled={isUsed || isExpired}>
              {coupon.name}
            </Text>
            <Text type="danger">{formatCouponValue(coupon)}</Text>
            {isUsed && <Tag color="gray">已使用</Tag>}
            {!isUsed && isExpired && <Tag color="red">已过期</Tag>}
          </Space>
        }
        description={
          <div>
            <Text type="secondary" disabled={isUsed || isExpired}>
              {coupon.description}
              {coupon.minAmount && <span> · 满¥{coupon.minAmount}可用</span>}
              <span>
                {' '}
                · 有效期至{new Date(coupon.endDate).toLocaleDateString()}
              </span>
            </Text>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                获得时间: {new Date(obtainedAt).toLocaleString()}
                {isUsed && usedAt && (
                  <span> · 使用时间: {new Date(usedAt).toLocaleString()}</span>
                )}
              </Text>
            </div>
          </div>
        }
      />
    </List.Item>
  );
};
