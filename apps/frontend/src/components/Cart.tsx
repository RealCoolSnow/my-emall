'use client';

import React from 'react';
import {
  Card,
  List,
  Button,
  InputNumber,
  Typography,
  Space,
  Image,
  Divider,
  Empty,
  Popconfirm,
  message,
} from 'antd';
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useCart } from '../hooks/useCart';
import { CartItem } from '../types';

const { Title, Text } = Typography;

export const Cart: React.FC = () => {
  const { items, total, itemCount, updateQuantity, removeItem, clearCart } =
    useCart();

  const handleQuantityChange = async (productId: string, quantity: number) => {
    try {
      await updateQuantity(productId, quantity);
    } catch (error) {
      message.error('更新数量失败');
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeItem(productId);
      message.success('商品已从购物车移除');
    } catch (error) {
      message.error('移除商品失败');
    }
  };

  const handleClearCart = () => {
    clearCart();
    message.success('购物车已清空');
  };

  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`;
  };

  if (items.length === 0) {
    return (
      <Card>
        <Empty
          image={<ShoppingOutlined style={{ fontSize: 64, color: '#ccc' }} />}
          description="购物车是空的"
        >
          <Button type="primary" href="/">
            去购物
          </Button>
        </Empty>
      </Card>
    );
  }

  return (
    <div>
      <Card
        title={
          <Space>
            <Title level={4} style={{ margin: 0 }}>
              购物车
            </Title>
            <Text type="secondary">({itemCount} 件商品)</Text>
          </Space>
        }
        extra={
          <Popconfirm
            title="确定要清空购物车吗？"
            onConfirm={handleClearCart}
            okText="确定"
            cancelText="取消"
          >
            <Button danger>清空购物车</Button>
          </Popconfirm>
        }
      >
        <List
          itemLayout="horizontal"
          dataSource={items}
          renderItem={(item: CartItem) => (
            <List.Item
              actions={[
                <Popconfirm
                  key="delete"
                  title="确定要移除这件商品吗？"
                  onConfirm={() => handleRemoveItem(item.productId)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="text" danger icon={<DeleteOutlined />}>
                    移除
                  </Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div style={{
                    width: 80,
                    height: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    border: '1px solid #f0f0f0',
                    borderRadius: '6px'
                  }}>
                    <Image
                      width={80}
                      height={80}
                      src={
                        item.product.imageUrls?.[0] || '/placeholder-image.jpg'
                      }
                      alt={item.product.name}
                      style={{
                        objectFit: 'cover',
                        width: '100%',
                        height: '100%'
                      }}
                      fallback="/placeholder-image.jpg"
                    />
                  </div>
                }
                title={
                  <Space direction="vertical" size="small">
                    <Text strong>{item.product.name}</Text>
                    <Text type="danger" style={{ fontSize: '16px' }}>
                      {formatPrice(item.product.price)}
                    </Text>
                  </Space>
                }
                description={
                  <Space>
                    <Text>数量:</Text>
                    <InputNumber
                      min={1}
                      max={item.product.stock}
                      value={item.quantity}
                      onChange={(value) => {
                        if (value) {
                          handleQuantityChange(item.productId, value);
                        }
                      }}
                      style={{ width: 80 }}
                    />
                    <Text type="secondary">库存: {item.product.stock}</Text>
                  </Space>
                }
              />
              <div style={{ textAlign: 'right', minWidth: 100 }}>
                <Text strong style={{ fontSize: '16px' }}>
                  {formatPrice(item.product.price * item.quantity)}
                </Text>
              </div>
            </List.Item>
          )}
        />

        <Divider />

        <div style={{ textAlign: 'right' }}>
          <Space direction="vertical" size="small">
            <Text>共 {itemCount} 件商品</Text>
            <Title level={3} type="danger" style={{ margin: 0 }}>
              总计: {formatPrice(total)}
            </Title>
            <Button
              type="primary"
              size="large"
              style={{ marginTop: 16 }}
              href="/checkout"
            >
              去结算
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};
