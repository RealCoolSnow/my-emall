'use client';

import React from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Image,
  Tag,
  Space,
  Spin,
  Empty,
  Pagination,
  message,
  Badge,
  Rate,
} from 'antd';
import {
  ShoppingCartOutlined,
  HeartOutlined,
  EyeOutlined,
  FireOutlined,
  StarFilled,
} from '@ant-design/icons';
import { Product, ProductListProps } from '../types';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';

const { Title, Text } = Typography;
const { Meta } = Card;

export const ProductList: React.FC<ProductListProps> = ({
  filters = {},
  pageSize = 12,
}) => {
  const { products, loading, error, pagination, goToPage, setPageSize } =
    useProducts(filters);

  const { addItem } = useCart();

  const handleAddToCart = async (productId: string) => {
    try {
      await addItem(productId, 1);
      message.success('商品已添加到购物车');
    } catch (error) {
      message.error('添加到购物车失败');
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
    const statusInfo =
      statusMap[status as keyof typeof statusMap] || statusMap.ACTIVE;
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text type="danger">{error}</Text>
      </div>
    );
  }

  return (
    <div>
      <Spin spinning={loading}>
        {products.length === 0 && !loading ? (
          <Empty description="暂无商品" style={{ margin: '50px 0' }} />
        ) : (
          <>
            <Row gutter={[20, 20]}>
              {products.map((product: Product, index: number) => (
                <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                  <Badge.Ribbon
                    text={index < 3 ? "热销" : undefined}
                    color="#ff4d4f"
                    style={{ display: index < 3 ? 'block' : 'none' }}
                  >
                    <Card
                      hoverable
                      style={{
                        borderRadius: 16,
                        overflow: 'hidden',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                      }}
                      bodyStyle={{ padding: 16 }}
                      cover={
                        <div style={{ position: 'relative', overflow: 'hidden' }}>
                          <a href={`/products/${product.id}`}>
                            <div
                              style={{
                                height: 220,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                background: '#f8f9fa',
                              }}
                            >
                              <Image
                                alt={product.name}
                                src={
                                  product.imageUrls?.[0] || '/placeholder-image.jpg'
                                }
                                height={220}
                                style={{
                                  objectFit: 'cover',
                                  width: '100%',
                                  height: '100%',
                                  transition: 'transform 0.3s ease',
                                }}
                                fallback="/placeholder-image.jpg"
                                preview={false}
                              />
                            </div>
                          </a>

                          {/* 悬浮操作按钮 */}
                          <div
                            style={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 8,
                            }}
                          >
                            <Button
                              type="text"
                              shape="circle"
                              icon={<HeartOutlined />}
                              style={{
                                background: 'rgba(255,255,255,0.9)',
                                backdropFilter: 'blur(10px)',
                                border: 'none',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              }}
                            />
                            <Button
                              type="text"
                              shape="circle"
                              icon={<EyeOutlined />}
                              href={`/products/${product.id}`}
                              style={{
                                background: 'rgba(255,255,255,0.9)',
                                backdropFilter: 'blur(10px)',
                                border: 'none',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              }}
                            />
                          </div>

                          {/* 状态标签 */}
                          {product.status !== 'ACTIVE' && (
                            <div
                              style={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                              }}
                            >
                              {getStatusTag(product.status)}
                            </div>
                          )}
                        </div>
                      }
                    >
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        {/* 商品名称 */}
                        <Title
                          level={5}
                          ellipsis={{
                            rows: 2,
                            tooltip: product.name,
                          }}
                          style={{
                            margin: 0,
                            fontSize: 14,
                            fontWeight: 500,
                            lineHeight: '20px',
                            height: 40,
                          }}
                        >
                          {product.name}
                        </Title>

                        {/* 评分和销量 */}
                        <Space size="small">
                          <Rate
                            disabled
                            defaultValue={4.5}
                            size="small"
                            style={{ fontSize: 12 }}
                          />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            (128)
                          </Text>
                        </Space>

                        {/* 价格区域 */}
                        <Space align="baseline" style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Space align="baseline">
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: 600,
                                color: '#ff4d4f',
                              }}
                            >
                              {formatPrice(product.price)}
                            </Text>
                            <Text
                              delete
                              type="secondary"
                              style={{ fontSize: 12 }}
                            >
                              ¥{(product.price * 1.2).toFixed(2)}
                            </Text>
                          </Space>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            库存{product.stock}
                          </Text>
                        </Space>

                        {/* 操作按钮 */}
                        <Button
                          type="primary"
                          icon={<ShoppingCartOutlined />}
                          onClick={() => handleAddToCart(product.id)}
                          disabled={
                            product.status !== 'ACTIVE' || product.stock <= 0
                          }
                          block
                          style={{
                            borderRadius: 8,
                            height: 40,
                            marginTop: 8,
                            background: product.status !== 'ACTIVE' || product.stock <= 0
                              ? undefined
                              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                          }}
                        >
                          {product.stock <= 0 ? '缺货' : '加入购物车'}
                        </Button>
                      </Space>
                    </Card>
                  </Badge.Ribbon>
                </Col>
              ))}
            </Row>

            {pagination.total > 0 && (
              <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <Pagination
                  current={pagination.page}
                  total={pagination.total}
                  pageSize={pagination.limit}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) =>
                    `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                  }
                  onChange={goToPage}
                  onShowSizeChange={(current, size) => {
                    setPageSize(size);
                  }}
                  pageSizeOptions={['12', '24', '48', '96']}
                />
              </div>
            )}
          </>
        )}
      </Spin>
    </div>
  );
};
