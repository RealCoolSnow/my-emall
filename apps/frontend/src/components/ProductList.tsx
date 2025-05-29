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
} from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
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
            <Row gutter={[16, 16]}>
              {products.map((product: Product) => (
                <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                  <Card
                    hoverable
                    cover={
                      <a href={`/products/${product.id}`}>
                        <Image
                          alt={product.name}
                          src={product.imageUrls?.[0] || '/placeholder-image.jpg'}
                          height={200}
                          style={{ objectFit: 'cover' }}
                          fallback="/placeholder-image.jpg"
                        />
                      </a>
                    }
                    actions={[
                      <Button
                        key="add-to-cart"
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        onClick={() => handleAddToCart(product.id)}
                        disabled={
                          product.status !== 'ACTIVE' || product.stock <= 0
                        }
                        block
                      >
                        加入购物车
                      </Button>,
                    ]}
                  >
                    <Meta
                      title={
                        <Space
                          direction="vertical"
                          size="small"
                          style={{ width: '100%' }}
                        >
                          <Title
                            level={5}
                            ellipsis={{
                              tooltip: product.name,
                            }}
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {product.name}
                          </Title>
                          <Space>
                            {getStatusTag(product.status)}
                            <Text type="secondary">库存: {product.stock}</Text>
                          </Space>
                        </Space>
                      }
                      description={
                        <Space
                          direction="vertical"
                          size="small"
                          style={{ width: '100%' }}
                        >
                          <Text
                            ellipsis={{
                              tooltip: product.description || '暂无描述',
                            }}
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {product.description || '暂无描述'}
                          </Text>
                          <Title level={4} type="danger">
                            {formatPrice(product.price)}
                          </Title>
                        </Space>
                      }
                    />
                  </Card>
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
