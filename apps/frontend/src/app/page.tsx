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
  Button,
  Badge,
  Avatar,
  Dropdown,
  Carousel,
  Divider,
} from 'antd';
import {
  SearchOutlined,
  ShoppingCartOutlined,
  GiftOutlined,
  LoginOutlined,
  UserOutlined,
  LogoutOutlined,
  HeartOutlined,
  BellOutlined,
  DownOutlined,
  FireOutlined,
  CrownOutlined,
  ThunderboltOutlined,
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

  // 用户菜单
  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <a href="/profile">
          <UserOutlined style={{ marginRight: 8 }} />
          个人中心
        </a>
      ),
    },
    {
      key: 'orders',
      label: (
        <a href="/orders">
          <ShoppingCartOutlined style={{ marginRight: 8 }} />
          我的订单
        </a>
      ),
    },
    {
      key: 'coupons',
      label: (
        <a href="/coupons">
          <GiftOutlined style={{ marginRight: 8 }} />
          我的优惠券
        </a>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: (
        <span onClick={logout} style={{ color: '#ff4d4f' }}>
          <LogoutOutlined style={{ marginRight: 8 }} />
          退出登录
        </span>
      ),
    },
  ];

  return (
    <Layout>
      {/* 顶部导航栏 */}
      <Header
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '0 24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          height: '70px',
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
          {/* Logo */}
          <Col>
            <Space align="center">
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <CrownOutlined style={{ fontSize: 24, color: '#fff' }} />
              </div>
              <Title level={3} style={{ margin: 0, color: '#fff', fontWeight: 600 }}>
                优选商城
              </Title>
            </Space>
          </Col>

          {/* 搜索框 */}
          <Col flex="auto" style={{ maxWidth: 500, margin: '0 40px' }}>
            <Search
              placeholder="搜索你想要的商品..."
              allowClear
              enterButton={
                <Button
                  type="primary"
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <SearchOutlined />
                </Button>
              }
              size="large"
              onSearch={handleSearch}
              style={{
                '& .ant-input': {
                  background: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  borderRadius: '25px 0 0 25px',
                },
              }}
            />
          </Col>

          {/* 右侧菜单 */}
          <Col>
            <Space size="large">
              {/* 购物车 */}
              <Badge count={itemCount} size="small">
                <Button
                  type="text"
                  href="/cart"
                  style={{
                    color: '#fff',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '8px 16px',
                    height: 'auto',
                  }}
                >
                  <Space>
                    <ShoppingCartOutlined style={{ fontSize: 18 }} />
                    <Text style={{ color: '#fff' }}>购物车</Text>
                  </Space>
                </Button>
              </Badge>

              {/* 收藏 */}
              <Button
                type="text"
                style={{
                  color: '#fff',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '8px 16px',
                  height: 'auto',
                }}
              >
                <HeartOutlined style={{ fontSize: 18 }} />
              </Button>

              {/* 通知 */}
              <Badge dot>
                <Button
                  type="text"
                  style={{
                    color: '#fff',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '8px 16px',
                    height: 'auto',
                  }}
                >
                  <BellOutlined style={{ fontSize: 18 }} />
                </Button>
              </Badge>

              {/* 用户菜单 */}
              {isAuthenticated ? (
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                  <Button
                    type="text"
                    style={{
                      color: '#fff',
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '8px 16px',
                      height: 'auto',
                    }}
                  >
                    <Space>
                      <Avatar
                        size="small"
                        style={{ background: '#fff', color: '#667eea' }}
                        icon={<UserOutlined />}
                      />
                      <Text style={{ color: '#fff' }}>
                        {user?.username || '用户'}
                      </Text>
                      <DownOutlined style={{ fontSize: 12 }} />
                    </Space>
                  </Button>
                </Dropdown>
              ) : (
                <Button
                  type="primary"
                  href="/login"
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                  }}
                >
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

      <Content style={{ background: '#f5f5f5', minHeight: 'calc(100vh - 70px)' }}>
        {/* 轮播图区域 */}
        <div style={{ background: '#fff', marginBottom: 24 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
            <Carousel autoplay effect="fade" className="hero-carousel" style={{ borderRadius: 12, overflow: 'hidden' }}>
              <div>
                <div
                  style={{
                    height: 300,
                    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 24,
                    fontWeight: 'bold',
                  }}
                >
                  <Space direction="vertical" align="center">
                    <FireOutlined style={{ fontSize: 48 }} />
                    <Title level={2} style={{ color: '#fff', margin: 0 }}>
                      热销爆款 限时特惠
                    </Title>
                    <Text style={{ color: '#fff', fontSize: 16 }}>
                      精选好物，品质保证，享受购物乐趣
                    </Text>
                  </Space>
                </div>
              </div>
              <div>
                <div
                  style={{
                    height: 300,
                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#333',
                    fontSize: 24,
                    fontWeight: 'bold',
                  }}
                >
                  <Space direction="vertical" align="center">
                    <ThunderboltOutlined style={{ fontSize: 48 }} />
                    <Title level={2} style={{ color: '#333', margin: 0 }}>
                      新品首发 抢先体验
                    </Title>
                    <Text style={{ color: '#666', fontSize: 16 }}>
                      最新潮流，引领时尚，做最酷的自己
                    </Text>
                  </Space>
                </div>
              </div>
              <div>
                <div
                  style={{
                    height: 300,
                    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#333',
                    fontSize: 24,
                    fontWeight: 'bold',
                  }}
                >
                  <Space direction="vertical" align="center">
                    <GiftOutlined style={{ fontSize: 48 }} />
                    <Title level={2} style={{ color: '#333', margin: 0 }}>
                      会员专享 超值优惠
                    </Title>
                    <Text style={{ color: '#666', fontSize: 16 }}>
                      专属福利，尊享服务，会员价更优惠
                    </Text>
                  </Space>
                </div>
              </div>
            </Carousel>
          </div>
        </div>

        {/* 快捷分类 */}
        <div style={{ background: '#fff', marginBottom: 24 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
            <Title level={4} style={{ marginBottom: 16 }}>
              热门分类
            </Title>
            <Row gutter={[16, 16]}>
              {[
                { name: '数码电子', icon: '📱', color: '#1890ff' },
                { name: '服装配饰', icon: '👕', color: '#722ed1' },
                { name: '家居生活', icon: '🏠', color: '#13c2c2' },
                { name: '美妆护肤', icon: '💄', color: '#eb2f96' },
                { name: '运动户外', icon: '⚽', color: '#52c41a' },
                { name: '图书文具', icon: '📚', color: '#fa8c16' },
                { name: '食品饮料', icon: '🍎', color: '#f5222d' },
                { name: '母婴用品', icon: '🍼', color: '#faad14' },
              ].map((category, index) => (
                <Col xs={6} sm={4} md={3} key={index}>
                  <Card
                    hoverable
                    className="category-card"
                    style={{
                      background: `${category.color}10`,
                    }}
                    bodyStyle={{ padding: '16px 8px' }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>
                      {category.icon}
                    </div>
                    <Text style={{ fontSize: 12, color: category.color, fontWeight: 500 }}>
                      {category.name}
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>

        {/* 商品展示区域 */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 24px' }}>
          <Card
            className="modern-card fade-in-up"
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <Title level={2} style={{ marginBottom: 8 }}>
                <FireOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                精选好物
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                为您精心挑选的优质商品，品质保证，值得信赖
              </Text>
            </div>

            <ProductList pageSize={12} />
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
