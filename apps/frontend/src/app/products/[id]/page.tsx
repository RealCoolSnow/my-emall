'use client';

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Row,
  Col,
  Button,
  Space,
  Image,
  Tag,
  InputNumber,
  Divider,
  Card,
  Spin,
  message,
  Breadcrumb,
} from 'antd';
import {
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { useCart } from '../../../hooks/useCart';
import productService from '../../../services/productService';
import { Product } from 'shared/types';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const { addItem } = useCart();

  const productId = params.id as string;

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const productData = await productService.getProduct(productId);
        setProduct(productData);
      } catch (error) {
        message.error('加载商品详情失败');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId, router]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    try {
      await addItem(product.id, quantity);
      message.success(`已添加 ${quantity} 件商品到购物车`);
    } catch (error) {
      message.error('添加到购物车失败');
    } finally {
      setAddingToCart(false);
    }
  };

  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`;
  };

  const getStatusTag = (status: string) => {
    const statusMap = {
      ACTIVE: { color: 'green', text: '在售' },
      INACTIVE: { color: 'gray', text: '下架' },
      OUT_OF_STOCK: { color: 'red', text: '缺货' },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.ACTIVE;
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

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

  if (!product) {
    return null;
  }

  return (
    <Layout>
      <Header style={{ 
        background: '#fff', 
        padding: '0 50px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Space align="center" style={{ height: '100%' }}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
          >
            返回
          </Button>
          <Breadcrumb>
            <Breadcrumb.Item>
              <a href="/">首页</a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>商品详情</Breadcrumb.Item>
          </Breadcrumb>
        </Space>
      </Header>

      <Content style={{ padding: '50px', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[48, 48]}>
            {/* 商品图片 */}
            <Col xs={24} md={12}>
              <Card>
                <Image
                  src={product.imageUrls?.[0] || '/placeholder-image.jpg'}
                  alt={product.name}
                  style={{ width: '100%', maxHeight: 500, objectFit: 'cover' }}
                  fallback="/placeholder-image.jpg"
                />
                {product.imageUrls && product.imageUrls.length > 1 && (
                  <div style={{ marginTop: 16 }}>
                    <Row gutter={8}>
                      {product.imageUrls.slice(1, 5).map((url, index) => (
                        <Col span={6} key={index}>
                          <Image
                            src={url}
                            alt={`${product.name} ${index + 2}`}
                            style={{ width: '100%', height: 80, objectFit: 'cover' }}
                            fallback="/placeholder-image.jpg"
                          />
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
              </Card>
            </Col>

            {/* 商品信息 */}
            <Col xs={24} md={12}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Space>
                    {getStatusTag(product.status)}
                    <Text type="secondary">商品ID: {product.id}</Text>
                  </Space>
                  <Title level={2} style={{ margin: '8px 0' }}>
                    {product.name}
                  </Title>
                  <Title level={1} type="danger" style={{ margin: 0 }}>
                    {formatPrice(product.price)}
                  </Title>
                </div>

                <Divider />

                <div>
                  <Text strong>商品描述：</Text>
                  <Paragraph style={{ marginTop: 8 }}>
                    {product.description || '暂无详细描述'}
                  </Paragraph>
                </div>

                <div>
                  <Space>
                    <Text strong>库存：</Text>
                    <Text>{product.stock} 件</Text>
                  </Space>
                </div>

                <div>
                  <Space>
                    <Text strong>数量：</Text>
                    <InputNumber
                      min={1}
                      max={product.stock}
                      value={quantity}
                      onChange={(value) => setQuantity(value || 1)}
                      style={{ width: 120 }}
                    />
                  </Space>
                </div>

                <Divider />

                <Space size="large">
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    loading={addingToCart}
                    disabled={product.status !== 'ACTIVE' || product.stock <= 0}
                    onClick={handleAddToCart}
                  >
                    加入购物车
                  </Button>
                  <Button
                    size="large"
                    disabled={product.status !== 'ACTIVE' || product.stock <= 0}
                    onClick={() => {
                      handleAddToCart().then(() => {
                        router.push('/checkout');
                      });
                    }}
                  >
                    立即购买
                  </Button>
                </Space>

                <Space>
                  <Button type="text" icon={<HeartOutlined />}>
                    收藏
                  </Button>
                  <Button type="text" icon={<ShareAltOutlined />}>
                    分享
                  </Button>
                </Space>
              </Space>
            </Col>
          </Row>

          {/* 商品详细信息 */}
          <Row style={{ marginTop: 48 }}>
            <Col span={24}>
              <Card title="商品详情">
                <Paragraph>
                  {product.description || '暂无详细信息'}
                </Paragraph>
                
                <Title level={4}>商品规格</Title>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Text strong>商品名称：</Text>
                    <Text>{product.name}</Text>
                  </Col>
                  <Col span={8}>
                    <Text strong>商品价格：</Text>
                    <Text>{formatPrice(product.price)}</Text>
                  </Col>
                  <Col span={8}>
                    <Text strong>库存数量：</Text>
                    <Text>{product.stock} 件</Text>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
}
